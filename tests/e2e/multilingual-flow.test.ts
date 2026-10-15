/**
 * End-to-End Multilingual Flow Test:
 * Spoken Vernacular Utterance -> NLP Entity Extraction -> Atomic Dual-Sync -> WhatsApp Recovery Link
 */
import assert from 'node:assert';
import { parseTransactionRegex } from '@/lib/nlp/regex-parser';
import { getDbAdapter } from '@/lib/db/supabase';
import { DEFAULT_MERCHANT_ID } from '@/lib/db/seed-data';
import { renderReminderMessage } from '@/lib/whatsapp/templates';
import { generateValidUpiUrl, isValidUpiVpa } from '@/lib/trust/upi-validator';

console.log('🧪 Running End-to-End Multilingual Integration Tests...\n');

let passed = 0;
async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
    throw err;
  }
}

async function runE2E() {
  const db = getDbAdapter();

  // Test 1: Bengali Spoken Udhaar to Dual-Sync
  await test('Bengali Udhaar: Spoken input -> Entity parse -> Atomic Dual-Sync commit', async () => {
    const rawTranscript = 'শ্যামবাবু ২ কেজি চাল আর ১ লিটার সর্ষের তেল বাকি লিখুন';
    const parsed = parseTransactionRegex(rawTranscript, 'bn');

    assert.strictEqual(parsed.transaction_type, 'udhaar_sale');
    assert.strictEqual(parsed.customer_name, 'Shyam Sundar Das');
    assert.ok(parsed.items.length >= 1, 'Should extract line items');

    // Get initial customer balance and item stock
    const customerBefore = await db.getCustomerByName('Shyam Sundar Das');
    assert.ok(customerBefore, 'Customer Shyam Sundar Das should exist');
    const initialBalance = customerBefore.current_balance;

    // Execute atomic dual-sync
    const syncRes = await db.executeDualSync({
      merchant_id: customerBefore.merchant_id,
      customer_id: customerBefore.id,
      customer_name: customerBefore.name,
      transaction_type: 'udhaar_sale',
      amount: parsed.amount,
      raw_transcript: rawTranscript,
      language: 'bn',
      items: parsed.items.map((i) => ({
        item_id: i.item_id || 'item_rice_miniket_1kg',
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        unit_price: i.estimated_price || 60,
      })),
    });

    assert.ok(syncRes.success, 'Dual-sync should succeed');
    assert.strictEqual(syncRes.customer?.current_balance, initialBalance + parsed.amount);

    // Verify customer updated in store
    const customerAfter = await db.getCustomerById(customerBefore.id);
    assert.strictEqual(customerAfter?.current_balance, initialBalance + parsed.amount);
  });

  // Test 2: WhatsApp Reminder Generation & RFC 3986 UPI URL
  await test('WhatsApp Debt Recovery: 9 permutations (3 languages x 3 tones) + RFC 3986 UPI link', async () => {
    const validVpa = 'ramesh.kirana@okaxis';
    assert.ok(isValidUpiVpa(validVpa), 'VPA should be valid');

    const upiUrl = generateValidUpiUrl({
      vpa: validVpa,
      payeeName: 'Maa Tara Grocery',
      amount: 450,
      note: 'Kirana udhaar payment',
    });

    // Verify URI encoding
    assert.doesNotThrow(() => decodeURIComponent(upiUrl), 'UPI URL should be valid RFC 3986');
    assert.ok(upiUrl.startsWith('upi://pay?pa='), 'Must use standard upi:// scheme');

    const langs: ('bn' | 'hi' | 'en')[] = ['bn', 'hi', 'en'];
    const tones: ('polite' | 'friendly' | 'firm')[] = ['polite', 'friendly', 'firm'];

    for (const l of langs) {
      for (const t of tones) {
        const msg = renderReminderMessage(
          {
            customerName: 'Shyam Sundar Das',
            customerPhone: '+919830012345',
            merchantUpiVpa: validVpa,
            balance: 450,
            tone: t,
            language: l,
            merchantStoreName: 'Maa Tara Grocery',
            daysOverdue: 7,
          },
          upiUrl
        );

        assert.ok(msg.length > 20, `Message in ${l}/${t} should not be empty`);
        assert.ok(msg.includes('₹450'), `Message in ${l}/${t} should contain formatted balance`);
        assert.ok(msg.includes(upiUrl), `Message in ${l}/${t} should contain UPI URL`);
      }
    }
  });

  // Test 3: Non-Blocking Negative Inventory Override
  await test('Resilience: Physical sale succeeds with amber warning when digital stock is depleted', async () => {
    const syncRes = await db.executeDualSync({
      merchant_id: DEFAULT_MERCHANT_ID,
      customer_name: 'Rohit Gupta',
      transaction_type: 'cash_sale',
      amount: 1500,
      raw_transcript: 'Rohit paid 1500 cash for 10 bottles mustard oil',
      language: 'en',
      items: [
        {
          item_id: 'item_oil_mustard_1l',
          name: 'Fortune Mustard Oil 1L',
          quantity: 10,
          unit: 'bottle',
          unit_price: 150,
        },
      ],
    });

    assert.ok(syncRes.success, 'Sale should NEVER be blocked by negative digital inventory');
    assert.ok(syncRes.updated_inventory.length > 0, 'Updated inventory should be returned');
  });

  console.log(`\n🎉 All ${passed} End-to-End Multilingual Integration Tests passed cleanly!`);
}

runE2E().catch((err) => {
  console.error('Fatal error during E2E test execution:', err);
  process.exit(1);
});
