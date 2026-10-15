# KhataVoice: MoSCoW Feature Prioritization

This document establishes the MoSCoW (Must Have, Should Have, Could Have, Won't Have) framework for **KhataVoice**, specifically aligned with the 4-day build sprint for the **Next Founders Hackathon** (Deadline: October 16, 2026 @ 2:30 AM IST) and the official 4-pillar judging rubric (25% Technical Execution, 25% Innovation & UX, 25% Business & Finance, 25% Communication).

---

## 1. Prioritization Framework Overview

```
+--------------------------------------------------------------------------+
|                               MoSCoW MATRIX                              |
+--------------------------------------------------------------------------+
|  MUST HAVE (60% Build Effort)     |  SHOULD HAVE (25% Build Effort)      |
|  - Zero-typing multilingual voice |  - One-click sample voice presets    |
|  - Dual-sync ledger + inventory   |  - Dynamic UPI QR deep links         |
|  - 0-100 Credit Trust Score       |  - Customer transaction mini-ledger  |
|  - Culturally polite WhatsApp     |  - Stock-out warning badges          |
|  - Dual Mobile/Desktop viewport   |  - Simulated latency benchmark tools |
|-----------------------------------+--------------------------------------|
|  COULD HAVE (15% Build Effort)    |  WON'T HAVE (Out of Hackathon Scope) |
|  - Vernacular TTS audio feedback  |  - Full WhatsApp Business Cloud API  |
|  - Supplier reorder draft intent  |  - Barcode scanner camera integration|
|  - Printable PDF customer summary |  - Multi-branch franchise sync       |
|  - Offline PWA service worker     |  - Direct banking NEFT/RTGS gateway  |
+--------------------------------------------------------------------------+
```

---

## 2. MUST HAVE (P0 - Non-Negotiable Core)
*Without these features, the product fails the core value proposition and cannot be demonstrated effectively in the 5-minute judge video.*

| Feature Name | Primary Objective | Judging Rubric Alignment | Implementation Detail |
| :--- | :--- | :--- | :--- |
| **Multilingual Voice Capture Interface** | Capture Bengali, Hindi, Hinglish, and English spoken transactions via 1-tap microphone. | Innovation & UX (25%) / Technical Execution (25%) | Oversized animated microphone button with real-time audio visualizer. Supports client-side Web Speech API and server-side Bhashini Dhruva ASR adapter. |
| **Hybrid NLP Transaction Parser** | Parse unstructured vernacular voice input into structured transaction JSON. | Technical Execution (25%) | Extracts Customer Name, Amount (₹), Line Items, Quantity/Units, and Transaction Type (`UDHAAR_SALE`, `CASH_SALE`, `PAYMENT_RECEIVED`, `RESTOCK_PURCHASE`). Includes fallback deterministic regex engine for zero-failure reliability. |
| **Atomic Dual-Sync Engine** | A single spoken entry updates both the customer credit ledger and store inventory count in real time. | Innovation & UX (25%) / Technical Execution (25%) | Relational transaction model ensuring no inventory or credit desynchronization occurs. Stock decrements upon udhaar/cash sales and increments upon restock purchases. |
| **Kirana Credit Trust Score (0–100)** | Algorithmic scoring of customer repayment reliability to eliminate bad debt. | Business & Finance (25%) | Calculates dynamic score based on Turnaround Velocity, Overdue Ratio, and Transaction Frequency. Color-coded badges: Gold (85–100), Silver (65–84), Bronze/At-Risk (<65). |
| **Culturally Polite WhatsApp Reminder Generator** | 1-Tap debt recovery messages with zero Meta API cost. | Innovation & UX (25%) / Business & Finance (25%) | Generates pre-formatted WhatsApp URLs (`wa.me`) with 3 cultural tones (Polite Gentle, Friendly Follow-up, Firm Overdue) in Bengali, Hindi, and English. Bundles merchant UPI deep link. |
| **Dual-Mode Viewport Simulator** | Allows judges to toggle between an authentic Kirana mobile phone view and a Desktop Command Center. | Innovation & UX (25%) / Communication (25%) | Responsive layout featuring an interactive "Phone View vs. Desktop Command Center" toggle button. Emulates real shopkeeper usage and store analytics. |
| **Interactive Judge Unit Economics Engine** | Interactive financial model demonstrating unit costs, SaaS pricing, and Kirana ROI. | Business & Finance (25%) / Communication (25%) | Real-time sliders for voice entries per day, subscription pricing (₹199/mo), API cost breakdowns (₹0.10/entry), and unlocked working capital metrics. |

---

## 3. SHOULD HAVE (P1 - High Impact Additions)
*Features that significantly elevate the pitch, enhance demo smoothness, and provide deep credibility to the judges.*

| Feature Name | Primary Objective | Judging Rubric Alignment | Implementation Detail |
| :--- | :--- | :--- | :--- |
| **1-Click Realistic Kirana Audio Presets** | Guaranteed zero-risk live video recording runs. | Communication (25%) / Technical Execution (25%) | Pre-configured realistic audio sample buttons (Bengali mustard oil udhaar, Hindi dal-chawal cash sale, Hinglish partial payment) that feed directly into the parser. |
| **Dynamic UPI Payment Links** | Frictionless debt clearance for end customers. | Business & Finance (25%) | Deep link formatted as `upi://pay?pa=merchant@okhdfcbank&pn=KhataStore&am=210&cu=INR` embedded in every WhatsApp message and customer ledger card. |
| **Live Low-Stock & Out-of-Stock Badges** | Proactive inventory loss prevention. | Innovation & UX (25%) | Real-time threshold calculation displaying red/amber warning badges when stock counts fall below reorder points. |
| **Customer Transaction Ledger Drawer** | In-depth audit trail per customer. | Technical Execution (25%) | Expandable side drawer displaying historical purchases, payments, aging dues, and trust score history. |
| **Architecture & Scalability Inspector** | Visual explanation of cloud architecture for the 5-minute video pitch. | Technical Execution (25%) / Communication (25%) | Embedded modal/tab diagram illustrating tenant isolation, speech adapter pluggability, and distributed scaling. |

---

## 4. COULD HAVE (P2 - Nice to Have If Time Permits)
*Features designed and architected in the technical spec, implemented if the build sprint finishes ahead of schedule.*

| Feature Name | Primary Objective | Post-Hackathon / Sprint Status | Implementation Detail |
| :--- | :--- | :--- | :--- |
| **Vernacular Voice Confirmation (TTS)** | Audio soundbox confirmation of committed transactions. | Could Have (Day 4 stretch) | Web Speech Synthesis or Bhashini TTS speaking: *"Shyam Babu: 210 taka udhaar songrokkhon kora holo."* |
| **Supplier WhatsApp Restock Draft** | 1-Tap wholesale restock order message. | Could Have (Day 4 stretch) | Aggregates low-stock items and formats a message to distributor: *"Bhaiya, need 10kg mustard oil and 5 bags atta tomorrow."* |
| **Printable / Downloadable Customer Slip** | Digital receipt for customer dispute settlement. | Could Have (Day 4 stretch) | Client-side HTML-to-PDF / print-friendly window generating a clean bilingual transaction receipt. |
| **Offline PWA Local Storage Cache** | Full offline capability during power outages. | Planned for Production | IndexedDB / Service Worker caching of recent entries, syncing when network reconnects. |

---

## 5. WON'T HAVE (P3 - Explicitly Out of Scope for Hackathon)
*Deliberately excluded to prevent scope creep, dependency traps, and wasted sprint hours.*

| Excluded Feature | Reason for Exclusion | Alternative Implemented |
| :--- | :--- | :--- |
| **Meta WhatsApp Business Cloud API Integration** | Requires Meta business manager approval, credit card verification, template pre-approvals, and ₹0.80 per conversation fee. | Replaced with native `https://wa.me/{phone}?text=...` deep linking which is 100% free, instant, and frictionless. |
| **Hardware Barcode Camera Scanner** | Slow, awkward for loose grains/spices (dal, rice, oil), and requires expensive device cameras. | Spoken voice entity extraction completely eliminates barcode requirements. |
| **Full Payment Gateway Integration (Razorpay/Stripe SDK)** | Requires merchant KYC, merchant onboarding webhooks, and 2% gateway processing fees. | Utilizes direct peer-to-peer UPI deep links (`upi://pay`) with 0% MDR and instant settlement. |
| **Multi-Store Enterprise Franchise Sync** | Overkill for single-outlet neighborhood Kiranas; distracts from the core working capital recovery message. | Single-store multi-tenant architecture designed cleanly in `techspec.md`. |
| **API Setu GSTIN Verification** | Government access requires complex partner authorization and paper verification taking weeks. | Documented as a post-hackathon enterprise distributor roadmap item. |

---

## 6. Sprint Execution Schedule (Oct 12 – Oct 16)

```
Day 1 (Mon Oct 12):
  - Lock PRD, MoSCoW, Information Architecture, and System Design.
  - Setup Next.js 14/15 App Router project with TypeScript and Vanilla CSS design tokens.
  - Implement SQLite/file-backed JSON storage engine with atomic dual-sync logic.

Day 2 (Tue Oct 13):
  - Build Speech Adapter (Web Speech API + Bhashini proxy + Audio Preset fallbacks).
  - Implement Hybrid NLP Parser (Ollama / Cloud LLM + deterministic regex fallback).
  - Verify dual-sync: Udhaar debit & inventory stock decrement.

Day 3 (Wed Oct 14):
  - Build Kirana Credit Trust Score algorithm (0-100) and badges.
  - Build 1-Tap Culturally Polite WhatsApp reminder modal with UPI deep link generation.
  - Build Dual-Mode Viewport (Phone Simulator vs. Desktop Command Center).

Day 4 (Thu Oct 15):
  - Build Interactive Judge Unit Economics & Scalability Inspector.
  - End-to-end stress testing across Bengali, Hindi, and English entries.
  - Record 5-minute pitch video following the 4-part structure (Problem, Build, Demo, Scalability).
  - Submit on Devpost prior to the Oct 16, 2:30 AM IST deadline.
```
