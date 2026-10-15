# KhataVoice: Technical Specification (TechSpec)

---

## 1. System Architecture Overview

KhataVoice is designed as an ultra-responsive, resilient full-stack application built with **Next.js 14/15 App Router**, **TypeScript**, and **Vanilla CSS Modules**. It employs a hybrid edge-server architecture with an isolated storage layer, a pluggable multi-provider speech adapter, and an offline-capable heuristic NLP fallback engine.

```
+───────────────────────────────────────────────────────────────────────────────────+
|                                  CLIENT LAYER (BROWSER)                           |
|  • Next.js Client Components ("use client")                                       |
|  • Zustand v5 Unified Store (`useAppStore`: UI, Voice, Ledger, Inventory Slices)  |
|  • Native Web Audio API / MediaRecorder (16kHz PCM WAV / WebM)                     |
|  • Web Speech API (webkitSpeechRecognition) Adapter for zero-latency local ASR    |
|  • Canvas Audio Waveform Visualizer & Dual-Mode Viewport Simulator               |
+───────────────────────────────────────────────────────────────────────────────────+
                                          │
                      HTTP / Server Action Requests (JSON / Base64)
                                          │
                                          ▼
+───────────────────────────────────────────────────────────────────────────────────+
|                           SERVER LAYER (NEXT.JS ROUTE HANDLERS)                   |
|                                                                                   |
|  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌───────────────────┐  |
|  | /api/transcribe         |  | /api/parse-transaction  |  | /api/dual-sync    |  |
|  └────────────┬────────────┘  └────────────┬────────────┘  └─────────┬─────────┘  |
|               │                            │                         │            |
|               ▼                            ▼                         ▼            |
|  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌───────────────────┐  |
|  | Multi-Engine ASR Adapter|  | Hybrid NLP Parser       |  | Transaction Unit  |  |
|  | • Bhashini Dhruva ASR   |  | • Local Ollama LLM      |  | • Ledger update   |  |
|  | • OpenAI Whisper proxy  |  | • Cloud LLM (Gemini/Groq|  | • Inventory sync  |  |
|  | • Audio Preset bypass   |  | • Deterministic Regex   |  | • Trust Score calc|  |
|  └─────────────────────────┘  └─────────────────────────┘  └───────────────────┘  |
+───────────────────────────────────────────────────────────────────────────────────+
                                          │
                                          ▼
+───────────────────────────────────────────────────────────────────────────────────+
|                           PERSISTENCE LAYER (SUPABASE POSTGRESQL)                 |
|  • Primary Production Database: Supabase Cloud PostgreSQL (RLS, Realtime, RPC)    |
|  • Atomic Dual-Sync Stored Procedure (`execute_spoken_dual_sync`) in PostgreSQL   |
|  • Supabase Realtime Channels for live Desktop Command Center sync                |
|  • Graceful Fallback: In-memory/JSON local engine if Supabase keys unconfigured   |
+───────────────────────────────────────────────────────────────────────────────────+
```

---

## 2. Speech-to-Text (ASR) Pipeline Architecture

To achieve 100% demo resilience during live hackathon evaluation while demonstrating authentic Indian-language infrastructure, KhataVoice implements a **Tri-Tier Speech Adapter**:

```
                              [Incoming Audio Request]
                                          │
               ┌──────────────────────────┼──────────────────────────┐
               ▼                          ▼                          ▼
      [Tier 1: Client Web Speech]   [Tier 2: Bhashini Dhruva]  [Tier 3: 1-Click Preset]
      • Native browser engine       • Government Speech API     • Pre-recorded audio
      • Zero API keys / 0 latency   • 22 Indian languages       • 100% fail-safe demo take
      • Instant transcript stream   • 16kHz WAV compute         • Instant mock payload
```

### 2.1 Tier 1: Client-Side Web Speech API
- **Implementation:** `window.SpeechRecognition || window.webkitSpeechRecognition`.
- **Language mapping:** Bengali (`bn-IN`), Hindi (`hi-IN`), English (`en-IN`).
- **Characteristics:** Zero latency, runs completely on-device in Chrome/Chromium, requires no server roundtrip or API keys.

### 2.2 Tier 2: Server-Side Bhashini Dhruva ASR Pipeline
- **Endpoint:** `POST https://dhruva-api.bhashini.gov.in/services/inference/pipeline`
- **Audio Specification:** 16,000 Hz sample rate, single-channel (mono), 16-bit linear PCM WAV or base64 encoded audio string.
- **Request Payload Structure:**
```json
{
  "pipelineTasks": [
    {
      "taskType": "asr",
      "config": {
        "language": {
          "sourceLanguage": "bn"
        },
        "serviceId": "ai4bharat/conformer-multilingual-dravidian-indo-aryan--gpu",
        "audioFormat": "wav",
        "samplingRate": 16000
      }
    }
  ],
  "inputData": {
    "audio": [
      {
        "audioContent": "<BASE64_ENCODED_WAV_STRING>"
      }
    ]
  }
}
```
- **Required Headers:**
  - `Content-Type: application/json`
  - `Accept: application/json`
  - `Authorization: ${BHASHINI_API_KEY}`
  - `ulcaApiKey: ${BHASHINI_USER_ID}`

### 2.3 Tier 3: 1-Click Audio Sample Presets (Fail-Safe Video Mode)
- Bundles pre-verified Kirana spoken audio samples in Bengali, Hindi, and Hinglish.
- If network connectivity drops or the Bhashini government server times out (>3,000 ms), the application gracefully loads verified Kirana transcripts, ensuring the 5-minute video recording never encounters an embarrassing error screen.

---

## 3. Natural Language Processing (NLP) & Entity Extraction

The transcribed vernacular text must be parsed into a strictly typed transaction entity:

```typescript
export interface ParsedTransaction {
  customer_name: string;
  amount: number;
  transaction_type: 'UDHAAR_SALE' | 'CASH_SALE' | 'PAYMENT_RECEIVED' | 'RESTOCK_PURCHASE';
  items: Array<{
    item_name: string;
    quantity: number;
    unit: string;
    unit_price?: number;
  }>;
  confidence: number;
  raw_transcript: string;
  language: 'bn' | 'hi' | 'en';
}
```

### 3.1 Primary Parser: LLM JSON Mode (Ollama / Gemini / Groq)
The server constructs a high-density prompt enriched with the merchant's current inventory catalog to resolve phonetic spelling variances:

```markdown
SYSTEM PROMPT:
You are KhataVoice AI, a transaction parsing engine for Indian Kirana stores.
Analyze the user's spoken vernacular text in Bengali, Hindi, or Hinglish.
Match item names against the store catalog: ["Mustard Oil", "Sugar", "Atta", "Amul Milk", "Lux Soap", "Rice"].
Return ONLY valid JSON matching this schema:
{
  "customer_name": string,
  "amount": number,
  "transaction_type": "UDHAAR_SALE" | "CASH_SALE" | "PAYMENT_RECEIVED" | "RESTOCK_PURCHASE",
  "items": [{"item_name": string, "quantity": number, "unit": string, "unit_price": number}],
  "confidence": number
}
```

### 3.2 Deterministic Heuristic Regex Fallback Engine
To eliminate external API dependencies during local development and ensure instantaneous zero-cost execution, a deterministic tokenizer and phonetic regex matcher is included:
- **Transaction Type Detection:**
  - `UDHAAR_SALE`: Matches `udhaar`, `baki`, `dhare`, `khata`, `dilam`, `diyechhi`.
  - `PAYMENT_RECEIVED`: Matches `shodh`, `joma`, `chuktaho`, `jama`, `payment`, `wapas`.
  - `RESTOCK_PURCHASE`: Matches `restock`, `stock`, `kena`, `kharida`, `crate`, `packet anlo`.
  - `CASH_SALE`: Matches `nogod`, `rokod`, `cash`.
- **Entity Extraction:**
  - Extracts numeric currency amounts (`₹`, `taka`, `rupaye`, `rs`, digits).
  - Extracts quantities and units (`kg`, `litre`, `packet`, `bag`, `katti`, `bottle`).
  - Matches customer names from the active merchant contact book via Levenshtein distance.

---

## 4. Atomic Dual-Sync Execution Engine

In traditional retail software, accounting ledgers and warehouse inventories reside in disconnected modules. KhataVoice executes an **Atomic Dual-Sync Protocol**:

```typescript
export async function executeDualSyncTransaction(
  merchantId: string,
  transaction: ParsedTransaction
): Promise<SyncResult> {
  // 1. Acquire mutex lock on store state
  return await db.transaction(async (tx) => {
    // 2. Insert Ledger Entry
    const ledgerEntry = await tx.ledger.create({
      data: {
        merchant_id: merchantId,
        customer_name: transaction.customer_name,
        amount: transaction.amount,
        type: transaction.transaction_type,
        items_json: JSON.stringify(transaction.items),
        timestamp: new Date().toISOString()
      }
    });

    // 3. Update Customer Balance & Trust Metric
    if (transaction.transaction_type === 'UDHAAR_SALE') {
      await tx.customer.incrementBalance(transaction.customer_name, transaction.amount);
    } else if (transaction.transaction_type === 'PAYMENT_RECEIVED') {
      await tx.customer.decrementBalance(transaction.customer_name, transaction.amount);
      await tx.customer.recordPaymentTimestamp(transaction.customer_name);
    }

    // 4. Update Inventory Counts
    for (const item of transaction.items) {
      if (transaction.transaction_type === 'UDHAAR_SALE' || transaction.transaction_type === 'CASH_SALE') {
        await tx.inventory.decrementStock(item.item_name, item.quantity);
      } else if (transaction.transaction_type === 'RESTOCK_PURCHASE') {
        await tx.inventory.incrementStock(item.item_name, item.quantity);
      }
    }

    // 5. Recompute Customer Credit Trust Score
    const updatedTrustScore = computeTrustScore(transaction.customer_name);
    await tx.customer.updateTrustScore(transaction.customer_name, updatedTrustScore);

    return { success: true, ledgerEntry, updatedTrustScore };
  });
}
```

---

## 5. Kirana Credit Trust Score Algorithm (0–100)

The credit score replaces subjective merchant memory with an objective, empirical formula:

$$\text{Trust Score} = w_1 \cdot V + w_2 \cdot (100 - R_{\text{overdue}}) + w_3 \cdot F + w_4 \cdot H$$

Where:
1. **$V$ (Payment Velocity Score, 40% weight):**
   $$V = \max\left(0, 100 - \left(\frac{\text{Avg Days to Repay}}{30}\right) \times 100\right)$$
   (Shorter repayment turnaround = higher score).
2. **$R_{\text{overdue}}$ (Overdue Ratio, 30% weight):**
   $$R_{\text{overdue}} = \min\left(100, \left(\frac{\text{Outstanding Balance}}{\text{Lifetime Repaid Purchases}}\right) \times 100\right)$$
3. **$F$ (Transaction Consistency Frequency, 15% weight):**
   Points awarded for consistent, recurring shop visits (10+ transactions = 100 points).
4. **$H$ (Historical Repayment Loyalty, 15% weight):**
   Percentage of previous debts paid in full without reminders.

### Badge Tier Thresholds
- **Gold Badge ($85 \le \text{Score} \le 100$):** High reliability, prime credit extended up to ₹3,000.
- **Silver Badge ($65 \le \text{Score} \le 84$):** Standard regular customer, credit capped at ₹1,500.
- **Bronze / At-Risk Badge ($\text{Score} < 65$):** High default risk, credit capped at ₹200; proactive WhatsApp recovery advised.

---

## 6. WhatsApp Recovery & UPI Deep Link Schema

To ensure 100% free delivery without Meta Business Cloud API verification hurdles, KhataVoice utilizes native URI intent schemes:

### 6.1 WhatsApp Intent URI
```
https://wa.me/${cleanPhoneNumber}?text=${encodeURIComponent(recoveryMessage)}
```

### 6.2 Embedded UPI Payment URI
```
upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(merchantStoreName)}&am=${amountOwed}&cu=INR&tn=${encodeURIComponent('KhataVoice Bill Clearance')}
```

### 6.3 Vernacular Template Generator Matrix
- **Bengali Polite Gentle:**
  *"Nomoshkar {customer_name} kaku, Maa Tara General Store e apnar ₹{amount} er hishab baki ache. Shomoy moto PhonePe ba GPay er madhyome niche dewa link e click kore porishodh kore deben. Dhonyobad: {upi_link}"*
- **Hindi Friendly Follow-up:**
  *"Namaste {customer_name} ji, Gupta General Store me aapka ₹{amount} ka udhaar balance pending hai. Aapse anurodh hai ki is UPI link par click karke payment clear karein: {upi_link}"*
- **English Professional:**
  *"Dear {customer_name}, greetings from {store_name}. Your pending credit balance of ₹{amount} is due for settlement. Kindly clear via UPI using this secure link: {upi_link}. Thank you!"*

---

## 7. Storage Layer & Supabase (PostgreSQL) Architecture

KhataVoice uses **Supabase (PostgreSQL)** as its primary database, pairing enterprise-grade relational integrity with real-time replication:
- **Supabase Cloud PostgreSQL:** Fully managed Postgres database with Row-Level Security (RLS) policies isolating store data.
- **Atomic RPC Function (`execute_spoken_dual_sync`):** The entire spoken entry—customer balance adjustment, credit trust score recalculation, and inventory count decrement—executes inside a single ACID PostgreSQL stored procedure on Supabase.
- **Supabase Realtime:** The Desktop Command Center subscribes to the `supabase_realtime` publication on `ledger_entries` and `inventory_items`, ensuring that when the shopkeeper speaks an entry on their mobile phone, the desktop dashboard updates live without a browser refresh.
- **Fail-Safe Local Mode:** If `NEXT_PUBLIC_SUPABASE_URL` is omitted in development, the database adapter transparently switches to the embedded local JSON engine, ensuring zero blocker runs for hackathon evaluators.
- **Seed Data:** Pre-loaded with authentic Kirana stock items (Fortune Mustard Oil, Aashirvaad Atta, Tata Salt, Amul Butter, Dettol Soap) and real-world debtor profiles.

---

## 8. Client-Side State Architecture (Zustand v5)

To maintain 60fps rendering during audio visualization and ensure zero-drift state synchronization across the mobile handset and desktop command center, KhataVoice standardizes on **Zustand v5** (`zustand@^5.0.15`):

```
                        ┌─────────────────────────────────┐
                        │    useAppStore (Root Store)     │
                        └───────────────┬─────────────────┘
         ┌──────────────────┬───────────┴───────────┬──────────────────┐
         ▼                  ▼                       ▼                  ▼
   [UISlice]          [VoiceSlice]           [LedgerSlice]       [ReminderSlice]
   • Viewport mode    • Recording status     • Customer records  • Selected debtor
   • Active tab       • Speech transcripts   • Inventory items   • Recovery tone
   • Language code    • Draft transactions   • Dual-sync actions • WhatsApp message
   • Modal open state • 4s countdown timer   • Search filter     • Modal state
```

### 8.1 Key Architectural Guarantees
1. **Granular Subscriptions (`useShallow`):** Components subscribe only to exact state variables via `useShallow` from `zustand/react/shallow`. Audio visualizer frame ticks never cause re-renders of customer tables or inventory rows.
2. **Out-of-Tree Interactivity:** Web Speech recognition listeners and Supabase Realtime channel subscriptions can read and mutate state directly (`useAppStore.getState()`) without requiring React hooks or wrapping callbacks.
3. **Optimistic Updates with Mutex Lock:** During the 4-second auto-commit countdown, `isSyncing: true` locks all input controls against double-submission until the atomic dual-sync completes.
4. **Hydration Determinism:** Store default states are strictly synchronized across server pre-rendering and client mounting, eliminating Next.js hydration mismatch bugs.

---

## 9. Latency Budgets & SLA Summary

| Step | Operation | Target SLA | Fallback SLA |
| :--- | :--- | :--- | :--- |
| 1 | Audio MediaRecorder Capture | Immediate | Immediate |
| 2 | Speech Recognition (ASR) | < 800 ms (Web Speech) | < 1,200 ms (Bhashini) |
| 3 | NLP Entity Extraction | < 350 ms (Ollama / Cloud LLM) | < 20 ms (Heuristic Regex) |
| 4 | Atomic Dual-Sync DB Write | < 15 ms | < 15 ms |
| 5 | Trust Score Recomputation | < 5 ms | < 5 ms |
| 6 | UI Waveform & Card Update | < 16 ms (60 fps) | < 33 ms (30 fps) |
| **Total** | **Voice Tap to Ledger Commit** | **< 1,186 ms** | **< 1,250 ms** |

