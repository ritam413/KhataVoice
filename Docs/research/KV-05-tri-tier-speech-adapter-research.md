# Deep Research Report: KV-05 Tri-Tier Speech Recognition Adapter

**Ticket:** [KV-05-tri-tier-speech-adapter.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/Docs/Tickets/KV-05-tri-tier-speech-adapter.md)  
**Epic:** Epic 2: Multilingual Speech & NLP Engine  
**Priority:** P0 (Blocker)  
**Story Points:** 5 SP  
**Persona:** `wshobson-agents` (ROLE: DEVELOPER)  
**Discipline:** `/ponytail` (YAGNI, stdlib-first, zero runtime bloat) & `/firecrawl` (Official Specs)  
**Date:** 2026-10-14  

---

## 1. Executive Summary & Architectural Role

KhataVoice is designed for 13–15 million Indian neighborhood Kirana shopkeepers who operate in loud, chaotic storefronts in Kolkata, Delhi, and Tier-2/3 towns. For the Next Founders Hackathon (judged by Ekansh Jain, Co-Founder of LUMA), reliable speech-to-text is the critical first stage of the voice-to-ledger pipeline. If voice capture stutters, crashes, or hangs during a live evaluation or video take, the entire product value proposition fails.

To eliminate single-point-of-failure risks, ticket **KV-05** implements a resilient **Tri-Tier Speech Recognition Architecture**:

```
                               ┌───────────────────────────┐
                               │   Audio Input Request     │
                               │ (Mic, Audio Blob, Preset) │
                               └─────────────┬─────────────┘
                                             │
               ┌─────────────────────────────┼─────────────────────────────┐
               ▼                             ▼                             ▼
   ┌───────────────────────┐   ┌───────────────────────────┐   ┌───────────────────────┐
   │ Tier 1: Client Web    │   │ Tier 2: Server Bhashini   │   │ Tier 3: 1-Click Audio │
   │ Speech API (In-Device)│   │ Dhruva ASR Proxy (MeitY)  │   │ Sample Presets        │
   ├───────────────────────┤   ├───────────────────────────┤   ├───────────────────────┤
   │ • Zero server latency │   │ • Official Govt pipeline  │   │ • 100% Deterministic  │
   │ • No API keys needed  │   │ • 16kHz mono WAV ASR      │   │ • Instant (<50ms)     │
   │ • Native bn/hi/en     │   │ • Beng/Hindi/English      │   │ • Zero-mic fail-safe  │
   │ • Live interim stream │   │ • Backend key isolation   │   │ • Full parsed targets │
   └───────────────────────┘   └───────────────────────────┘   └───────────────────────┘
```

---

## 2. Tier 1: Client-Side Web Speech API Deep Dive

### 2.1 Browser Engine & Specifications
- **Standard:** W3C Web Speech API specification (`SpeechRecognition` / `webkitSpeechRecognition`).
- **Support:** Native in Google Chrome (Desktop & Android), Microsoft Edge, Chromium-based browsers, and Safari (iOS 14.5+).
- **BCP-47 Language Mapping:**
  - Bengali: `bn-IN` (Bengali - India)
  - Hindi: `hi-IN` (Hindi - India)
  - English: `en-IN` (English - India)

### 2.2 Lifecycle State Machine
```
[idle] ──start()──► [starting] ──onaudiostart──► [listening] ──onspeechstart──► [capturing]
                                                                                   │
                                                     onresult (interim & final) ◄──┤
                                                                                   │
[idle] ◄──onend──── [stopping] ◄──onspeechend / onaudioend ────────────────────────┘
```

### 2.3 Critical Hardening Guards & Thread Cleanup
1. **Hardware Microphone Indicator Leak Prevention:**
   When a user stops recording or closes the modal, any active `MediaStream` tracks MUST be stopped explicitly:
   ```typescript
   export function stopMediaStream(stream?: MediaStream | null): void {
     if (!stream) return;
     stream.getTracks().forEach((track) => {
       track.stop(); // Sets track.readyState to 'ended' and shuts off tab red dot
     });
   }
   ```
2. **Permission Denied (`NotAllowedError`) Handling:**
   If the browser blocks microphone access or the shopkeeper denies permissions, the adapter must not throw an unhandled rejection. Instead, it catches `not-allowed` / `service-not-allowed`, emits a typed error code (`MICROPHONE_PERMISSION_DENIED`), and suggests activating the **1-Click Audio Sample Presets**.
3. **SSR Safety:**
   Safely guards against Next.js server evaluation by checking `typeof window !== 'undefined'`.

---

## 3. Tier 2: Server-Side Bhashini Dhruva ASR Pipeline Deep Dive

### 3.1 Official Government API Specifications
- **Authority:** Digital India Bhashini Division (Ministry of Electronics and Information Technology - MeitY).
- **Compute Endpoint:** `POST https://dhruva-api.bhashini.gov.in/services/inference/pipeline`
- **Authentication Headers:**
  - `Content-Type: application/json`
  - `Accept: application/json`
  - `Authorization: ${process.env.BHASHINI_API_KEY}`
  - `ulcaApiKey: ${process.env.BHASHINI_USER_ID}` (or User ID header)

### 3.2 Request Payload Schema (ASR Task)
```json
{
  "pipelineTasks": [
    {
      "taskType": "asr",
      "config": {
        "serviceId": "ai4bharat/conformer-multilingual-dravidian-indo-aryan--gpu",
        "language": {
          "sourceLanguage": "bn"
        },
        "audioFormat": "wav",
        "samplingRate": 16000
      }
    }
  ],
  "inputData": {
    "audio": [
      {
        "audioContent": "<BASE64_ENCODED_16KHZ_MONO_WAV>"
      }
    ]
  }
}
```

### 3.3 Response Payload Parsing
```json
{
  "pipelineResponse": [
    {
      "taskType": "asr",
      "config": { ... },
      "output": [
        {
          "source": "শ্যামবাবু ২ কেজি চাল আর ১ লিটার সর্ষের তেল বাকি লিখুন"
        }
      ]
    }
  ]
}
```
*Note:* In Bhashini's ASR response format, the generated speech transcription is returned under `output[0].source` (not `target`, which is reserved for translation tasks).

### 3.4 Zero-Crash Fallback Guard
If `process.env.BHASHINI_API_KEY` is unconfigured, or if the government server times out (>3,000 ms), the adapter does NOT crash. It falls back smoothly with informative diagnostic logs, allowing local development and zero-setup deployment on Vercel without mandatory secret provisioning.

---

## 4. Tier 3: 1-Click Audio Sample Presets Inventory

### 4.1 Hackathon Rationale & Judge Persona
Ekansh Jain (Judge) reviews submissions across strict technical and usability criteria. Live microphone tests in video presentations frequently encounter background noise, bad room acoustics, or permission dialogs. 
The **1-Click Audio Sample Presets** provide instant, deterministic, authentic Kirana scenarios that resolve in $< 50\text{ms}$ with 0.99 confidence and complete ground-truth transcripts.

### 4.2 Presets Inventory Table

| ID | Title | Lang | Spoken Transcript | Expected Transaction |
| :--- | :--- | :--- | :--- | :--- |
| `preset-bn-shyam` | শ্যামবাবু: ২ কেজি চাল আর ১ লিটার তেল বাকিতে | `bn` | `"শ্যামবাবু ২ কেজি চাল আর ১ লিটার সর্ষের তেল বাকি লিখুন"` | Udhaar Sale: Shyam Sundar Das, ₹260, Miniket Rice 2kg + Mustard Oil 1L |
| `preset-hi-rohit` | रोहित जी: 5 किलो आटा और 2 पैकेट मैगी उधार | `hi` | `"रोहित जी के खाते में 5 किलो आशीर्वाद आटा और 2 पैकेट मैगी उधार लिख दो"` | Udhaar Sale: Rohit Gupta, ₹240, Aashirvaad Atta 5kg + Maggi 2pk |
| `preset-en-sunita` | Sunita Devi: ₹300 cash repayment | `en` | `"Sunita Devi paid 300 rupees cash today"` | Payment Received: Sunita Devi, ₹300 |
| `preset-bn-restock` | দোকানের স্টক: ১০ টিন তেল এলো | `bn` | `"Dokan e 10 tin Fortune mustard oil stock elo"` | Restock: Fortune Mustard Oil 1L, Quantity 10 |
| `preset-hi-amit` | अमित दास: ₹150 का चीनी और बिस्कुट नकद | `hi` | `"अमित दास 2 किलो चीनी और 3 पैकेट बिस्कुट नकद दिया 150 रुपया"` | Cash Sale: Amit Das, ₹150, Sugar 2kg + Marie Biscuits 3pk |
| `preset-bn-rajesh` | রাজেশ মন্ডল: ৫০০ টাকা পুরানো বাকি শোধ | `bn` | `"রাজেশ মন্ডল পুরানো বাকি থেকে ৫০০ টাকা জমা দিলো"` | Payment Received: Rajesh Mondal, ₹500 |

### 4.3 Lightweight Synthetic Audio Generator (Stdlib)
To prevent bundling heavy binary MP3 files while supporting HTML5 `<audio>` preview playback, we synthesize a standard 44-byte PCM WAV header with a soft 440Hz Indic tone using pure standard library byte arrays:
```typescript
export function generateSyntheticWavDataUri(durationSeconds = 0.8, frequency = 440): string {
  // Pure stdlib 16-bit PCM WAV data URI generator
  const sampleRate = 8000;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);
  
  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, numSamples * 2, true);
  
  // Sine wave sample generation
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t) * 0.25 * 32767;
    view.setInt16(44 + i * 2, sample, true);
  }
  
  // Base64 encoding
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}
```

---

## 5. Contract Specification (`src/types/speech.ts`)

```typescript
import { Language, TransactionType } from './domain';

export type SpeechSource = 'web_speech' | 'bhashini' | 'preset';

export interface SpeechTranscriptionResult {
  transcript: string;
  language: Language;
  confidence: number;
  source: SpeechSource;
  durationMs: number;
  interim?: boolean;
}

export interface PresetExpectedEntities {
  customerName?: string;
  transactionType: TransactionType;
  amount?: number;
  items?: Array<{
    name: string;
    quantity: number;
    unit?: string;
    price?: number;
  }>;
}

export interface AudioPreset {
  id: string;
  title: string;
  description: string;
  language: Language;
  transcript: string;
  englishTranslation: string;
  expectedEntities: PresetExpectedEntities;
  durationMs: number;
  audioDataUri?: string;
}

export interface TranscribeAudioInput {
  blob?: Blob;
  audioBase64?: string;
  presetId?: string;
  language: Language;
  mimeType?: string;
}

export interface WebSpeechListener {
  onInterim?: (partialTranscript: string) => void;
  onFinal?: (finalTranscript: string, confidence: number) => void;
  onError?: (error: Error | string, code?: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export interface WebSpeechOptions {
  language: Language;
  continuous?: boolean;
  interimResults?: boolean;
  listeners?: WebSpeechListener;
}

export interface WebSpeechController {
  start: () => void;
  stop: () => void;
  abort: () => void;
  isListening: () => boolean;
  isSupported: boolean;
}

export interface SpeechCapabilities {
  hasWebSpeech: boolean;
  hasBhashiniConfigured: boolean;
  hasPresets: boolean;
  defaultTier: SpeechSource;
}
```

---

## 6. Implementation Architecture

### 6.1 Target Modules
1. `src/types/speech.ts`: Pure TypeScript domain contracts.
2. `src/lib/speech/audio-presets.ts`: Inventory of 6 authentic Kirana audio presets, lookup helpers, and synthetic WAV generator.
3. `src/lib/speech/web-speech.ts`: Browser Web Speech API wrapper, lifecycle handlers, permission recovery, and track cleanup.
4. `src/lib/speech/speech-adapter.ts`: Unified tri-tier dispatcher, capabilities inspector, and Bhashini proxy caller.

### 6.2 Downstream Alignment
- **KV-06 (Waveform Visualizer):** Reads audio stream while `web-speech` is active, utilizing shared track cleanup.
- **KV-08 (`POST /api/transcribe`):** Directly invokes `transcribeAudio()` from `speech-adapter`.
- **KV-15 (Voice Recording Modal):** Consumes `audioPresets` for 1-click preset selector tabs and `createWebSpeechRecognizer` for live dictation.

---

## 7. Verification & Testing Strategy

1. **Preset Completeness Assertions:**
   - Total presets $\ge 4$ (spec calls for 4, we deliver 6).
   - Each preset includes non-empty transcript, English translation, language code, and expected entities.
2. **Deterministic Preset Latency:**
   - Calling `transcribeAudio({ presetId: 'preset-bn-shyam', language: 'bn' })` must resolve in $< 50\text{ms}$ with source `'preset'`.
3. **Web Speech API Fallback Safety:**
   - Testing SSR environment (`typeof window === 'undefined'`) returns `isSupported = false` without throwing exceptions.
   - Permission rejection cleanly surfaces `MICROPHONE_PERMISSION_DENIED`.
4. **Build & Type Safety:**
   - `npm run type-check` (`tsc --noEmit`) passes with 0 errors.
   - `npm run build` passes with zero regressions.
