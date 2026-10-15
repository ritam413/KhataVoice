# KhataVoice: Application State & Flow Specifications (appflow.md)

This document specifies the end-to-end operational workflows, state machines, transition triggers, and error recovery pathways across all subsystems of **KhataVoice**.

---

## 1. Global Application State Machine

```
                              +--------------------+
                              |    APP_BOOTSTRAP   |
                              +---------+----------+
                                        |
                 [Load initial database state & catalog cache]
                                        |
                                        ▼
                              +--------------------+
                              |     STATE_IDLE     | <───────────────────────────┐
                              +---------+----------+                             │
                                        |                                        │
           ┌────────────────────────────┼────────────────────────────┐           │
           │                            │                            │           │
           ▼                            ▼                            ▼           │
 [VOICE_RECORD_FLOW]          [LEDGER_RECOVERY_FLOW]       [INVENTORY_RESTOCK]   │
           │                            │                            │           │
           └────────────────────────────┼────────────────────────────┘           │
                                        │                                        │
                                        ▼                                        │
                              [STATE_COMMITTED] ─────────────────────────────────┘
```

---

## 2. Voice-to-Ledger Core Flow State Machine

The voice capture flow transitions through seven deterministic states:

```
[IDLE] ──(Tap Mic)──> [LISTENING] ──(Silence/Stop)──> [TRANSCRIBING]
                                                             │
                                                   (Raw transcript text)
                                                             │
                                                             ▼
[COMMITTED] <──(Confirm/Timeout)── [REVIEW_CONFIRMATION] <── [PARSING]
     │
     └──(Optional)──> [WHATSAPP_DISPATCH] ──> [IDLE]
```

### Detailed State Transition Table
| Source State | Event / Trigger | Target State | Actions & Side Effects | Timeout / Fallback |
| :--- | :--- | :--- | :--- | :--- |
| **`STATE_IDLE`** | `TAP_MIC_BUTTON` | **`STATE_LISTENING`** | Initialize Web Audio context; start Canvas waveform animation; request microphone permissions. | Error if permission denied -> prompt permission banner. |
| **`STATE_LISTENING`** | `STOP_MIC_BUTTON` or `SILENCE_DETECTED` (1.8s) | **`STATE_TRANSCRIBING`** | Stop audio recorder; extract audio blob; pass to Speech Adapter. | Max duration clamp at 10.0 seconds. |
| **`STATE_TRANSCRIBING`** | `ASR_SUCCESS` | **`STATE_PARSING`** | Receive raw text string (e.g., *"Shyam kaku 2 packet mustard oil 210 taka udhaar"*). | If Web Speech fails -> trigger server Bhashini; if Bhashini times out (>3.5s) -> prompt retry / load preset. |
| **`STATE_PARSING`** | `PARSER_SUCCESS` | **`STATE_REVIEW`** | Extract structured JSON (Customer, Amount, Items, Type); run fuzzy match against inventory catalog. | If LLM API fails -> trigger deterministic Heuristic Regex fallback (<20ms). |
| **`STATE_REVIEW`** | `TAP_CONFIRM` or `AUTO_COMMIT_3S` | **`STATE_COMMITTING`** | Present confirmation card with item badges, customer pill, and total amount. | Merchant can tap "Edit" to modify quantities or cancel entry. |
| **`STATE_COMMITTING`** | `ATOMIC_SYNC_DONE` | **`STATE_COMMITTED`** | Execute atomic dual-sync: update ledger balance, decrement stock counts, recalculate Trust Score. | Trigger success sound effect; display 5s undo snackbar. |
| **`STATE_COMMITTED`** | `DISMISS` or `TIMEOUT_5S` | **`STATE_IDLE`** | Refresh daily metrics ribbon; append entry to activity feed. | Reset audio visualizer to baseline. |

---

## 3. Dual-Sync Atomic Transaction Flow

This sequence diagram illustrates how a single spoken credit entry updates both financial and stock records simultaneously:

```
Shopkeeper              Client UI           Route Handler         Storage Layer
    │                       │                     │                     │
    │── Speaks entry ──────>│                     │                     │
    │                       │── POST /dual-sync ─>│                     │
    │                       │   (parsed payload)  │── Acquire mutex ───>│
    │                       │                     │                     │
    │                       │                     │── 1. Create Ledger ─>│
    │                       │                     │   Entry (Udhaar)    │
    │                       │                     │                     │
    │                       │                     │── 2. Update Customer>│
    │                       │                     │   Balance (+₹210)   │
    │                       │                     │                     │
    │                       │                     │── 3. Decrement Stock>│
    │                       │                     │   (Oil: -2 units)   │
    │                       │                     │                     │
    │                       │                     │── 4. Recompute Trust>│
    │                       │                     │   Score (0-100)     │
    │                       │                     │                     │
    │                       │                     │── Release mutex ───>│
    │                       │<── 200 OK Sync ─────│                     │
    │<── UI Confirmation ───│    (updated state)  │                     │
```

---

## 4. Culturally Polite WhatsApp Debt Recovery Flow

```
[User Navigates to Customers Tab]
              │
              ▼
[Selects Customer with Overdue Debt] ───► [Opens Customer Profile Drawer]
                                                         │
                                                         ▼
                                            [System Evaluates Trust Score]
                                            • Gold (85-100): Punctual
                                            • Silver (65-84): Regular
                                            • Bronze (<65): At-Risk
                                                         │
                                                         ▼
                                            [Select Recovery Parameters]
                                            1. Cultural Tone (Polite / Friendly / Firm)
                                            2. Language (Bengali / Hindi / English)
                                                         │
                                                         ▼
                                            [Preview Generated Message]
                                            • Mentions exact outstanding balance
                                            • Praises relationship (if Gold/Silver)
                                            • Embeds dynamic UPI payment deep link
                                                         │
                                                         ▼
                                            [Tap "Send on WhatsApp"]
                                                         │
                                                         ▼
                                       [Opens Native WhatsApp (wa.me)]
                                       • Merchant reviews in chat
                                       • Taps Send
                                                         │
                                                         ▼
                                       [Customer Receives Message]
                                       • Taps UPI Link
                                       • Settles via PhonePe / GPay
```

---

## 5. Fallback & Resilience Error Pathways

```
                                  [Voice Input Initiated]
                                             │
                                             ▼
                             [Try Native Web Speech API]
                                             │
                            ┌────────────────┴────────────────┐
                         Success                           Failure
                            │                                 │
                            ▼                                 ▼
                     [Raw Transcript]               [Try Server Bhashini ASR]
                            │                                 │
                            │                      ┌──────────┴──────────┐
                            │                   Success               Timeout / Error
                            │                      │                         │
                            │                      ▼                         ▼
                            │               [Raw Transcript]        [Prompt Audio Preset Fallback]
                            │                      │                         │
                            └──────────────────────┼─────────────────────────┘
                                                   │
                                                   ▼
                                       [Raw Transcript Received]
                                                   │
                                                   ▼
                                    [Try Ollama / Cloud LLM Parser]
                                                   │
                                  ┌────────────────┴────────────────┐
                               Success                           Failure
                                  │                                 │
                                  ▼                                 ▼
                         [Structured JSON]             [Deterministic Regex Parser]
                                  │                                 │
                                  └────────────────┬────────────────┘
                                                   ▼
                                       [Structured Transaction]
                                                   │
                                                   ▼
                                        [Atomic Dual-Sync Write]
```

---

## 6. Viewport Switching & Hackathon Judge Mode Flow

1. **Header Controller:** An interactive pill toggle in the top navigation bar enables switching between:
   - **Phone Mode:** Encapsulates the UI inside an iPhone/Android mobile chassis with realistic bezel, time ribbon, and mobile viewport ergonomics.
   - **Desktop Command Center Mode:** Unfolds into an expansive 3-column dashboard with live inventory tables, customer debt graphs, and real-time transaction streams.
2. **Judge Suite Tab (`#judge`):**
   - Direct shortcut to unit economics sliders and architecture inspection.
   - Allows Judge Ekansh Jain to simulate cost per entry and annual profit margins instantly.
