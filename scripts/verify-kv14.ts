import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { useAppStore } from '../src/lib/store/useAppStore';

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

async function runKv14Tests() {
  console.log('\n=== Verifying KV-14: Dual-Mode Viewport Simulator ===\n');

  // --- 1. CSS Chassis & Container Query Audit ---
  console.log('[CSS Hardware Chassis & Container Queries]');
  const cssPath = path.resolve(__dirname, '../src/components/layout/simulator.module.css');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');

  test('CSS declares container-type: inline-size for phone container queries', () => {
    assert.ok(
      cssContent.includes('container-type: inline-size'),
      'Missing container-type: inline-size'
    );
  });

  test('CSS specifies realistic phone dimensions (390px x 844px max)', () => {
    assert.ok(cssContent.includes('--phone-width: min(390px, 94vw)'), 'Missing phone-width');
    assert.ok(cssContent.includes('--phone-height: min(844px, 86vh)'), 'Missing phone-height');
  });

  test('CSS includes dynamic camera notch, status bar, and home indicator', () => {
    assert.ok(cssContent.includes('.dynamicNotch'), 'Missing dynamic notch');
    assert.ok(cssContent.includes('.statusBar'), 'Missing status bar');
    assert.ok(cssContent.includes('.homeIndicator'), 'Missing home indicator');
    assert.ok(cssContent.includes('.sideButton'), 'Missing hardware buttons');
  });

  test('CSS provides responsive fallback for physical small screens (@media max-width: 640px)', () => {
    assert.ok(cssContent.includes('@media (max-width: 640px)'), 'Missing small screen media query');
    assert.ok(cssContent.includes('width: 100vw'), 'Missing full-width mobile fallback');
  });

  // --- 2. Zustand Store Interactions ---
  console.log('\n[Zustand v5 useAppStore State Transitions]');
  test('Initial viewport state defaults to mobile', () => {
    assert.strictEqual(useAppStore.getState().viewportMode, 'mobile');
  });

  test('Toggles viewport mode between mobile and desktop', () => {
    useAppStore.getState().setViewportMode('desktop');
    assert.strictEqual(useAppStore.getState().viewportMode, 'desktop');

    useAppStore.getState().setViewportMode('mobile');
    assert.strictEqual(useAppStore.getState().viewportMode, 'mobile');
  });

  test('Toggles application language across Bengali, Hindi, and English', () => {
    useAppStore.getState().setLanguage('hi');
    assert.strictEqual(useAppStore.getState().language, 'hi');

    useAppStore.getState().setLanguage('en');
    assert.strictEqual(useAppStore.getState().language, 'en');

    useAppStore.getState().setLanguage('bn');
    assert.strictEqual(useAppStore.getState().language, 'bn');
  });

  test('Navigates active screen to judge tour', () => {
    useAppStore.getState().setActiveScreen('judge');
    assert.strictEqual(useAppStore.getState().activeScreen, 'judge');

    useAppStore.getState().setActiveScreen('home');
    assert.strictEqual(useAppStore.getState().activeScreen, 'home');
  });

  test('Zero State Drift: updates customer and inventory reactively via addTransaction', () => {
    const mockCustomer = {
      id: 'cust-test-1',
      merchant_id: 'merchant-1',
      name: 'Ramesh Das',
      phone: '9876543210',
      current_balance: 500,
      trust_score: 88,
      trust_badge: 'GOLD' as const,
      credit_limit: 5000,
      total_transactions_count: 10,
      last_transaction_at: new Date().toISOString(),
    };

    const mockItem = {
      id: 'item-test-1',
      merchant_id: 'merchant-1',
      name: 'Mustard Oil (1L)',
      unit: 'bottle' as const,
      current_stock: 4,
      unit_price: 135,
      cost_price: 115,
      low_stock_threshold: 2,
    };

    useAppStore.getState().setCustomers([mockCustomer]);
    useAppStore.getState().setInventory([mockItem]);

    const updatedCustomer = { ...mockCustomer, current_balance: 635 };
    const updatedItems = [{ ...mockItem, current_stock: 3 }];
    const mockEntry = {
      id: 'ledger-test-1',
      merchant_id: 'merchant-1',
      transaction_type: 'udhaar_sale' as const,
      amount: 135,
      items_summary: [{ name: 'Mustard Oil (1L)', quantity: 1, unit: 'bottle', price: 135 }],
      language: 'bn' as const,
      created_at: new Date().toISOString(),
    };

    useAppStore.getState().addTransaction(mockEntry, updatedCustomer, updatedItems);

    const state = useAppStore.getState();
    assert.strictEqual(state.ledger.length, 1);
    assert.strictEqual(state.customers[0].current_balance, 635);
    assert.strictEqual(state.inventory[0].current_stock, 3);
  });

  console.log(`\n========================================`);
  console.log(`KV-14 Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runKv14Tests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
