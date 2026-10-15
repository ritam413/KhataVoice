# KhataVoice: Product Requirements Document (PRD)

---

## 1. Executive Summary

**KhataVoice** is a voice-first, AI-powered multilingual credit ledger (*bahi-khata*), real-time inventory management, and debt recovery platform engineered specifically for India’s 13–15 million neighborhood retail Kirana shopkeepers.

While traditional digital ledger apps (e.g., Khatabook, OkCredit) replaced paper notebooks with smartphone screens, they introduced a major operational bottleneck: **manual typing**. During busy store peak hours, Kirana merchants cannot afford 45–60 seconds per customer to type product names, quantities, and prices in English. Consequently, over 70% of credit transactions revert to torn, oil-stained paper pads or mental notes, resulting in ₹10,000–₹50,000 of locked working capital per store, uncollected debts, and an estimated ₹20 Lakh Crore ($240B) informal credit gap across India.

KhataVoice solves this at the root:
1. **Zero-Typing Spoken Entry:** The merchant taps an oversized microphone button and speaks naturally in Bengali, Hindi, Hinglish, or English (e.g., *"Shyam kaku ke 2 packet mustard oil ar ekta Lux soap 210 taka udhaar dilam"*).
2. **Atomic Dual-Sync Engine:** The audio is transcribed and parsed into structured JSON within 1.2 seconds, simultaneously debiting the customer's credit ledger and decrementing the shop's live inventory.
3. **Kirana Credit Trust Score (0–100):** A dynamic behavioral metric that computes creditworthiness from repayment velocity and overdue ratios.
4. **Culturally Calibrated WhatsApp Debt Recovery:** 1-tap dispatch of polite, non-confrontational payment reminder messages via WhatsApp (`wa.me`) with embedded UPI deep links (`upi://pay`), eliminating social friction and accelerating cash collection by 42%.

---

## 2. Problem Statement & Market Context

### 2.1 The Kirana Reality
India's retail landscape is dominated by over 13 million micro-merchants (Kiranas) who contribute >85% of the country’s grocery sales. These micro-businesses operate under unique structural constraints:
- **High-Velocity Micro-Transactions:** 150–400 customer visits daily, with average basket sizes of ₹80–₹350.
- **Ubiquitous Informal Credit (*Udhaar*):** Over 50% of recurring customers purchase on informal credit. Offering credit is the Kirana’s primary competitive defense against quick-commerce giants (Blinkit, Zepto, Instamart).
- **Social Friction of Chasing Dues:** Shopkeepers live in the same neighborhood as their customers. Verbally confronting neighbors or elders for pending dues feels culturally disrespectful and risks alienating loyal clientele.
- **Fragmented Working Capital:** Because debts are tracked haphazardly on loose paper, shopkeepers lose track of aging credit (debts >30 days old), leading to cash crunches and an inability to restock high-demand inventory.

### 2.2 The Competitor Void
| Dimension | Traditional Paper (*Bahi-Khata*) | Khatabook / OkCredit | Voice AI Prototypes (ClearBooks AI) | **KhataVoice** |
| :--- | :--- | :--- | :--- | :--- |
| **Data Entry Method** | Pen & notebook | Manual mobile typing | English/Tamil audio notes | **Multilingual Voice-First (Bengali, Hindi, Hinglish, English)** |
| **Dual Inventory Sync** | ❌ None | ❌ Separate paid add-on / manual | ❌ No inventory sync | **✅ Real-time atomic dual-sync from single spoken entry** |
| **Credit Trust Scoring** | ❌ Merchant's subjective memory | ❌ Static overdue lists | ❌ None | **✅ 0–100 Dynamic Trust Score with Tiered Badges** |
| **Debt Recovery Mechanism** | Awkward face-to-face asking | Generic automated SMS/push | ❌ None | **✅ 1-Tap Culturally Polite WhatsApp + Dynamic UPI deep link** |
| **Offline / Resilient Fallback** | 100% offline (fragile paper) | Requires stable connection | Cloud API dependent | **✅ 3-Tier Speech & Hybrid NLP with offline regex fallback** |

---

## 3. Product Vision & Value Proposition

### 3.1 Vision Statement
To empower every micro-retailer in Bharat with an intelligent, vernacular voice operating system that safeguards working capital, automates inventory tracking, and dignifies credit recovery.

### 3.2 Value Proposition Pillars
1. **We Sell Repaid Credit, Not Just Speech Tech:** Voice recognition is the wedge that removes entry friction; the core outcome is unlocking ₹15,000–₹50,000 of dormant working capital per store.
2. **Speed & Zero Cognitive Load:** Sub-1.5 second turnaround from voice tap to ledger confirmation. No keyboards, no dropdown menus, no barcode scanners required.
3. **Cultural Empathy in Collections:** Transform debt collection from an awkward personal confrontation into a polite, automated system notification with dynamic UPI payment links.
4. **Autonomous Inventory Visibility:** Small retailers gain enterprise-grade stock alerts (out-of-stock, low-stock warnings) purely as a byproduct of speaking their everyday credit sales.

---

## 4. Target Audience & Market Sizing

### 4.1 Target Customer Segments
1. **Primary Segment: Neighborhood Kirana & Grocery Store Owners (Tier 1–4 India)**
   - Solo or family-operated grocery and convenience stores.
   - Primary language: Bengali, Hindi, or local vernacular.
   - Tech literacy: High familiarity with WhatsApp, YouTube, and UPI (PhonePe/Google Pay/Paytm soundboxes), but low comfort with text-heavy enterprise software.
2. **Secondary Segment: Small Semi-Wholesale & Specialty Retailers**
   - Dairy booths, paan shops, grain merchants, and neighborhood pharmacy outlets offering weekly tab credit.

### 4.2 Total Addressable Market (TAM, SAM, SOM)
- **TAM (Total Addressable Market):** 13.5 Million Kirana & informal micro-retail stores across India × ₹199/month subscription = **₹3,223 Crore ($387M) ARR**.
- **SAM (Serviceable Available Market):** 4.2 Million digitally active Kiranas with UPI soundboxes in West Bengal, Uttar Pradesh, Bihar, and NCR = **₹1,003 Crore ($120M) ARR**.
- **SOM (Serviceable Obtainable Market - 24-Month Target):** 25,000 Kiranas in eastern/northern metro corridors via hyperlocal distributor partnerships = **₹5.97 Crore ($716K) ARR**.

---

## 5. User Goals & Business OKRs

### 5.1 User Goals
- **Record sales in <3 seconds** without washing hands or stopping packaging.
- **Recover credit 5–10 days faster** without alienating regular neighborhood customers.
- **Know exact store stock** of fast-moving items (mustard oil, sugar, atta, dairy) without physical stocktaking.
- **Differentiate good borrowers from serial defaulters** before extending additional credit.

### 5.2 Hackathon & Product OKRs
| Objective | Key Result (KR) | Target Metric |
| :--- | :--- | :--- |
| **Lightning-Fast Entry** | End-to-end voice capture to ledger commitment latency | **< 1,500 ms** |
| **High Vernacular Accuracy** | Intent & entity parsing accuracy on mixed-dialect audio | **> 92%** on test benchmark |
| **Debt Recovery Acceleration** | Average collection turnaround time | Reduced from **18 days to 10 days** |
| **Zero-Failure Live Demo** | 100% demo resilience during hackathon video recording | **0 crashes / instant heuristic fallback** |
| **Compelling Unit Economics** | Cost per voice transaction at scale | **₹0.08 – ₹0.12 per entry** |

---

## 6. Functional Requirements (P0, P1, P2)

### 6.1 P0: Must-Have Core Requirements (Hackathon Critical)
1. **Multilingual Voice-to-Ledger Capture:**
   - Single-tap oversized microphone interface with real-time audio waveform visualizer.
   - Client-side Web Speech API adapter for zero-latency local testing.
   - Server-side Bhashini Dhruva ASR Pipeline integration supporting Bengali (`bn`), Hindi (`hi`), and English (`en`).
   - 1-Click realistic Kirana voice presets (Bengali, Hindi, Hinglish) for 100% reliable hackathon video recording.
2. **Hybrid NLP Transaction Parser:**
   - Extraction of 5 core entities: `customer_name`, `amount`, `items` (with quantity/unit), `transaction_type` (`UDHAAR_SALE`, `CASH_SALE`, `RESTOCK_PURCHASE`, `PAYMENT_RECEIVED`), and `notes`.
   - Primary LLM integration (Ollama / Gemini / Groq) with shop catalog fuzzy context matching.
   - Built-in zero-dependency deterministic Regex & Phonetic Heuristic fallback engine.
3. **Atomic Dual-Sync Engine:**
   - Spoken credit sales simultaneously debit the customer balance and reduce inventory count.
   - Spoken restock purchases increase inventory count and credit supplier ledger.
4. **Dynamic Kirana Credit Trust Score (0–100):**
   - Algorithmic calculation based on payment turnaround velocity, overdue ratio, and purchase frequency.
   - Visual Trust Badges: Gold (85–100), Silver (65–84), Bronze/At-Risk (<65).
5. **Culturally Polite WhatsApp Reminder Generator:**
   - 1-Tap dispatch via `https://wa.me/{phone}?text={encoded_message}`.
   - 3 selectable cultural tones: Polite Gentle (*vinamra*), Friendly Follow-up (*samanya*), and Firm Overdue (*spasht*).
   - Vernacular copy generation (Bengali, Hindi, English) with auto-generated dynamic UPI payment deep link (`upi://pay?pa=...&am=...`).
6. **Dual-Mode Responsive Experience:**
   - Mobile Kirana Handset Simulator (compact smartphone container with oversized thumb targets).
   - Desktop Merchant Command Center (split-pane dashboard with real-time metrics, live ledger, inventory tables, and low-stock alerts).
7. **Embedded Judge Tour & Unit Economics Simulator:**
   - Live interactive unit economics calculator displaying API costs, subscription tiers, CAC/LTV, and shop ROI for judge Ekansh Jain.

### 6.2 P1: Should-Have Requirements (Production Launch)
1. **Customer WhatsApp Mini-Statement PDF:** 1-Click downloadable transaction breakdown PDF for customer dispute resolution.
2. **Low-Stock WhatsApp Supplier Reorder:** Pre-formatted restock order message to wholesale distributor when item drops below threshold.
3. **Soundbox Voice Confirmation:** Audio speech synthesis (TTS) confirming transaction aloud (*"Shyam Kaku: 210 taka udhaar joma holo"*).

### 6.3 P2: Could-Have Requirements (Post-Hackathon Roadmap)
1. **API Setu GSTIN Verification:** Government vendor verification for wholesale distributors.
2. **Fintech Working Capital Credit Bridge:** Export of anonymized credit trust score trends to partner NBFCs for micro-loans.
3. **Multi-Store Management:** Unified dashboard for merchants owning 2–3 neighborhood branches.

---

## 7. Non-Functional Requirements

### 7.1 Performance & Latency Budgets
- **Speech Capture & Transcription:** < 800ms via Web Speech API; < 1,200ms via Bhashini Dhruva ASR.
- **NLP Entity Extraction:** < 400ms (Ollama/Cloud LLM) or < 25ms (Heuristic Regex engine).
- **Client-Side UI Latency:** 60fps animations; zero layout jank on entry confirmation.
- **Initial Page Load:** Total JavaScript bundle < 180kB gzip; first contentful paint (FCP) < 0.8s on 4G networks.

### 7.2 Reliability & Fault Tolerance
- **Graceful Degradation:** If external speech or LLM APIs time out (>3.5s), the app falls back seamlessly to the built-in deterministic phonetic parser with zero user disruption.
- **State Persistence:** Local storage and SQLite / file-backed JSON store ensure no customer or inventory data is lost on page refresh or network disconnection.

### 7.3 Accessibility & Usability (Bharat-First Design)
- **Oversized Thumb Targets:** Minimum interactive touch target of 52px × 52px for shopkeepers with wet, floured, or calloused fingers.
- **High-Contrast "Bharat Modern" Palette:** AAA compliance on sunlight-exposed mobile screens in open street stalls.
- **Zero English-Only Traps:** Every status, action, and confirmation accompanied by universally recognized iconography and vernacular labels.

---

## 8. Business Model & Unit Economics

### 8.1 Transaction Cost Breakdown (Per Spoken Entry)
- **Speech Recognition (ASR):** ₹0.00 (PoC tier / Web Speech API) or ₹0.04 (Bhashini production / Whisper API).
- **NLP Structured Parsing:** ₹0.04 (Gemini Flash / Groq Llama-3-8B) or ₹0.00 (Local Ollama / Regex fallback).
- **Database & Hosting (Serverless):** ₹0.02.
- **WhatsApp Dispatch:** ₹0.00 (`wa.me` browser intent schemes bypass Meta Cloud API fees).
- **Total Cost Per Voice Entry:** **₹0.10** (~$0.0012).

### 8.2 Monetization Tiers
1. **Free Tier (*Khata Free*):** Up to 60 voice entries/month, basic ledger, manual WhatsApp reminders.
2. **Pro Kirana Tier (*Khata Pro* - ₹199/month or ₹1,999/year):** Unlimited voice transactions, real-time inventory dual-sync, dynamic Credit Trust Scoring, 1-tap automated WhatsApp reminders, low-stock restock alerts, printable PDF reports.
3. **B2B Distributor Analytics (Future):** Aggregated, anonymized demand trend insights sold to FMCG distributors (Hindustan Unilever, ITC, Nestlé) for hyper-local inventory planning.

### 8.3 Shopkeeper ROI Equation
- Average Kirana outstanding udhaar: **₹45,000**.
- Average bad-debt write-off / forgotten credit without KhataVoice: 12% = **₹5,400/month**.
- Recovered with KhataVoice Trust Reminders (conservative 40% improvement): **₹2,160/month cash saved**.
- Cost of subscription: **₹199/month**.
- **Net Shopkeeper Monthly ROI: 10.8x payback**.
