/**
 * Automated Verification Harness for Ticket KV-20:
 * Architecture & Scalability Inspector Tab with Topology Visualizer & Fallback Matrix
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

console.log('🧪 Starting KV-20 Verification Harness...\n');

let passCount = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passCount++;
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
    process.exit(1);
  }
}

// 1. Target Files Existence
test('ArchitectureInspector.tsx component exists', () => {
  const filePath = path.resolve('src/components/views/ArchitectureInspector.tsx');
  assert.ok(fs.existsSync(filePath), 'ArchitectureInspector.tsx not found');
});

test('architecture-inspector.module.css styles module exists', () => {
  const filePath = path.resolve('src/styles/architecture-inspector.module.css');
  assert.ok(fs.existsSync(filePath), 'architecture-inspector.module.css not found');
});

// 2. Component Structure & Tokens
test('ArchitectureInspector imports useAppStore and isSupabaseConfigured', () => {
  const code = fs.readFileSync('src/components/views/ArchitectureInspector.tsx', 'utf8');
  assert.ok(code.includes('useAppStore'), 'Missing useAppStore import');
  assert.ok(code.includes('isSupabaseConfigured'), 'Missing isSupabaseConfigured import');
});

test('ArchitectureInspector contains 5-step pipeline topology nodes', () => {
  const code = fs.readFileSync('src/components/views/ArchitectureInspector.tsx', 'utf8');
  assert.ok(code.includes('Vernacular Audio'), 'Missing Step 1 Vernacular Audio');
  assert.ok(code.includes('Speech Adapter'), 'Missing Step 2 Speech Adapter');
  assert.ok(code.includes('Hybrid NLP Parse'), 'Missing Step 3 Hybrid NLP Parse');
  assert.ok(code.includes('ACID Dual-Sync'), 'Missing Step 4 ACID Dual-Sync');
  assert.ok(code.includes('Realtime Stream'), 'Missing Step 5 Realtime Stream');
  assert.ok(code.includes('~900ms'), 'Missing ~900ms P95 latency figure');
});

test('ArchitectureInspector contains Multi-Tenant RLS & 50,000+ scaling breakdown', () => {
  const code = fs.readFileSync('src/components/views/ArchitectureInspector.tsx', 'utf8');
  assert.ok(code.includes('Row-Level Security (RLS) Isolation'), 'Missing RLS section');
  assert.ok(code.includes('50,000+ Store Horizontal Scaling'), 'Missing 50,000+ scaling section');
  assert.ok(code.includes('Non-Blocking Negative Inventory'), 'Missing Non-blocking negative inventory section');
});

test('ArchitectureInspector contains 5-minute timed pitch script teleprompter', () => {
  const code = fs.readFileSync('src/components/views/ArchitectureInspector.tsx', 'utf8');
  assert.ok(code.includes('5-Minute Hackathon Pitch Structure (Strict 300 Seconds)'), 'Missing pitch structure');
  assert.ok(code.includes('0:00 - 0:45'), 'Missing 0:00 - 0:45 segment');
  assert.ok(code.includes('0:45 - 1:30'), 'Missing 0:45 - 1:30 segment');
  assert.ok(code.includes('1:30 - 3:15'), 'Missing 1:30 - 3:15 segment');
  assert.ok(code.includes('3:15 - 4:15'), 'Missing 3:15 - 4:15 segment');
  assert.ok(code.includes('4:15 - 5:00'), 'Missing 4:15 - 5:00 segment');
});

// 3. Routing & Navigation Wiring
test('ActiveScreen union includes "architecture"', () => {
  const code = fs.readFileSync('src/lib/store/useAppStore.ts', 'utf8');
  assert.ok(code.includes("'architecture'"), 'ActiveScreen does not include architecture');
});

test('MainClientView routes "architecture" to ArchitectureInspector', () => {
  const code = fs.readFileSync('src/components/views/MainClientView.tsx', 'utf8');
  assert.ok(code.includes('ArchitectureInspector'), 'ArchitectureInspector not imported in MainClientView');
  assert.ok(code.includes("activeScreen === 'architecture'"), 'Missing architecture screen check in MainClientView');
});

test('ViewportSimulator renders ArchitectureInspector in desktopContainer mode', () => {
  const code = fs.readFileSync('src/components/layout/ViewportSimulator.tsx', 'utf8');
  assert.ok(code.includes('ArchitectureInspector'), 'ArchitectureInspector not imported in ViewportSimulator');
  assert.ok(code.includes("activeScreen === 'architecture'"), 'Missing architecture render in ViewportSimulator');
});

test('TopBar has Architecture Inspector button wired to setActiveScreen', () => {
  const code = fs.readFileSync('src/components/layout/TopBar.tsx', 'utf8');
  assert.ok(code.includes('Arch Inspector'), 'Arch Inspector button not found in TopBar');
  assert.ok(code.includes("setActiveScreen(activeScreen === 'architecture'"), 'Button not toggling architecture screen');
});

test('DesktopCommandCenter has Arch Inspector shortcut button', () => {
  const code = fs.readFileSync('src/components/views/DesktopCommandCenter.tsx', 'utf8');
  assert.ok(code.includes('Arch Inspector'), 'Arch Inspector shortcut not in DesktopCommandCenter');
  assert.ok(code.includes("setActiveScreen('architecture')"), 'Shortcut not triggering architecture');
});

// 4. CSS tokens
test('architecture-inspector.module.css uses Bharat Modern tokens', () => {
  const css = fs.readFileSync('src/styles/architecture-inspector.module.css', 'utf8');
  assert.ok(css.includes('#090D16'), 'Missing obsidian background');
  assert.ok(css.includes('#121826'), 'Missing container background');
  assert.ok(css.includes('#FF7700'), 'Missing Saffron accent');
  assert.ok(css.includes('#10B981'), 'Missing Emerald accent');
});

console.log(`\n🎉 All ${passCount} KV-20 automated verification checks passed cleanly!`);
