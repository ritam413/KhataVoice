# KhataVoice: Visual Architecture & Knowledge Graphs (graphify)

This document visualizes the complete architectural topology, data pipelines, state machines, and ticket execution dependencies for **KhataVoice** generated via `/graphify`.

---

## 1. End-to-End System Topology & Data Pipeline

```mermaid
graph LR
  subgraph ClientLayer ["Client Layer (Browser / Handset)"]
    Mic["🎙️ 1-Tap Mic Button"]
    Waveform["Audio Waveform Canvas"]
    Presets["1-Click Audio Sample Presets"]
    LocalWebSpeech["Native Web Speech API (bn/hi/en)"]
    ZustandStore["🐻 Zustand v5 Store (useAppStore: UI, Voice, Ledger, Stock)"]
    Viewport["Dual-Mode Viewport Simulator"]
  end

  subgraph RouteHandlers ["Next.js App Router (Server API)"]
    TranscribeRoute["POST /api/transcribe"]
    ParseRoute["POST /api/parse-transaction"]
    DualSyncRoute["POST /api/dual-sync"]
    ReminderRoute["POST /api/reminders/generate"]
    LedgerRoute["GET /api/ledger"]
    InventoryRoute["GET /api/inventory"]
  end

  subgraph ProcessingEngines ["Speech & NLP Engines"]
    Bhashini["Bhashini Dhruva ASR Proxy"]
    OllamaLLM["Ollama / Gemini Structured JSON Parser"]
    RegexEngine["Deterministic Heuristic Regex Fallback"]
    TrustEngine["Credit Trust Score Engine (0-100)"]
    ReminderEngine["Cultural WhatsApp Formatter"]
  end

  subgraph PersistenceLayer ["Persistence Layer (Supabase / Local)"]
    SupabaseDB[("Supabase Cloud PostgreSQL")]
    StoredProc["execute_spoken_dual_sync (ACID RPC)"]
    RealtimeChannel["Supabase Realtime Channel"]
    LocalMock[("In-Memory Local Mock Store")]
  end

  subgraph ExternalConsumers ["External Channels & Judges"]
    WhatsAppNative["WhatsApp Deep Link (wa.me)"]
    UPILink["Direct UPI Deep Link (upi://pay)"]
    DesktopCenter["Desktop Merchant Command Center"]
    JudgeSuite["Interactive Unit Economics Simulator"]
  end

  %% Client to Server & Speech flows
  Mic --> Waveform
  Mic --> LocalWebSpeech
  Mic --> TranscribeRoute
  Presets --> TranscribeRoute
  LocalWebSpeech --> ZustandStore
  LocalWebSpeech --> ParseRoute
  ZustandStore --> Viewport

  %% Speech & NLP Processing
  TranscribeRoute --> Bhashini
  TranscribeRoute --> ParseRoute
  ParseRoute --> OllamaLLM
  ParseRoute -. Fallback .-> RegexEngine

  %% Dual Sync Flow
  ParseRoute --> DualSyncRoute
  DualSyncRoute --> StoredProc
  StoredProc --> SupabaseDB
  DualSyncRoute -. Zero-Key Fallback .-> LocalMock
  StoredProc --> TrustEngine

  %% Realtime & Downstream Notifications
  SupabaseDB --> RealtimeChannel
  RealtimeChannel --> DesktopCenter
  TrustEngine --> ReminderRoute
  ReminderRoute --> ReminderEngine
  ReminderEngine --> WhatsAppNative
  ReminderEngine --> UPILink

  %% Views & Judge Suite
  Viewport --> DesktopCenter
  Viewport --> JudgeSuite
```

---

## 2. BEADS 22-Ticket Dependency DAG (Execution Cartography)

```mermaid
graph TD
  subgraph Epic1 ["Epic 1: Foundation (Day 1)"]
    KV01["KV-01: Next.js Scaffolding"] --> KV02["KV-02: Supabase DDL & Client with Fallback"]
    KV01 --> KV03["KV-03: Design Tokens"]
    KV03 --> KV04["KV-04: Atomic UI Primitives"]
  end

  subgraph Epic2 ["Epic 2: Speech & NLP (Day 2)"]
    KV01 --> KV05["KV-05: Speech Adapter & 1-Click Presets"]
    KV04 --> KV06["KV-06: Waveform Canvas Visualizer"]
    KV01 --> KV07["KV-07: Hybrid NLP Parser with Regex Fallback"]
    KV05 --> KV08["KV-08: Transcribe & Parse API Routes"]
    KV07 --> KV08
  end

  subgraph Epic3 ["Epic 3: Dual-Sync & Business Logic (Day 2-3)"]
    KV02 --> KV09["KV-09: ACID Dual-Sync Stored Proc & Mutex"]
    KV02 --> KV10["KV-10: Trust Score Engine & UPI Validation"]
    KV09 --> KV11["KV-11: Dual-Sync API Route"]
    KV10 --> KV11
    KV02 --> KV12["KV-12: WhatsApp URL Engine with Web Fallback"]
    KV10 --> KV12
    KV02 --> KV13["KV-13: Ledger & Inventory API Routes"]
  end

  subgraph Epic4 ["Epic 4: Screens & Dual-Mode UI (Day 3)"]
    KV04 --> KV14["KV-14: Viewport Simulator & Zustand v5 Store"]
    KV06 --> KV15["KV-15: Screens 1 & 2 Home & Voice Modal"]
    KV08 --> KV15
    KV11 --> KV15
    KV13 --> KV16["KV-16: Screens 3 & 4 Ledger & Stock Tables"]
    KV11 --> KV16
    KV12 --> KV17["KV-17: Screen 5 WhatsApp Recovery Modal"]
    KV14 --> KV18["KV-18: Screen 6 Desktop Command Center"]
    KV15 --> KV18
    KV16 --> KV18
    KV17 --> KV18
  end

  subgraph Epic5 ["Epic 5: Judge Suite & Production (Day 4)"]
    KV01 --> KV19["KV-19: Screen 7 Judge Economics Simulator"]
    KV01 --> KV20["KV-20: Architecture Inspector"]
    KV18 --> KV21["KV-21: Multilingual E2E Testing"]
    KV19 --> KV21
    KV20 --> KV21
    KV21 --> KV22["KV-22: Vercel Deploy & Video Pitch Assets"]
  end
```

---

## 3. Spoken Transaction Lifecycle & Concurrency Mutex State Machine

```mermaid
graph TD
  StateIdle["1. IDLE: Tap 🎙️ or 1-Click Preset"] --> StateListening["2. LISTENING: Audio Waveform Reacts"]
  StateListening --> StateTranscribing["3. TRANSCRIBING: Web Speech / Bhashini"]
  StateTranscribing --> StateParsed["4. PARSED: Entity Pill Badges Rendered"]
  
  StateParsed --> StateCountdown["5. 4-SECOND COUNTDOWN: Progress Bar Animates"]
  
  StateCountdown --> |Cancel / Edit Tapped| StateIdle
  StateCountdown --> |Timer Expires OR Instant Confirm| StateLocking["6. MUTEX LOCK: Optimistic Double-Submit Guard"]
  
  StateLocking --> StateSyncing["7. ATOMIC DUAL-SYNC: Stored Proc / Local Fallback"]
  
  StateSyncing --> StateSuccess["8. COMMITTED: Stock Decremented, Ledger Updated"]
  StateSuccess --> StateFeedback["9. SOUNDBOX FEEDBACK: Audio Chime & Vernacular TTS"]
  StateSuccess --> StateWhatsAppOption["10. WHATSAPP ACTION: 1-Tap wa.me Reminder Ready"]
```

---

## 4. Zero-Config Multi-Tier Fallback Pipeline

```mermaid
graph LR
  subgraph InputTier ["Input Trigger"]
    SpokenInput["User Spoken Speech"]
    PresetInput["1-Click Demo Preset"]
  end

  subgraph SpeechTier ["Speech Recognition"]
    WebSpeech["Tier 1: Client Web Speech API (0 Latency)"]
    BhashiniASR["Tier 2: Bhashini Dhruva ASR Proxy"]
    PresetBypass["Tier 3: Synthetic Audio Transcript Bypass"]
  end

  subgraph NLPTier ["Entity Parsing"]
    LLMParser["Cloud Gemini / Local Ollama (JSON Mode)"]
    RegexFallback["Deterministic Regex & Phonetic Dictionary"]
  end

  subgraph DBTier ["Persistence Layer"]
    CloudSupabase[("Primary: Supabase Cloud PostgreSQL")]
    LocalStore[("Fallback: In-Memory JSON Store")]
  end

  SpokenInput --> WebSpeech
  WebSpeech -. Network Error .-> BhashiniASR
  PresetInput --> PresetBypass

  WebSpeech --> LLMParser
  BhashiniASR --> LLMParser
  PresetBypass --> LLMParser

  LLMParser -. API Error / Offline .-> RegexFallback

  LLMParser --> CloudSupabase
  RegexFallback --> CloudSupabase

  CloudSupabase -. Unset Env Vars .-> LocalStore
```
