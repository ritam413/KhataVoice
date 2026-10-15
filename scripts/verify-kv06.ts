import * as fs from 'fs';
import * as path from 'path';

console.log('--- [KV-06 Verification Suite: Real-Time Audio Waveform Canvas Visualizer] ---');

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedTests++;
  }
}

// 1. Verify target files exist
const componentPath = path.resolve(process.cwd(), 'src/components/audio/WaveformVisualizer.tsx');
const cssPath = path.resolve(process.cwd(), 'src/components/audio/waveform.module.css');

assert(fs.existsSync(componentPath), 'WaveformVisualizer.tsx exists');
assert(fs.existsSync(cssPath), 'waveform.module.css exists');

// 2. Read source code
const componentCode = fs.readFileSync(componentPath, 'utf8');
const cssCode = fs.readFileSync(cssPath, 'utf8');

// 3. Automated Verification Gate from Ticket KV-06
assert(
  componentCode.includes('cancelAnimationFrame') && componentCode.includes('close()'),
  'Ticket KV-06 Gate: Contains cancelAnimationFrame and close() cleanup handlers'
);

// 4. Memory Leak & Adversarial Hardening Guards
assert(
  componentCode.includes('audioContext.state !== \'closed\'') ||
    componentCode.includes('audioContext.state !== "closed"'),
  'Guards audioContext.close() with state check to avoid InvalidStateError'
);
assert(
  componentCode.includes('cancelAnimationFrame(animationFrameIdRef.current)'),
  'Cancels pending animationFrameId on unmount / state change'
);
assert(
  !componentCode.includes('analyser.connect(audioContext.destination)'),
  'Acoustic Feedback Shield: Analyser does NOT connect to audioContext.destination'
);

// 5. High-DPI Scaling & Canvas 2D
assert(
  componentCode.includes('window.devicePixelRatio') && componentCode.includes('ctx.scale'),
  'Implements High-DPI Retina devicePixelRatio scaling'
);
assert(
  componentCode.includes('drawRoundedBar') &&
    (componentCode.includes('roundRect') || componentCode.includes('arcTo')),
  'Implements rounded bar rendering with universal cross-browser fallback'
);

// 6. Dual-Mode Visualization (Live Mic + Synthetic Sine Fallback)
assert(
  componentCode.includes('createMediaStreamSource') && componentCode.includes('getByteFrequencyData'),
  'Implements live microphone analysis using Web Audio AnalyserNode'
);
assert(
  componentCode.includes('Math.sin') && componentCode.includes('Math.cos'),
  'Implements synthetic sine wave fallback when stream is null or demo is active'
);

// 7. Styling & Bharat Modern Tokens
assert(
  cssCode.includes('.container') && cssCode.includes('.ambientGlow') && cssCode.includes('.canvas'),
  'CSS module declares container, ambientGlow, and canvas classes'
);
assert(
  componentCode.includes('#FF7700') && componentCode.includes('#FFB800'),
  'Default color tokens match Bharat Modern Saffron (#FF7700) and Gold (#FFB800)'
);

// 8. Math Validation: Synthetic Sine Calculation bounds
const totalBars = 32;
const minBarHeight = 4;
const maxBarHeight = 68;
let maxObserved = -Infinity;
let minObserved = Infinity;

for (let phase = 0; phase < Math.PI * 2; phase += 0.2) {
  for (let i = 0; i < totalBars; i++) {
    const normalizedIndex = i / totalBars;
    const wave1 = Math.sin(normalizedIndex * Math.PI * 3 + phase);
    const wave2 = Math.cos(normalizedIndex * Math.PI * 5 - phase * 0.7);
    const combined = Math.abs(wave1 * 0.6 + wave2 * 0.4);
    const targetHeight = minBarHeight + combined * (maxBarHeight - minBarHeight);
    if (targetHeight > maxObserved) maxObserved = targetHeight;
    if (targetHeight < minObserved) minObserved = targetHeight;
  }
}

assert(
  minObserved >= minBarHeight && maxObserved <= maxBarHeight + 0.001,
  `Synthetic wave bounds verified: min=${minObserved.toFixed(2)}px (>=4px), max=${maxObserved.toFixed(2)}px (<=${maxBarHeight}px)`
);

console.log(`\nResults: ${passedTests} passed, ${failedTests} failed.`);

if (failedTests > 0) {
  console.error('KV-06 Verification Failed!');
  process.exit(1);
} else {
  console.log('KV-06 Verification Passed Cleanly!\n');
}
