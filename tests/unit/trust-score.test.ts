/**
 * Unit Test: Kirana Credit Trust Score Engine (0 - 100)
 * Verifies algorithmic mathematical boundaries, tier badge assignments, and division-by-zero defense.
 */
import assert from 'node:assert';
import { calculateTrustScore } from '@/lib/trust/trust-engine';

console.log('🧪 Running Kirana Trust Score Engine Unit Tests...\n');

let passed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
    throw err;
  }
}

// 1. Cold-Start Invariant
test('Cold-start protection assigns 70 (SILVER) to new customers with <2 transactions', () => {
  const result = calculateTrustScore({
    avgRepaymentDays: 0,
    overdueRatio: 0,
    transactionCount: 1,
    disputes: 0,
  });
  assert.strictEqual(result.score, 70);
  assert.strictEqual(result.tier, 'SILVER');
  assert.strictEqual(result.maxCreditLimit, 1500);
});

// 2. Pure Cash Customer Invariant
test('Pure cash customer with 0 credit history receives 95 (GOLD)', () => {
  const result = calculateTrustScore({
    avgRepaymentDays: 0,
    overdueRatio: 0,
    transactionCount: 5,
    disputes: 0,
  });
  assert.strictEqual(result.score, 95);
  assert.strictEqual(result.tier, 'GOLD');
  assert.strictEqual(result.maxCreditLimit, 5000);
});

// 3. Punctual Repayer (Gold Tier)
test('Prompt repayer (repaying in 3 days, 0 overdue) achieves GOLD tier', () => {
  const result = calculateTrustScore({
    avgRepaymentDays: 3,
    overdueRatio: 0.05,
    transactionCount: 12,
    disputes: 0,
  });
  assert.ok(result.score >= 85, `Score ${result.score} should be >= 85`);
  assert.strictEqual(result.tier, 'GOLD');
});

// 4. Moderate Regular (Silver Tier)
test('Standard regular customer (7 days repayment, 10% overdue, 8 transactions) achieves SILVER tier', () => {
  const result = calculateTrustScore({
    avgRepaymentDays: 7,
    overdueRatio: 0.10,
    transactionCount: 8,
    disputes: 0,
  });
  assert.ok(result.score >= 65 && result.score < 85, `Score ${result.score} should be between 65 and 84`);
  assert.strictEqual(result.tier, 'SILVER');
});

// 5. Chronic Defaulter (Bronze Tier)
test('Chronic overdue borrower (40 days, 85% overdue, 1 dispute) receives BRONZE tier', () => {
  const result = calculateTrustScore({
    avgRepaymentDays: 40,
    overdueRatio: 0.85,
    transactionCount: 4,
    disputes: 1,
  });
  assert.ok(result.score < 65, `Score ${result.score} should be < 65`);
  assert.strictEqual(result.tier, 'BRONZE');
});

// 6. Mathematical Upper Clamping Boundary
test('Score is strictly clamped at 100 for theoretical perfection', () => {
  const result = calculateTrustScore({
    avgRepaymentDays: 0,
    overdueRatio: 0,
    transactionCount: 100,
    disputes: 0,
  });
  assert.ok(result.score <= 100, `Score ${result.score} exceeds 100`);
});

// 7. Mathematical Lower Clamping Boundary
test('Score is strictly clamped at 0 for worst-case profile', () => {
  const result = calculateTrustScore({
    avgRepaymentDays: 120,
    overdueRatio: 1.0,
    transactionCount: 2,
    disputes: 5,
  });
  assert.ok(result.score >= 0, `Score ${result.score} is negative`);
  assert.strictEqual(result.score, 0);
  assert.strictEqual(result.tier, 'BRONZE');
});

console.log(`\n🎉 All ${passed} Trust Score Engine checks passed cleanly!`);
