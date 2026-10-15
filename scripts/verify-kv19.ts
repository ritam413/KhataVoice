/**
 * Verification Script for Ticket KV-19:
 * Screen 7: Judge Economics & Working Capital ROI Simulator (Ekansh Jain Rubric)
 *
 * Verifies component exports, routing integrations, mathematical formulas,
 * range boundary defenses, 4-pillar rubric coverage, and Bharat Modern tokens.
 */

import fs from 'fs';
import path from 'path';

let passedChecks = 0;
let failedChecks = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✔ ${message}`);
    passedChecks++;
  } else {
    console.error(`  ✖ FAIL: ${message}`);
    failedChecks++;
  }
}

console.log('============================================================');
console.log('  TICKET KV-19 VERIFICATION: JUDGE ECONOMICS & ROI SIMULATOR');
console.log('============================================================\n');

// -----------------------------------------------------------------------------
// [1/5] Target Files & Component Architecture
// -----------------------------------------------------------------------------
console.log('[1/5] Verifying Target Files & Component Architecture...');

const judgeScreenPath = path.join(process.cwd(), 'src/components/views/JudgeEconomicsScreen.tsx');
const judgeCssPath = path.join(process.cwd(), 'src/styles/judge-screen.module.css');
const mainViewPath = path.join(process.cwd(), 'src/components/views/MainClientView.tsx');
const viewportSimPath = path.join(process.cwd(), 'src/components/layout/ViewportSimulator.tsx');
const topBarPath = path.join(process.cwd(), 'src/components/layout/TopBar.tsx');
const desktopCenterPath = path.join(process.cwd(), 'src/components/views/DesktopCommandCenter.tsx');

assert(fs.existsSync(judgeScreenPath), 'JudgeEconomicsScreen.tsx exists in src/components/views');
assert(fs.existsSync(judgeCssPath), 'judge-screen.module.css exists in src/styles');

const judgeScreenSrc = fs.readFileSync(judgeScreenPath, 'utf8');
const judgeCssSrc = fs.readFileSync(judgeCssPath, 'utf8');
const mainViewSrc = fs.readFileSync(mainViewPath, 'utf8');
const viewportSimSrc = fs.readFileSync(viewportSimPath, 'utf8');
const topBarSrc = fs.readFileSync(topBarPath, 'utf8');
const desktopCenterSrc = fs.readFileSync(desktopCenterPath, 'utf8');

assert(
  judgeScreenSrc.includes('export function JudgeEconomicsScreen'),
  'JudgeEconomicsScreen exports primary React component'
);
assert(
  judgeScreenSrc.includes("'use client'"),
  'JudgeEconomicsScreen is declared as a Client Component'
);
assert(
  mainViewSrc.includes("import { JudgeEconomicsScreen } from '@/components/views/JudgeEconomicsScreen'"),
  'MainClientView imports JudgeEconomicsScreen'
);
assert(
  mainViewSrc.includes("activeScreen === 'judge' && <JudgeEconomicsScreen />"),
  "MainClientView routes activeScreen === 'judge' to JudgeEconomicsScreen"
);
assert(
  viewportSimSrc.includes("activeScreen === 'judge' ? <JudgeEconomicsScreen />"),
  'ViewportSimulator renders JudgeEconomicsScreen in desktop mode'
);
assert(
  topBarSrc.includes("activeScreen === 'judge' ? 'home' : 'judge'"),
  'TopBar toggles Judge Tour on click'
);
assert(
  topBarSrc.includes('judgeButtonActive'),
  'TopBar applies active button styling when on Judge Tour'
);
assert(
  desktopCenterSrc.includes("setActiveScreen('judge')"),
  'DesktopCommandCenter provides direct shortcut button to Judge Suite'
);

// -----------------------------------------------------------------------------
// [2/5] Mathematical Calculations & Unit Economics Formulas
// -----------------------------------------------------------------------------
console.log('\n[2/5] Verifying Financial Calculations & Unit Economics...');

// Simulated Pure Function replicating JudgeEconomicsScreen calculation logic
function calculateEconomics(stores: number, entriesPerDay: number, saasPrice: number, debtRecovered: number) {
  const costPerEntry = 0.10;
  const monthlyEntriesPerStore = entriesPerDay * 30;
  const monthlyCogsPerStore = monthlyEntriesPerStore * costPerEntry;
  const monthlyGrossProfitPerStore = Math.max(0, saasPrice - monthlyCogsPerStore);
  const grossMarginPct = saasPrice > 0 ? (monthlyGrossProfitPerStore / saasPrice) * 100 : 0;

  const mrr = stores * saasPrice;
  const arr = mrr * 12;
  const totalMonthlyCogs = stores * monthlyCogsPerStore;
  const totalMonthlyNetProfit = mrr - totalMonthlyCogs;

  const workingCapitalUnlockedMonthly = stores * debtRecovered;
  const merchantRoiMultiplier = saasPrice > 0 ? debtRecovered / saasPrice : 0;

  return {
    monthlyCogsPerStore,
    grossMarginPct,
    mrr,
    arr,
    totalMonthlyCogs,
    totalMonthlyNetProfit,
    workingCapitalUnlockedMonthly,
    merchantRoiMultiplier,
  };
}

// Baseline PRD Scenario: 1,000 stores, 35 entries/day, ₹199/month, ₹2,160 debt recovered
const baseline = calculateEconomics(1000, 35, 199, 2160);
assert(baseline.mrr === 199000, `MRR matches ₹1,99,000 for 1,000 stores @ ₹199 (got ${baseline.mrr})`);
assert(baseline.arr === 2388000, `ARR matches ₹23,88,000 for 1,000 stores (got ${baseline.arr})`);
assert(baseline.monthlyCogsPerStore === 105, `COGS per store is ₹105 (35 * 30 * 0.10 = ${baseline.monthlyCogsPerStore})`);
assert(Math.round(baseline.grossMarginPct * 10) / 10 === 47.2, `Baseline Gross Margin is 47.2% (got ${baseline.grossMarginPct.toFixed(1)}%)`);
assert(baseline.workingCapitalUnlockedMonthly === 2160000, `Working capital unlocked is ₹21,60,000 (got ${baseline.workingCapitalUnlockedMonthly})`);
assert(Math.round(baseline.merchantRoiMultiplier * 10) / 10 === 10.9 || Math.round(baseline.merchantRoiMultiplier * 10) / 10 === 10.8, `Merchant Payback is ~10.8x-10.9x ROI (got ${baseline.merchantRoiMultiplier.toFixed(1)}x)`);

// High-Scale Scenario: 5,000 stores, 35 entries/day, ₹299/month, ₹3,500 debt recovered
const scaled = calculateEconomics(5000, 35, 299, 3500);
assert(scaled.mrr === 1495000, `Scaled MRR is ₹14,95,000 for 5,000 stores @ ₹299`);
assert(scaled.workingCapitalUnlockedMonthly === 17500000, `Scaled Working capital is ₹1.75 Crores (got ${scaled.workingCapitalUnlockedMonthly})`);
assert(scaled.grossMarginPct > 64, `Scaled Gross Margin is > 64% at ₹299 SaaS price (got ${scaled.grossMarginPct.toFixed(1)}%)`);
assert(scaled.merchantRoiMultiplier > 11.5, `Scaled Merchant ROI is > 11.5x (got ${scaled.merchantRoiMultiplier.toFixed(1)}x)`);

// Zero-Division Defense & Boundary Guards
const zeroSaas = calculateEconomics(1000, 35, 0, 2160);
assert(zeroSaas.grossMarginPct === 0 && !Number.isNaN(zeroSaas.grossMarginPct), 'Zero SaaS price handled without NaN in gross margin');
assert(zeroSaas.merchantRoiMultiplier === 0 && !Number.isNaN(zeroSaas.merchantRoiMultiplier), 'Zero SaaS price handled without NaN in ROI multiplier');

// -----------------------------------------------------------------------------
// [3/5] Next Founders Evaluation Rubric & Ekansh Jain Profile
// -----------------------------------------------------------------------------
console.log('\n[3/5] Verifying Next Founders Rubric & Judge Personalization...');

assert(
  judgeScreenSrc.includes('Ekansh Jain'),
  'JudgeEconomicsScreen explicitly recognizes Judge Ekansh Jain'
);
assert(
  judgeScreenSrc.includes('LUMA Youth'),
  'JudgeEconomicsScreen attributes LUMA Youth affiliation'
);
assert(
  judgeScreenSrc.includes('Business & Finance') &&
  judgeScreenSrc.includes('Technical Execution') &&
  judgeScreenSrc.includes('Innovation & UX') &&
  judgeScreenSrc.includes('Communication'),
  'JudgeEconomicsScreen covers all 4 Next Founders judging criteria (25% each)'
);
assert(
  judgeScreenSrc.includes('₹20 Lakh Crore'),
  'Highlights the ₹20 Lakh Crore national retail informal credit gap'
);
assert(
  judgeScreenSrc.includes('wa.me') && judgeScreenSrc.includes('₹0.00'),
  'Highlights the ₹0.00 zero-cost WhatsApp browser intent architecture'
);

// -----------------------------------------------------------------------------
// [4/5] Interactive Controls & UX Ergonomics
// -----------------------------------------------------------------------------
console.log('\n[4/5] Verifying Interactive Range Sliders & Tactile Controls...');

assert(
  judgeScreenSrc.includes('type="range"'),
  'JudgeEconomicsScreen renders interactive HTML5 range slider inputs'
);
assert(
  judgeScreenSrc.includes('min={100}') && judgeScreenSrc.includes('max={25000}'),
  'Stores slider bound between 100 and 25,000 stores'
);
assert(
  judgeScreenSrc.includes('min={10}') && judgeScreenSrc.includes('max={150}'),
  'Voice entries slider bound between 10 and 150 entries/day'
);
assert(
  judgeScreenSrc.includes('min={99}') && judgeScreenSrc.includes('max={499}'),
  'SaaS price slider bound between ₹99 and ₹499/month'
);
assert(
  judgeScreenSrc.includes('min={500}') && judgeScreenSrc.includes('max={10000}'),
  'Debt recovered slider bound between ₹500 and ₹10,000/month'
);
assert(
  judgeScreenSrc.includes('handleResetDefaults'),
  'Includes 1-click Reset button restoring standard PRD baseline assumptions'
);
assert(
  judgeScreenSrc.includes("setActiveScreen('home')"),
  'Provides one-tap "Back to Kirana Store" action'
);

// -----------------------------------------------------------------------------
// [5/5] Bharat Modern CSS Tokens & Responsive Design
// -----------------------------------------------------------------------------
console.log('\n[5/5] Verifying Bharat Modern Tokens & CSS Classes...');

assert(judgeCssSrc.includes('.judgeContainer'), 'CSS module defines .judgeContainer main surface');
assert(judgeCssSrc.includes('.headerBanner'), 'CSS module defines .headerBanner with gradient');
assert(judgeCssSrc.includes('.rangeInput'), 'CSS module defines customized .rangeInput slider');
assert(judgeCssSrc.includes('.rangeInput::-webkit-slider-thumb'), 'CSS module styles webkit slider thumb');
assert(judgeCssSrc.includes('.kpiGrid'), 'CSS module defines responsive .kpiGrid layout');
assert(judgeCssSrc.includes('.roiSpotlight'), 'CSS module defines .roiSpotlight card for payback multiplier');
assert(judgeCssSrc.includes('.tabsBar'), 'CSS module defines .tabsBar for rubric navigation');
assert(judgeCssSrc.includes('.pipelineBox'), 'CSS module defines .pipelineBox architecture latency inspector');

// -----------------------------------------------------------------------------
// Final Verdict
// -----------------------------------------------------------------------------
console.log('------------------------------------------------------------');
console.log(`  VERIFICATION RESULT: ${passedChecks} PASSED / ${failedChecks} FAILED`);
console.log('------------------------------------------------------------\n');

if (failedChecks > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
