# KV-08: Route Handlers `POST /api/transcribe` & `POST /api/parse-transaction`

- **Epic:** Epic 2: Multilingual Speech & NLP Engine
- **Priority:** P0 (Blocker)
- **Story Points:** 3 SP
- **Upstream Dependencies:** KV-05, KV-07
- **Downstream Blockers:** KV-15
- **Target Files:**
  - `src/app/api/transcribe/route.ts`
  - `src/app/api/parse-transaction/route.ts`

---

## 1. Architectural Role & Objective
Implement the server-side REST API route handlers for audio transcription and transaction parsing. Provides a clean decoupling between browser clients and backend speech/NLP services. Enforces JSON request validation, payload size limits, CORS headers, error boundary fallbacks, and standard HTTP response status codes.

---

## 2. Input Contract & Pre-Conditions
- `POST /api/transcribe`:
  - Request: `{ audioBlobBase64?: string; presetId?: string; language: 'bn' | 'hi' | 'en' }`
  - Response 200: `{ success: true, transcript: string, confidence: number, source: string, durationMs: number }`
- `POST /api/parse-transaction`:
  - Request: `{ transcript: string; language: 'bn' | 'hi' | 'en'; merchantId?: string }`
  - Response 200: `{ success: true, data: ParsedTransaction }`

---

## 3. State Invariants & Hardening Guards
- **Payload Safety:** Reject audio payloads exceeding $5\text{MB}$ with `413 Payload Too Large`.
- **Zero-Failure Fallback Cascade:** If external ASR or LLM calls reject or encounter network timeout, the route catches the error internally, engages the local preset or regex engine, and returns HTTP 200 with fallback telemetry rather than failing the client.

---

## 4. Implementation Details

### 4.1 Route `POST /api/transcribe/route.ts`
- Validates request body using simple property assertions or Zod.
- Dispatches to `transcribeAudio()` from `@/lib/speech/speech-adapter`.
- Returns execution latency metrics in headers or body.

### 4.2 Route `POST /api/parse-transaction/route.ts`
- Fetches merchant inventory items for context matching from DB adapter.
- Passes transcript to `parseTransaction()` from `@/lib/nlp/parser-engine`.
- Returns structured JSON payload.

---

## 5. Behavior-Driven Specification (Given / When / Then)

### Scenario 1: Preset Transcription Request
- **Given:** Client sends `POST /api/transcribe` with `{ presetId: "preset-bn-shyam", language: "bn" }`.
- **When:** Route handler processes the payload.
- **Then:** Returns HTTP 200 with the exact Bengali transcript within $< 50\text{ms}$.

### Scenario 2: Parse Spoken Utterance
- **Given:** Client sends `POST /api/parse-transaction` with `{ transcript: "Rohit ji 500 udhaar", language: "hi" }`.
- **When:** Route handler executes.
- **Then:** Returns HTTP 200 with `{ transaction_type: "udhaar_sale", amount: 500, customer_name: "Rohit Gupta" }`.

---

## 6. Automated Verification Gates
```bash
# Typecheck route handler implementations
npx tsc --noEmit src/app/api/transcribe/route.ts src/app/api/parse-transaction/route.ts
```
