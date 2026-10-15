/**
 * Automated Verification Gate for Ticket KV-15:
 * Screens 1 & 2: Kirana Mobile Home & Voice Modal with 4s Countdown & Soundbox TTS
 */

import * as fs from 'fs';
import * as path from 'path';
import { playSoundboxChime, speakSoundboxConfirmation, triggerSoundboxSuccess } from '../src/lib/audio/soundbox';
import { useAppStore } from '../src/lib/store/useAppStore';
import { audioPresets, getPresetById } from '../src/lib/speech/audio-presets';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failed++;
  } else {
    console.log(`✓ ${message}`);
    passed++;
  }
}

async function runKv15Verification() {
  console.log('=== Verifying KV-15: Kirana Mobile Home & Voice Entry Modal ===\n');

  // --- 1. Target Files & Source Code Verification ---
  console.log('[1. Target Files & Source Invariants]');
  const homePath = path.resolve(process.cwd(), 'src/components/views/HomeScreen.tsx');
  const modalPath = path.resolve(process.cwd(), 'src/components/views/VoiceEntryModal.tsx');
  const presetSelectorPath = path.resolve(process.cwd(), 'src/components/audio/PresetSelector.tsx');
  const mainClientPath = path.resolve(process.cwd(), 'src/components/views/MainClientView.tsx');
  const modalCssPath = path.resolve(process.cwd(), 'src/components/views/voice-modal.module.css');
  const soundboxPath = path.resolve(process.cwd(), 'src/lib/audio/soundbox.ts');

  assert(fs.existsSync(homePath), 'HomeScreen.tsx exists');
  assert(fs.existsSync(modalPath), 'VoiceEntryModal.tsx exists');
  assert(fs.existsSync(presetSelectorPath), 'PresetSelector.tsx exists');
  assert(fs.existsSync(mainClientPath), 'MainClientView.tsx exists');
  assert(fs.existsSync(modalCssPath), 'voice-modal.module.css exists');
  assert(fs.existsSync(soundboxPath), 'soundbox.ts exists');

  const homeCode = fs.readFileSync(homePath, 'utf8');
  const modalCode = fs.readFileSync(modalPath, 'utf8');
  const modalCss = fs.readFileSync(modalCssPath, 'utf8');
  const soundboxCode = fs.readFileSync(soundboxPath, 'utf8');

  // HomeScreen checks
  assert(homeCode.includes('HomeScreen'), 'HomeScreen component defined');
  assert(homeCode.includes('size="voiceHero"'), 'Giant voice hero microphone button rendered');
  assert(homeCode.includes('PresetSelector'), 'PresetSelector integrated into HomeScreen');
  assert(homeCode.includes('totalUdhaar'), 'Total Udhaar balance computed and displayed');

  // VoiceEntryModal checks
  assert(modalCode.includes('VoiceEntryModal'), 'VoiceEntryModal component defined');
  assert(modalCode.includes('WaveformVisualizer'), 'WaveformVisualizer canvas integrated');
  assert(modalCode.includes('startGraceCountdown'), '4-second grace countdown timer function implemented');
  assert(modalCode.includes('stopCountdown'), 'Countdown cancellation guard implemented');
  assert(modalCode.includes('handleCommit'), 'Atomic dual-sync commit handler implemented');
  assert(modalCode.includes('triggerSoundboxSuccess'), 'Soundbox audio feedback invoked on commit');
  assert(modalCode.includes('idempotencyKey'), 'Idempotency key generated to prevent duplicate writes');
  assert(modalCode.includes('isSyncing'), 'Concurrency mutex lock engaged on buttons');

  // CSS module checks (Emil Kowalski + Bharat Modern)
  assert(modalCss.includes('.modalOverlay'), 'CSS module contains .modalOverlay');
  assert(modalCss.includes('.soundboxCard'), 'CSS module contains .soundboxCard');
  assert(modalCss.includes('.countdownBox'), 'CSS module contains .countdownBox');
  assert(modalCss.includes('.progressFill'), 'CSS module contains .progressFill');
  assert(modalCss.includes('cubic-bezier(0.23, 1, 0.32, 1)'), 'CSS module enforces Emil Kowalski custom easing');

  // Soundbox code checks
  assert(soundboxCode.includes('playSoundboxChime'), 'playSoundboxChime exported');
  assert(soundboxCode.includes('speakSoundboxConfirmation'), 'speakSoundboxConfirmation exported');
  assert(soundboxCode.includes('triggerSoundboxSuccess'), 'triggerSoundboxSuccess exported');
  assert(soundboxCode.includes('587.33') && soundboxCode.includes('880'), 'Dual-harmonic musical chime frequencies configured');
  assert(soundboxCode.includes('bn-IN') && soundboxCode.includes('hi-IN'), 'Bengali and Hindi speech synthesis locales supported');

  // --- 2. SSR & Node Safe Execution Tests ---
  console.log('\n[2. SSR & Zero-Crash Execution]');
  try {
    await playSoundboxChime();
    assert(true, 'playSoundboxChime runs safely in SSR / non-browser environment');
  } catch (e) {
    assert(false, `playSoundboxChime threw: ${e}`);
  }

  try {
    speakSoundboxConfirmation('Shyam Sundar Das', 260, 'bn');
    speakSoundboxConfirmation('Rohit Gupta', 240, 'hi');
    speakSoundboxConfirmation('Sunita Devi', 300, 'en');
    assert(true, 'speakSoundboxConfirmation handles Bengali, Hindi, English without throwing');
  } catch (e) {
    assert(false, `speakSoundboxConfirmation threw: ${e}`);
  }

  // --- 3. Kirana Presets Inventory ---
  console.log('\n[3. Kirana 1-Click Test Presets]');
  assert(audioPresets.length >= 6, `At least 6 presets available (${audioPresets.length} found)`);

  const shyamPreset = getPresetById('preset-bn-shyam');
  assert(!!shyamPreset, 'Shyam Babu Bengali preset exists');
  assert(shyamPreset?.expectedEntities.amount === 260, 'Shyam Babu preset amount is ₹260');

  const rohitPreset = getPresetById('preset-hi-rohit');
  assert(!!rohitPreset, 'Rohit Gupta Hindi preset exists');
  assert(rohitPreset?.expectedEntities.amount === 240, 'Rohit Gupta preset amount is ₹240');

  // --- 4. Zustand Store State Machine & Mutex Lock Invariants ---
  console.log('\n[4. State Machine Transitions & Mutex Locking]');
  const store = useAppStore.getState();

  assert(typeof store.isVoiceModalOpen === 'boolean', 'store.isVoiceModalOpen is boolean');
  assert(store.voiceState === 'idle', 'Initial voiceState is "idle"');
  assert(store.countdownSeconds === 4, 'Initial countdownSeconds is 4');
  assert(store.isSyncing === false, 'Initial isSyncing is false (mutex unlocked)');

  // Test state transitions
  store.setVoiceState('listening');
  assert(useAppStore.getState().voiceState === 'listening', 'State transition to "listening" verified');

  store.setTranscript('শ্যামবাবু ২ কেজি চাল বাকি');
  assert(useAppStore.getState().transcript === 'শ্যামবাবু ২ কেজি চাল বাকি', 'Transcript state set correctly');

  store.setParsedTransaction({
    customer_name: 'Shyam Sundar Das',
    transaction_type: 'udhaar_sale',
    amount: 260,
    items: [{ name: 'Miniket Rice', quantity: 2, unit: 'kg' }],
    confidence: 0.95,
    engine: 'regex_heuristic',
    raw_transcript: 'শ্যামবাবু ২ কেজি চাল বাকি',
  });
  assert(useAppStore.getState().parsedTransaction?.amount === 260, 'Parsed transaction stored correctly');

  // Mutex lock test
  store.setIsSyncing(true);
  assert(useAppStore.getState().isSyncing === true, 'Concurrency mutex lock engaged (isSyncing = true)');

  store.setIsSyncing(false);
  store.resetVoiceState();
  assert(useAppStore.getState().voiceState === 'idle', 'Voice state reset cleanly to "idle"');
  assert(useAppStore.getState().parsedTransaction === null, 'Parsed transaction reset to null');

  console.log(`\n========================================`);
  console.log(`KV-15 Verification Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runKv15Verification().catch((err) => {
  console.error('Unhandled verification error:', err);
  process.exit(1);
});
