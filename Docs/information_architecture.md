# KhataVoice: Information Architecture (IA)

This document outlines the structural design, taxonomy, user flows, and hierarchical navigation model of **KhataVoice**. The architecture is optimized for **Dual-Mode Ergonomics**: an authentic mobile Kirana experience (for handheld micro-merchants) alongside an expansive Desktop Command Center (for store managers, analytics, and hackathon judge evaluation).

---

## 1. High-Level Architectural Model

```
                                    +-----------------------------------------+
                                    |         KHATAVOICE ROOT APP SHELL       |
                                    +-----------------------------------------+
                                                         |
                   +-------------------------------------+-------------------------------------+
                   |                                                                           |
     [MOBILE KIRANA VIEW (Default Mobile)]                                     [DESKTOP COMMAND CENTER]
     • High-contrast vernacular UX                                              • Multi-column financial operations
     • Oversized 1-tap Mic CTA (72px)                                          • Real-time stock valuation & velocity
     • Compact tabbed navigation                                               • Interactive Judge ROI Calculator
                   |                                                                           |
                   +-------------------------------------+-------------------------------------+
                                                         |
        +-------------------------+----------------------+-------------------------+
        |                         |                      |                         |
[1. LEDGER & VOICE HUB]    [2. INVENTORY & STOCK]   [3. CUSTOMER RECOVERY]   [4. JUDGE & BUSINESS SUITE]
  • Voice Capture Sheet      • Current Stock Table    • Customer Directory      • Unit Economics Simulator
  • Waveform Visualizer      • Low-Stock Alerts       • 0-100 Trust Score Hub   • Scalability Architecture
  • 1-Click Audio Presets    • Restock Logging        • WhatsApp wa.me Dispatch • Devpost Rubric Walkthrough
  • Live Transaction Stream  • Category Filter        • UPI QR Deep Links       • Speech Latency Benchmark
```

---

## 2. Navigation Hierarchy & Route Structure

KhataVoice is built on Next.js 14/15 App Router using a fluid, responsive single-page container architecture with modal and drawer overlays. This guarantees zero page reloads, seamless audio state retention, and sub-100ms screen transitions.

### 2.1 Route Map
| Route Path | View Type | Primary Purpose | Key Entities Displayed |
| :--- | :--- | :--- | :--- |
| `/` | Responsive Home (Mobile / Desktop Switcher) | Main application shell with real-time toggle between **Phone Simulator** and **Desktop Command Center**. | Overview metrics, Voice CTA, active tab controller. |
| `/#ledger` | Ledger View | Full historical feed of credit sales, cash sales, payments, and restocks. | Timestamp, Customer, Type, Items, Amount, Status. |
| `/#inventory` | Stock Management | Live inventory catalog with quantity tracking, unit costs, and reorder alerts. | SKU, Category, Stock Level, Unit, Alert Threshold. |
| `/#customers` | Credit & Recovery | Customer directory sorted by outstanding debt and Credit Trust Score (0–100). | Customer Name, Phone, Outstanding Balance, Trust Badge. |
| `/#judge` | Hackathon Suite | Dedicated Judge Tour featuring live unit economics calculator and architecture inspector. | Cost per entry, MRR projections, CAC/LTV, Scalability diagram. |

---

## 3. Detailed Component & Section Taxonomy

### 3.1 Section 1: Voice-to-Ledger Hub (Primary Wedge)
```
[Voice-to-Ledger Hub]
  ├── [Microphone Launcher]
  │     ├── Animated Saffron Mic Button (Idle / Recording / Processing states)
  │     ├── Language Selector (Bengali 'bn', Hindi 'hi', Hinglish, English 'en')
  │     └── Audio Sample Presets Drawer (Bengali Mustard Oil, Hindi Atta, Hinglish Payment)
  ├── [Active Audio Visualizer Modal]
  │     ├── Real-time Canvas Waveform Animation
  │     ├── Live Vernacular Transcription Bubble
  │     └── Speech Engine Indicator Badge (Web Speech API / Bhashini Dhruva)
  ├── [Parsed Transaction Confirmation Sheet]
  │     ├── Extracted Entities (Customer, Type, Items, Quantity, Total Amount)
  │     ├── Catalog Matching Indicators (SKU mapped vs. custom item)
  │     ├── "Confirm & Dual-Sync" CTA Button
  │     └── "Quick Edit / Cancel" Secondary Action
  └── [Recent Activity Stream]
        ├── Daily Metrics Ribbon (Today's Udhaar Owed, Cash Collected, Net Sales)
        └── Chronological Transaction Feed Cards
```

### 3.2 Section 2: Store Inventory & Stock Engine
```
[Inventory Management]
  ├── [Stock Health Summary Ribbon]
  │     ├── Total SKUs in Catalog
  │     ├── Low-Stock Critical Alert Count (<5 units)
  │     └── Total Wholesale Inventory Valuation (₹)
  ├── [Catalog Filter & Search Bar]
  │     ├── Real-time Text Search (Item name, SKU, Category)
  │     └── Category Pills (Groceries, Edible Oils, Dairy, Spices, Packaged Snacks)
  ├── [Stock Item Table / Grid]
  │     ├── Product Name (Vernacular + English)
  │     ├── Current Quantity & Stock Gauge Indicator
  │     ├── Unit Price & Cost Price
  │     └── Status Pill (In Stock [Green], Low Stock [Amber], Depleted [Red])
  └── [Quick Restock Modal]
        ├── Spoken Restock Entry trigger
        └── Manual Count Increment (+1, +5, +10 quick chips)
```

### 3.3 Section 3: Customer Directory & Debt Recovery Suite
```
[Customer Recovery Hub]
  ├── [Outstanding Debt Aggregator]
  │     ├── Total Outstanding Udhaar (₹) across all customers
  │     ├── Overdue > 30 Days Risk Capital (₹)
  │     └── Repayment Velocity Metric (Avg. days to settle)
  ├── [Customer List & Segmentation]
  │     ├── Filter by Trust Tier: Gold (85-100), Silver (65-84), Bronze/At-Risk (<65)
  │     ├── Filter by Aging: Current (0-7d), Overdue (8-21d), Critical (22d+)
  │     └── Search by Customer Name or Phone Number
  └── [Customer Profile & WhatsApp Recovery Drawer]
        ├── Customer Metadata & Lifetime Purchase Total
        ├── Algorithmic Trust Score Breakdown (Velocity, Ratio, Frequency)
        ├── Historical Transaction Timeline (itemized ledger receipts)
        └── [1-Tap WhatsApp Reminder Engine]
              ├── Tone Picker: Polite Gentle / Friendly Follow-up / Firm Overdue
              ├── Language Picker: Bengali / Hindi / English
              ├── Dynamic Message Preview Box with embedded UPI link
              └── "Send on WhatsApp (wa.me)" Direct CTA
```

### 3.4 Section 4: Hackathon Judge Business & Architecture Suite
```
[Judge Evaluation Suite]
  ├── [Interactive Unit Economics & ROI Calculator]
  │     ├── Dynamic Sliders: Voice Entries / Day (20 to 300)
  │     ├── Dynamic Sliders: Pro Subscription Price (₹99 to ₹499/mo)
  │     ├── Live Computed Cost-Per-Entry (ASR + LLM + DB = ₹0.10)
  │     ├── Gross Margin % (74% to 82%)
  │     └── Shopkeeper Payback Period & Working Capital Unlocked
  ├── [Architecture & Scalability Inspector]
  │     ├── Pluggable Speech Engine Architecture Diagram (Web Speech, Bhashini, Whisper)
  │     ├── Multi-Tenant Isolation & Zero-Downtime Resilience
  │     └── Hybrid NLP Pipeline (LLM + Deterministic Fallback)
  └── [Devpost Rubric Alignment Tracker]
        ├── Technical Execution (25%) evidence check
        ├── Innovation & UX (25%) evidence check
        ├── Business & Finance (25%) evidence check
        └── Communication (25%) evidence check
```

---

## 4. Data Flow Architecture

The diagram below maps how speech data flows from client capture to atomic persistence across subsystems:

```
[User Speaks Audio]
        │
        ▼
[Audio Stream / Blob] ───────────────► [Speech Adapter]
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
          [Web Speech API (Client)]                     [Bhashini Dhruva ASR (Server)]
                      │                                               │
                      └───────────────────────┬───────────────────────┘
                                              ▼
                                    [Raw Text Transcript]
                                              │
                                              ▼
                                   [Hybrid NLP Parser]
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
          [Ollama / Cloud LLM API]                    [Regex Heuristic Fallback Engine]
                      │                                               │
                      └───────────────────────┬───────────────────────┘
                                              ▼
                                 [Structured Transaction JSON]
                                              │
                                              ▼
                                  [Atomic Dual-Sync Engine]
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
           [Customer Credit Ledger]                          [Store Inventory]
          • Balance updated                                • Stock count decremented
          • Trust score recomputed                         • Low-stock badge checked
                      │                                               │
                      └───────────────────────┬───────────────────────┘
                                              ▼
                                    [UI Reactive Update]
                                   • Audio chime played
                                   • Recent activity refreshed
                                   • WhatsApp reminder ready
```

---

## 5. Visual Hierarchy & Design Priority

To maintain clarity and speed during fast-paced Kirana counter operations, interface elements strictly adhere to the following visual hierarchy:

1. **Level 1 (Highest Visual Weight):** The glowing animated **Saffron Microphone CTA** and the **Total Today's Udhaar Summary Card**.
2. **Level 2:** Confirmation sheets displaying extracted transaction pills (Amount in Emerald Green, Customer Name in bold white, Items in amber chips).
3. **Level 3:** Critical status warnings: Red "Out of Stock" badges and Bronze "At-Risk Customer" badges.
4. **Level 4:** Secondary action buttons: WhatsApp Reminder dispatch, Preset audio buttons, and Filter tabs.
5. **Level 5 (Lowest Visual Weight):** Background metadata, item category labels, and timestamp strings.
