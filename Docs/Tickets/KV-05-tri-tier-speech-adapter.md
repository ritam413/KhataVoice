# KV-05: Tri-Tier Speech Recognition Adapter with 1-Click Audio Sample Presets

- **Epic:** Epic 2: Multilingual Speech & NLP Engine
- **Priority:** P0 (Blocker)
- **Story Points:** 5 SP
- **Upstream Dependencies:** KV-01
- **Downstream Blockers:** KV-08
- **Target Files:**
  - `src/lib/speech/speech-adapter.ts`
  - `src/lib/speech/audio-presets.ts`
  - `src/lib/speech/web-speech.ts`
  - `src/types/speech.ts`

---

## 1. Architectural Role & Objective
Implement the resilient tri-tier Speech Recognition Adapter. To ensure 100% fail-safe performance during live hackathon demos and video recording takes:
1. **Tier 1 (Client-Side Web Speech API):** Browser-native speech recognition for Bengali (`bn-IN`), Hindi (`hi-IN`), and English (`en-IN`) with zero network latency and zero API keys.
2. **Tier 2 (Server Bhashini Dhruva ASR Proxy):** Server-side proxy for the Indian Government's Bhashini pipeline accepting 16kHz WAV mono audio.
3. **Tier 3 (1-Click Realistic Audio Sample Presets):** Built-in realistic Bengali, Hindi, and English Kirana spoken audio samples with authentic transcripts that bypass the microphone entirely for deterministic judge evaluation.

---

## 2. Input Contract & Pre-Conditions
- Audio inputs: Microphone stream via `MediaRecorder` or pre-encoded Base64 WAV / preset payload.
- Supported Language codes: `'bn'` (Bengali), `'hi'` (Hindi), `'en'` (English).
- Fallback config: If Bhashini API key is unconfigured, automatic downgrade to Web Speech API or Preset bypass without throwing unhandled exceptions.

---

## 3. State Invariants & Hardening Guards
- **Microphone Permission Denied Handling:** If user blocks browser mic permissions, adapter gracefully catches `NotAllowedError` and triggers a toast notification offering the 1-Click Audio Sample Presets.
- **AudioContext Thread Cleanup:** When recording completes or is cancelled, all media tracks (`stream.getTracks().forEach(t => t.stop())`) must be halted immediately to avoid microphone indicator leaks.
- **Preset Transcripts Determinism:** Each audio preset must include the exact vernacular transcript, the English translation, and the expected parsed entities.

---

## 4. Implementation Details

### 4.1 Audio Presets Inventory (`src/lib/speech/audio-presets.ts`)
Must include at least 4 pre-configured Kirana scenarios:
1. **Preset 1 (Bengali Udhaar Sale):**
   - Title: "শ্যামবাবু: ২ কেজি চাল আর ১ লিটার তেল বাকিতে"
   - Transcript: `"শ্যামবাবু ২ কেজি চাল আর ১ লিটার সর্ষের তেল বাকি লিখুন"`
   - Expected: Customer `Shyam Sundar Das`, Type `udhaar_sale`, Amount `₹260`, Items `[Mustard Oil 1L, Rice 2kg]`.
2. **Preset 2 (Hindi Udhaar Sale):**
   - Title: "रोहित जी: 5 किलो आटा और 2 पैकेट मैगी उधार"
   - Transcript: `"रोहित जी के खाते में 5 किलो आशीर्वाद आटा और 2 पैकेट मैगी उधार लिख दो"`
   - Expected: Customer `Rohit Gupta`, Type `udhaar_sale`, Amount `₹240`, Items `[Aashirvaad Atta 5kg, Maggi 2pk]`.
3. **Preset 3 (Hinglish Cash Sale):**
   - Title: "सुनीता जी: ₹300 नकद जमा"
   - Transcript: `"Sunita Devi paid 300 rupees cash today"`
   - Expected: Customer `Sunita Devi`, Type `payment_received`, Amount `₹300`.
4. **Preset 4 (Inventory Restock):**
   - Title: "দোকানের স্টক: ১০ টিন তেল এলো"
   - Transcript: `"Dokan e 10 tin Fortune mustard oil stock elo"`
   - Expected: Type `restock`, Item `Fortune Mustard Oil`, Quantity `10`.

### 4.2 Tri-Tier Adapter (`src/lib/speech/speech-adapter.ts`)
```typescript
export interface SpeechTranscriptionResult {
  transcript: string;
  language: 'bn' | 'hi' | 'en';
  confidence: number;
  source: 'web_speech' | 'bhashini' | 'preset';
  durationMs: number;
}

export async function transcribeAudio(
  input: { blob?: Blob; presetId?: string; language: 'bn' | 'hi' | 'en' }
): Promise<SpeechTranscriptionResult> {
  // 1. Check if preset ID provided -> instant return
  if (input.presetId) {
    const preset = getPresetById(input.presetId);
    return {
      transcript: preset.transcript,
      language: preset.language,
      confidence: 0.99,
      source: 'preset',
      durationMs: 1200
    };
  }

  // 2. Delegate to Server Bhashini if configured, else client Web Speech
  // ...
}
```

---

## 5. Behavior-Driven Specification (Given / When / Then)

### Scenario 1: Demo Preset Selection
- **Given:** A user in a noisy hackathon room selects "Preset 1 (Bengali Udhaar Sale)".
- **When:** `transcribeAudio({ presetId: 'preset-bn-shyam' })` executes.
- **Then:** Result resolves in $< 50\text{ms}$ with source `'preset'` and authentic Bengali transcript.

### Scenario 2: Web Speech Recognition
- **Given:** A user speaking into the microphone in Google Chrome.
- **When:** Speech recognition fires `onresult`.
- **Then:** Real-time interim and final transcripts are emitted to the callback listener.

---

## 6. Automated Verification Gates
```bash
# Verify presets dictionary completeness
node -e "const { audioPresets } = require('./src/lib/speech/audio-presets.ts'); console.assert(audioPresets.length >= 4, 'Insufficient presets');"
```
