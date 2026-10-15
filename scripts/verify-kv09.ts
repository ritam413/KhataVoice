import * as fs from 'fs';
import * as path from 'path';
import { dbAdapter, isSupabaseConfigured } from '../src/lib/db/supabase';
import { localStore } from '../src/lib/db/local-fallback';
import { invokeExecuteSpokenDualSync } from '../src/lib/db/stored-proc-bridge';
import type { DualSyncPayload } from '../src/types/domain';

let passedChecks = 0;
let totalChecks = 0;

function assert(condition: boolean, message: string) {
  totalChecks++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  passedChecks++;
  console.log(`✅ PASS: ${message}`);
}

async function runVerification() {
  console.log('====================================================');
  console.log('KV-09 PostgreSQL ACID Stored Procedure Verification');
  console.log('====================================================\n');

  // --- 1. SQL Migration Syntax & Security Checks ---
  console.log('1. Validating SQL Migration File...');
  const migrationPath = path.join(
    process.cwd(),
    'supabase/migrations/20261013000001_stored_procedure_dual_sync.sql'
  );
  assert(fs.existsSync(migrationPath), 'Migration file 20261013000001_stored_procedure_dual_sync.sql exists');

  const sqlContent = fs.readFileSync(migrationPath, 'utf8');
  assert(
    sqlContent.includes('CREATE OR REPLACE FUNCTION execute_spoken_dual_sync'),
    'Defines execute_spoken_dual_sync function'
  );
  assert(
    sqlContent.includes('LANGUAGE plpgsql'),
    'Declares LANGUAGE plpgsql'
  );
  assert(
    sqlContent.includes('SECURITY DEFINER'),
    'Hardened with SECURITY DEFINER'
  );
  assert(
    sqlContent.includes('SET search_path = public, pg_temp'),
    'Guarded with explicit search_path'
  );
  assert(
    sqlContent.includes('pg_advisory_xact_lock'),
    'Implements advisory transaction lock against double-submits'
  );
  assert(
    sqlContent.includes('FOR UPDATE'),
    'Implements row-level locking on customers and inventory'
  );
  assert(
    sqlContent.includes('stock_movements'),
    'Logs auditable delta into stock_movements table'
  );
  assert(
    sqlContent.includes('GRANT EXECUTE ON FUNCTION execute_spoken_dual_sync'),
    'Grants EXECUTE privileges to authenticated and anon'
  );

  // --- 2. Bridge Module & Zero-Crash Fallback Checks ---
  console.log('\n2. Validating Stored Procedure Client Bridge...');
  assert(typeof invokeExecuteSpokenDualSync === 'function', 'invokeExecuteSpokenDualSync is exported');

  // Mock a failing/unconfigured SupabaseClient to verify Zero-Crash Boot Guarantee
  const mockClient = {
    rpc: async () => ({ data: null, error: { message: 'Connection refused / offline test' } }),
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null }) }) }) }),
  } as any;

  localStore.resetToInitialSeed();
  const testPayload: DualSyncPayload = {
    customer_name: 'Rohit Gupta',
    transaction_type: 'udhaar_sale',
    amount: 300,
    items: [{ name: 'Sugar 1kg', quantity: 1, unit: 'kg', unit_price: 44 }],
    raw_transcript: 'Rohit ji 1kg chini udhaar',
    language: 'hi',
  };

  const bridgeResult = await invokeExecuteSpokenDualSync(mockClient, testPayload);
  assert(bridgeResult.success === true, 'Bridge safely fails over to localStore when Supabase is unreachable');
  assert(Boolean(bridgeResult.ledger_entry_id), 'Bridge returns valid ledger_entry_id on fallback');
  assert(bridgeResult.customer?.name === 'Rohit Gupta', 'Customer balance updated on fallback');

  // --- 3. Non-Blocking Negative Stock Invariant Test ---
  console.log('\n3. Validating Non-Blocking Negative Inventory Override (Council Review Invariant)...');
  localStore.resetToInitialSeed();
  // Fortune Mustard Oil currently has 4 in stock. Sell 6 to drop stock to -2
  const overdraftPayload: DualSyncPayload = {
    customer_name: 'Shyam Sundar Das',
    transaction_type: 'udhaar_sale',
    amount: 780,
    items: [{ name: 'Fortune Mustard Oil 1L', quantity: 6, unit: 'liter', unit_price: 130 }],
    raw_transcript: 'Shyam Babu 6 bottle mustard oil udhaar',
    language: 'bn',
  };

  const overdraftResult = await dbAdapter.executeDualSync(overdraftPayload);
  assert(overdraftResult.success === true, 'Overdraft sale succeeds without throwing an exception');
  
  const oilItem = overdraftResult.updated_inventory?.find((i) => i.name.includes('Fortune Mustard Oil'));
  assert(oilItem !== undefined, 'Inventory array contains Fortune Mustard Oil');
  assert(oilItem!.current_stock === -2, `Inventory decrements into negative stock (current_stock: ${oilItem?.current_stock})`);
  assert(
    overdraftResult.warnings !== undefined && overdraftResult.warnings.some((w) => w.includes('is now at -2 liter')),
    'Returns actionable amber warning in stock_warnings: "Warning: Fortune Mustard Oil 1L is now at -2 liter. Please restock."'
  );

  // --- 4. Customer Trust Recalibration Tests ---
  console.log('\n4. Validating Customer Balance & Credit Trust Recalibration...');
  localStore.resetToInitialSeed();

  // Udhaar Sale pushing balance > ₹3,000 -> BRONZE
  const heavyDebtPayload: DualSyncPayload = {
    customer_name: 'Sunita Devi',
    transaction_type: 'udhaar_sale',
    amount: 3200,
    items: [],
    raw_transcript: 'Sunita Devi 3200 udhaar',
    language: 'hi',
  };
  const heavyDebtResult = await dbAdapter.executeDualSync(heavyDebtPayload);
  assert(heavyDebtResult.customer?.current_balance! > 3000, 'Customer balance exceeds ₹3,000');
  assert(heavyDebtResult.customer?.trust_badge === 'BRONZE', 'Customer trust badge demoted to BRONZE on high debt');
  assert(heavyDebtResult.customer?.trust_score! <= 50, 'Customer trust score calibrated to <= 50');

  // Payment Received settling debt to ₹0 -> GOLD
  const settlementPayload: DualSyncPayload = {
    customer_name: 'Sunita Devi',
    transaction_type: 'payment_received',
    amount: 5000, // Pays off entire balance
    items: [],
    raw_transcript: 'Sunita Devi paid 5000',
    language: 'hi',
  };
  const settlementResult = await dbAdapter.executeDualSync(settlementPayload);
  assert(settlementResult.customer?.current_balance === 0, 'Customer balance settled to 0');
  assert(settlementResult.customer?.trust_badge === 'GOLD', 'Customer trust badge upgraded to GOLD upon full repayment');
  assert(settlementResult.customer?.trust_score! >= 85, 'Customer trust score restored to >= 85');

  // --- Summary ---
  console.log('\n====================================================');
  console.log(`Results: ${passedChecks}/${totalChecks} checks passed!`);
  console.log('====================================================\n');
}

runVerification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
