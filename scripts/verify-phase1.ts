import assert from 'node:assert';
import { NextRequest } from 'next/server';
import { calculateTrustScore, getTrustTier } from '../src/lib/trust/trust-engine';
import { isValidUpiVpa, generateValidUpiUrl } from '../src/lib/trust/upi-validator';
import {
  checkTransactionLock,
  acquireTransactionLock,
  completeTransactionLock,
  releaseTransactionLock,
  clearAllLocks,
} from '../src/lib/sync/mutex-lock';
import { generateReminderDraft, normalizeIndianPhoneNumber } from '../src/lib/whatsapp/reminder-engine';
import { renderReminderMessage } from '../src/lib/whatsapp/templates';
import { POST as dualSyncPost, OPTIONS as dualSyncOptions } from '../src/app/api/dual-sync/route';
import { POST as remindersPost } from '../src/app/api/reminders/generate/route';
import { GET as ledgerGet } from '../src/app/api/ledger/route';
import { GET as inventoryGet } from '../src/app/api/inventory/route';
import { GET as customersGet } from '../src/app/api/customers/route';
import { getDbAdapter } from '../src/lib/db/supabase';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res
        .then(() => {
          console.log(`  ✓ ${name}`);
          passed++;
        })
        .catch((err) => {
          console.error(`  ✗ ${name}`);
          console.error(`    ${err.message}`);
          failed++;
        });
    } else {
      console.log(`  ✓ ${name}`);
      passed++;
    }
  } catch (err: any) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

async function runAllTests() {
  console.log('\n=== Verifying Phase 1: KV-10, KV-11, KV-12, KV-13 ===\n');

  // --- KV-10: Trust Engine Tests ---
  console.log('[KV-10: Kirana Trust Score Engine]');
  test('Cold-start customer (F < 2) receives provisional score 70 and SILVER tier', () => {
    const res = calculateTrustScore({
      avgRepaymentDays: 0,
      overdueRatio: 0,
      transactionCount: 1,
    });
    assert.strictEqual(res.score, 70);
    assert.strictEqual(res.tier, 'SILVER');
    assert.strictEqual(res.maxCreditLimit, 1500);
  });

  test('Punctual customer (V=2, R=0, F=15, D=0) achieves GOLD tier (score >= 85)', () => {
    const res = calculateTrustScore({
      avgRepaymentDays: 2,
      overdueRatio: 0,
      transactionCount: 15,
      disputes: 0,
    });
    assert.ok(res.score >= 85, `Expected score >= 85, got ${res.score}`);
    assert.strictEqual(res.tier, 'GOLD');
    assert.strictEqual(res.maxCreditLimit, 5000);
  });

  test('Customer with V=5, R=0, F=15 receives score 83 (SILVER tier)', () => {
    const res = calculateTrustScore({
      avgRepaymentDays: 5,
      overdueRatio: 0,
      transactionCount: 15,
      disputes: 0,
    });
    assert.strictEqual(res.score, 83);
    assert.strictEqual(res.tier, 'SILVER');
    assert.strictEqual(res.maxCreditLimit, 1500);
  });

  test('High-risk customer (V=40, R=0.8, F=3, D=2) drops to BRONZE tier (score < 65)', () => {
    const res = calculateTrustScore({
      avgRepaymentDays: 40,
      overdueRatio: 0.8,
      transactionCount: 3,
      disputes: 2,
    });
    assert.ok(res.score < 65, `Expected score < 65, got ${res.score}`);
    assert.strictEqual(res.tier, 'BRONZE');
    assert.strictEqual(res.maxCreditLimit, 0);
  });

  test('Score is clamped strictly within [0, 100]', () => {
    const worstCase = calculateTrustScore({
      avgRepaymentDays: 100,
      overdueRatio: 1,
      transactionCount: 0,
      disputes: 10,
    });
    assert.strictEqual(worstCase.score, 70); // Cold start catches F=0

    const worstCaseEstablished = calculateTrustScore({
      avgRepaymentDays: 100,
      overdueRatio: 1,
      transactionCount: 10,
      disputes: 10,
    });
    assert.strictEqual(worstCaseEstablished.score, 0);
  });

  // --- KV-10: UPI Validator Tests ---
  console.log('\n[KV-10: Strict RFC 3986 UPI Validator]');
  test('Validates legitimate NPCI VPAs', () => {
    assert.ok(isValidUpiVpa('ramesh.kirana@okicici'));
    assert.ok(isValidUpiVpa('shop99@paytm'));
    assert.ok(isValidUpiVpa('maa_tara.store@hdfcbank'));
    assert.ok(!isValidUpiVpa('invalid-vpa-no-at'));
    assert.ok(!isValidUpiVpa('@onlyhandle'));
    assert.ok(!isValidUpiVpa('spaces in@vpa'));
  });

  test('Generates RFC 3986 compliant UPI URI escaping special chars', () => {
    const uri = generateValidUpiUrl({
      vpa: 'ramesh.kirana@okaxis',
      payeeName: 'Maa Tara & Sons (Ramesh)',
      amount: 260.5,
      note: 'Bengali Udhaar: চাল ও ডাল',
    });
    assert.ok(uri.startsWith('upi://pay?'));
    assert.ok(uri.includes('pa=ramesh.kirana%40okaxis'));
    assert.ok(uri.includes('pn=Maa%20Tara%20%26%20Sons%20(Ramesh)'));
    assert.ok(uri.includes('am=260.50'));
    assert.ok(uri.includes('cu=INR'));
    assert.ok(!uri.includes('&Sons')); // Confirms ampersand was safely encoded
  });

  test('Throws error on malformed UPI VPA', () => {
    assert.throws(() => {
      generateValidUpiUrl({
        vpa: 'not-a-valid-vpa',
        payeeName: 'Test',
        amount: 100,
      });
    }, /Invalid UPI VPA format/);
  });

  // --- KV-11: Mutex Lock & POST /api/dual-sync ---
  console.log('\n[KV-11: Mutex Lock & Route Handler POST /api/dual-sync]');
  test('Acquires and releases transaction locks', () => {
    clearAllLocks();
    const key = 'test-lock-1';
    assert.ok(acquireTransactionLock(key));
    assert.ok(!acquireTransactionLock(key)); // Cannot acquire twice
    const check1 = checkTransactionLock(key);
    assert.strictEqual(check1.isLocked, true);
    assert.strictEqual(check1.status, 'pending');

    releaseTransactionLock(key);
    const check2 = checkTransactionLock(key);
    assert.strictEqual(check2.isLocked, false);
  });

  test('Caches completed transactions for idempotency deduplication', () => {
    clearAllLocks();
    const key = 'idempotent-key-123';
    acquireTransactionLock(key);
    completeTransactionLock(key, {
      success: true,
      ledger_entry_id: 'ledger-mock-1',
      customer: null,
      updated_inventory: [],
    });

    const status = checkTransactionLock(key);
    assert.strictEqual(status.isLocked, true);
    assert.strictEqual(status.status, 'completed');
    assert.strictEqual(status.cachedResult?.ledger_entry_id, 'ledger-mock-1');
  });

  await test('POST /api/dual-sync handles valid transaction atomically', async () => {
    clearAllLocks();
    const req = new NextRequest('http://localhost:3000/api/dual-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: 'Shyam Sundar',
        transaction_type: 'udhaar_sale',
        amount: 120,
        items: [{ name: 'Mustard Oil (1L)', quantity: 1, unit: 'bottle', price: 120 }],
        raw_transcript: 'শ্যামবাবু ১ বোতল সরষের তেল বাকি ১২০ টাকা',
        language: 'bn',
        idempotency_key: 'test-sync-' + Date.now(),
      }),
    });

    const res = await dualSyncPost(req);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.ledger_entry_id);
    assert.ok(body.data.customer);
    assert.strictEqual(res.headers.get('x-storage-mode'), 'local');
  });

  await test('POST /api/dual-sync returns idempotent response for replayed key', async () => {
    const replayKey = 'replay-key-' + Date.now();
    const payload = {
      customer_name: 'Rohit Gupta',
      transaction_type: 'udhaar_sale',
      amount: 50,
      items: [{ name: 'Toor Dal (1kg)', quantity: 1, unit: 'kg', price: 50 }],
      idempotency_key: replayKey,
    };

    const req1 = new NextRequest('http://localhost:3000/api/dual-sync', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const res1 = await dualSyncPost(req1);
    const body1 = await res1.json();
    assert.strictEqual(res1.status, 200);

    // Replay identical request
    const req2 = new NextRequest('http://localhost:3000/api/dual-sync', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const res2 = await dualSyncPost(req2);
    const body2 = await res2.json();
    assert.strictEqual(res2.status, 200);
    assert.strictEqual(body2.is_duplicate, true);
    assert.strictEqual(res2.headers.get('x-idempotent-replay'), 'true');
    assert.strictEqual(body1.data.ledger_entry_id, body2.data.ledger_entry_id);
  });

  // --- KV-12: WhatsApp Reminder Engine & POST /api/reminders/generate ---
  console.log('\n[KV-12: Multilingual WhatsApp Reminder Engine]');
  test('Normalizes Indian phone numbers accurately', () => {
    assert.strictEqual(normalizeIndianPhoneNumber('9876543210'), '919876543210');
    assert.strictEqual(normalizeIndianPhoneNumber('+91 98765-43210'), '919876543210');
    assert.strictEqual(normalizeIndianPhoneNumber('09876543210'), '919876543210');
  });

  test('Renders polite Bengali reminder with embedded UPI link', () => {
    const draft = generateReminderDraft({
      customerName: 'শ্যামবাবু',
      customerPhone: '9876543210',
      balance: 260,
      tone: 'polite',
      language: 'bn',
      merchantStoreName: 'মা তারা ভ্যারাইটি স্টোর',
      merchantUpiVpa: 'ramesh.kirana@okicici',
    });
    assert.ok(draft.formattedText.includes('নমস্কার শ্যামবাবু বাবু'));
    assert.ok(draft.formattedText.includes('₹260'));
    assert.ok(draft.upiUrl.startsWith('upi://pay?'));
    assert.ok(draft.waUrl.startsWith('https://wa.me/919876543210?text='));
    assert.ok(draft.webWaUrl.startsWith('https://web.whatsapp.com/send?phone=919876543210&text='));
  });

  test('Renders friendly Hindi reminder with embedded UPI link', () => {
    const draft = generateReminderDraft({
      customerName: 'रोहित',
      customerPhone: '9876543210',
      balance: 500,
      tone: 'friendly',
      language: 'hi',
      merchantStoreName: 'माँ तारा किराना स्टोर',
      merchantUpiVpa: 'ramesh.kirana@okicici',
    });
    assert.ok(draft.formattedText.includes('हैलो रोहित जी'));
    assert.ok(draft.formattedText.includes('₹500'));
    assert.ok(draft.waUrl.includes('https://wa.me/919876543210'));
  });

  await test('POST /api/reminders/generate endpoint responds with draft', async () => {
    const req = new NextRequest('http://localhost:3000/api/reminders/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Sunita Devi',
        customerPhone: '9830123456',
        balance: 310,
        tone: 'polite',
        language: 'en',
      }),
    });

    const res = await remindersPost(req);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.draft.formattedText.includes('Sunita Devi'));
    assert.ok(body.draft.waUrl.includes('919830123456'));
  });

  // --- KV-13: Read Routes (Ledger, Inventory, Customers) ---
  console.log('\n[KV-13: Query Routes (Ledger, Inventory, Customers)]');
  await test('GET /api/ledger returns ledger entries with aggregates', async () => {
    const req = new NextRequest('http://localhost:3000/api/ledger?limit=10');
    const res = await ledgerGet(req);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.metrics.total_entries >= 0);
  });

  await test('GET /api/inventory returns SKUs and low-stock filter', async () => {
    const req = new NextRequest('http://localhost:3000/api/inventory?lowStockOnly=false');
    const res = await inventoryGet(req);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.length > 0);
    assert.strictEqual(typeof body.metrics.low_stock_count, 'number');
    assert.strictEqual(typeof body.metrics.total_inventory_value, 'number');
  });

  await test('GET /api/customers returns customer profiles and debtor metrics', async () => {
    const req = new NextRequest('http://localhost:3000/api/customers?filter=all');
    const res = await customersGet(req);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.length > 0);
    assert.ok(body.metrics.total_customers > 0);
    assert.ok(body.metrics.avg_trust_score >= 0 && body.metrics.avg_trust_score <= 100);
  });

  console.log(`\n========================================`);
  console.log(`Phase 1 Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
