import {
  audioPresets,
  generateSyntheticWavDataUri,
  getAllPresets,
  getPresetById,
  getPresetsByLanguage
} from '../src/lib/speech/audio-presets';
import {
  checkSpeechCapabilities,
  transcribeAudio
} from '../src/lib/speech/speech-adapter';
import {
  isWebSpeechSupported,
  mapLanguageToLocale,
  stopMediaStream
} from '../src/lib/speech/web-speech';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${message}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${message}`);
  }
}

async function runTests() {
  console.log('\n=== KV-05 Tri-Tier Speech Adapter Verification ===\n');

  // Test 1: Presets Inventory Completeness
  console.log('1. Checking Presets Inventory:');
  assert(audioPresets.length >= 4, `audioPresets has >= 4 items (found ${audioPresets.length})`);
  assert(getAllPresets().length === audioPresets.length, 'getAllPresets() matches inventory length');

  const requiredPresetIds = [
    'preset-bn-shyam',
    'preset-hi-rohit',
    'preset-en-sunita',
    'preset-bn-restock'
  ];
  for (const id of requiredPresetIds) {
    const p = getPresetById(id);
    assert(!!p, `Preset ${id} exists in inventory`);
    if (p) {
      assert(p.transcript.length > 0, `${id} has non-empty vernacular transcript`);
      assert(p.englishTranslation.length > 0, `${id} has English translation`);
      assert(!!p.expectedEntities, `${id} contains expectedEntities specification`);
      assert(
        Boolean(p.audioDataUri?.startsWith('data:audio/wav;base64,')),
        `${id} contains valid synthetic WAV data URI`
      );
    }
  }

  // Test 2: Language Filtering
  console.log('\n2. Checking Language-based filtering:');
  const bnPresets = getPresetsByLanguage('bn');
  const hiPresets = getPresetsByLanguage('hi');
  const enPresets = getPresetsByLanguage('en');
  assert(bnPresets.length >= 2, `Bengali presets >= 2 (found ${bnPresets.length})`);
  assert(hiPresets.length >= 2, `Hindi presets >= 2 (found ${hiPresets.length})`);
  assert(enPresets.length >= 1, `English presets >= 1 (found ${enPresets.length})`);

  // Test 3: Synthetic Audio Generator
  console.log('\n3. Checking Synthetic WAV Sound Generator:');
  const wavUri = generateSyntheticWavDataUri(0.5, 440);
  assert(wavUri.startsWith('data:audio/wav;base64,'), 'generateSyntheticWavDataUri returns data URI');
  // RIFF header in base64 starts with 'UklGR'
  assert(wavUri.includes('UklGR'), 'WAV data URI contains valid RIFF byte signature');

  // Test 4: Deterministic Preset Transcription Latency (<50ms SLA)
  console.log('\n4. Checking Tri-Tier Dispatcher with Presets (<50ms SLA):');
  const t0 = Date.now();
  const resShyam = await transcribeAudio({ presetId: 'preset-bn-shyam', language: 'bn' });
  const elapsed = Date.now() - t0;
  assert(elapsed < 50, `Preset transcription resolved in <50ms (took ${elapsed}ms)`);
  assert(resShyam.source === 'preset', 'Result source is "preset"');
  assert(resShyam.confidence === 0.99, 'Result confidence is 0.99');
  assert(
    resShyam.transcript === 'শ্যামবাবু ২ কেজি চাল আর ১ লিটার সর্ষের তেল বাকি লিখুন',
    'Result transcript matches exact Bengali ground-truth'
  );

  // Test 5: Fallback Cascade (Zero-Crash Guarantee without API keys)
  console.log('\n5. Checking Fallback Cascade without keys:');
  const resFallback = await transcribeAudio({ language: 'hi' });
  assert(!!resFallback.transcript, 'Fallback returns non-empty transcript');
  assert(resFallback.language === 'hi', 'Fallback preserves requested language');
  assert(resFallback.source === 'preset', 'Fallback source is "preset"');

  // Test 6: Web Speech Locale Mapping & SSR Safety
  console.log('\n6. Checking Web Speech Locale Mapping & Helpers:');
  assert(mapLanguageToLocale('bn') === 'bn-IN', 'Bengali mapped to bn-IN');
  assert(mapLanguageToLocale('hi') === 'hi-IN', 'Hindi mapped to hi-IN');
  assert(mapLanguageToLocale('en') === 'en-IN', 'English mapped to en-IN');
  assert(isWebSpeechSupported() === false, 'isWebSpeechSupported returns false safely in Node.js');

  // Test 7: Hardware Track Cleanup Safety
  console.log('\n7. Checking Stream Track Cleanup Guard:');
  let streamStopCalled = false;
  const mockTrack = {
    stop: () => {
      streamStopCalled = true;
    }
  };
  const mockStream = {
    getTracks: () => [mockTrack]
  } as unknown as MediaStream;

  stopMediaStream(null); // Should not throw
  assert(true, 'stopMediaStream(null) handled safely without throwing');

  stopMediaStream(mockStream);
  assert(streamStopCalled, 'stopMediaStream invoked track.stop() on active tracks');

  // Test 8: Capability Checker
  console.log('\n8. Checking Speech Capabilities Detector:');
  const caps = checkSpeechCapabilities();
  assert(caps.hasPresets === true, 'caps.hasPresets is true');
  assert(typeof caps.hasWebSpeech === 'boolean', 'caps.hasWebSpeech is boolean');
  assert(typeof caps.hasBhashiniConfigured === 'boolean', 'caps.hasBhashiniConfigured is boolean');
  assert(!!caps.defaultTier, `caps.defaultTier is populated (${caps.defaultTier})`);

  console.log(`\n==================================================`);
  console.log(`Summary: ${passed} passed, ${failed} failed.`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
