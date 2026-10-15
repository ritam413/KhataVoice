/**
 * Master Automated Verification Suite (Ticket KV-21)
 * Runs all unit, integration, and E2E regression tests sequentially.
 */
import { execSync } from 'node:child_process';
import path from 'node:path';

console.log('================================================================');
console.log('🚀 KhataVoice Master Automated Verification Suite (KV-21)');
console.log('================================================================\n');

const testSuites = [
  { name: '1. Heuristic NLP Parser Benchmark', file: 'tests/unit/nlp-parser.test.ts' },
  { name: '2. Kirana Credit Trust Score Engine', file: 'tests/unit/trust-score.test.ts' },
  { name: '3. End-to-End Multilingual Integration Flow', file: 'tests/e2e/multilingual-flow.test.ts' },
  { name: '4. KV-20 Architecture Inspector Verification', file: 'scripts/verify-kv20.ts' },
];

let totalPassed = 0;

for (const suite of testSuites) {
  console.log(`\n▶️ Executing: ${suite.name} (${suite.file})`);
  try {
    const cmd = `npx tsx "${path.resolve(suite.file)}"`;
    execSync(cmd, { stdio: 'inherit' });
    totalPassed++;
    console.log(`✨ Suite Passed: ${suite.name}`);
  } catch (err: any) {
    console.error(`💥 Suite FAILED: ${suite.name}`);
    process.exit(1);
  }
}

console.log('\n================================================================');
console.log(`🏁 MASTER VERIFICATION COMPLETE: ${totalPassed}/${testSuites.length} SUITES PASSED (100% GREEN)`);
console.log('================================================================\n');
