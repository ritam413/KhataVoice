import assert from 'node:assert';
import { localStore } from '../src/lib/db/local-fallback';
import { dbAdapter, isSupabaseConfigured } from '../src/lib/db/supabase';
import { DEFAULT_MERCHANT_ID } from '../src/lib/db/seed-data';

async function runVerification() {
  console.log('--- Starting KV-02 Verification Gate ---');

  // 1. Adapter and Environment check
  console.log(`[Check 1] Cloud Configured: ${isSupabaseConfigured}, Adapter Mode: ${dbAdapter.mode}`);
  assert.strictEqual(dbAdapter.mode, 'local', 'Expected adapter to default to local mode when unconfigured');

  // 2. Initial Customers count and seed integrity
  const customers = await dbAdapter.getCustomers(DEFAULT_MERCHANT_ID);
  console.log(`[Check 2] Seeded Customers: ${customers.length}`);
  assert.strictEqual(customers.length, 6, 'Expected exactly 6 seeded Kirana customers');

  const rohit = await dbAdapter.getCustomerByName('Rohit Gupta', DEFAULT_MERCHANT_ID);
  assert(rohit !== null, 'Rohit Gupta must exist in localStore');
  assert.strictEqual(rohit.current_balance, 1250, 'Rohit Gupta initial balance must be 1250');
  assert.strictEqual(rohit.trust_badge, 'SILVER');

  // 3. Initial Inventory count and seed integrity
  const inventory = await dbAdapter.getInventory(DEFAULT_MERCHANT_ID);
  console.log(`[Check 3] Seeded Inventory SKUs: ${inventory.length}`);
  assert.strictEqual(inventory.length, 10, 'Expected exactly 10 seeded Kirana inventory items');

  const mustardOil = inventory.find((i) => i.name.includes('Mustard Oil'));
  assert(mustardOil !== null && mustardOil !== undefined, 'Mustard Oil must exist in inventory');
  assert.strictEqual(mustardOil.current_stock, 4, 'Mustard Oil initial stock must be 4');
  assert.strictEqual(mustardOil.low_stock_threshold, 5);

  // 4. Initial Ledger count
  const ledger = await dbAdapter.getLedgerEntries(DEFAULT_MERCHANT_ID);
  console.log(`[Check 4] Seeded Ledger Entries: ${ledger.length}`);
  assert.strictEqual(ledger.length, 4, 'Expected 4 seeded ledger entries');

  // 5. Atomic Dual-Sync Execution (Udhaar Sale)
  console.log('[Check 5] Executing Dual-Sync: Rohit Gupta buys 1L Mustard Oil on Udhaar (₹130)');
  const syncResult = await dbAdapter.executeDualSync({
    merchant_id: DEFAULT_MERCHANT_ID,
    customer_name: 'Rohit Gupta',
    transaction_type: 'udhaar_sale',
    amount: 130,
    items: [
      {
        item_id: mustardOil.id,
        name: mustardOil.name,
        quantity: 1,
        unit: mustardOil.unit,
        unit_price: 130,
      },
    ],
    raw_transcript: 'Rohit Gupta ek liter mustard oil udhaar',
    language: 'hi',
  });

  assert.strictEqual(syncResult.success, true);
  assert(syncResult.customer !== null);
  assert.strictEqual(syncResult.customer.current_balance, 1380, 'Rohit balance should increase from 1250 to 1380');
  assert.strictEqual(syncResult.updated_inventory.length, 1);
  assert.strictEqual(syncResult.updated_inventory[0].current_stock, 3, 'Mustard Oil stock should decrease from 4 to 3');

  // 6. Non-blocking Negative Stock Override Check
  console.log('[Check 6] Executing Dual-Sync with stock exceeding threshold: Sunita buys 5kg Sugar (initial stock = 3)');
  const sugarItem = inventory.find((i) => i.name.toLowerCase().includes('sugar'));
  assert(sugarItem !== undefined, 'Sugar must exist in inventory');

  const overdraftResult = await dbAdapter.executeDualSync({
    merchant_id: DEFAULT_MERCHANT_ID,
    customer_name: 'Sunita Devi',
    transaction_type: 'udhaar_sale',
    amount: 220,
    items: [
      {
        item_id: sugarItem.id,
        name: sugarItem.name,
        quantity: 5,
        unit: sugarItem.unit,
        unit_price: 44,
      },
    ],
    language: 'bn',
  });

  assert.strictEqual(overdraftResult.success, true, 'Transaction must succeed without crashing');
  assert(overdraftResult.warnings && overdraftResult.warnings.length > 0, 'Must produce a warning for negative stock');
  console.log(`   Warning generated: "${overdraftResult.warnings[0]}"`);
  assert(overdraftResult.updated_inventory[0].current_stock < 0, 'Stock must allow negative count');

  // 7. Reset to initial seed
  if (dbAdapter.resetToInitialSeed) {
    dbAdapter.resetToInitialSeed();
    const resetCustomers = await dbAdapter.getCustomers();
    const resetRohit = resetCustomers.find((c) => c.name === 'Rohit Gupta');
    assert.strictEqual(resetRohit?.current_balance, 1250, 'Reset must restore Rohit balance to 1250');
    console.log('[Check 7] Store successfully reset to initial seed');
  }

  console.log('✅ ALL KV-02 VERIFICATION GATES PASSED CLEANLY!');
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
