# KhataVoice: Screen Specifications & Wireframe Blueprints (screens.md)

This document provides detailed UI layouts, element hierarchies, responsive behaviors, state indicators, and interaction specifications for all 7 primary screens in **KhataVoice**.

---

## Screen 1: Mobile Kirana Home Screen (Merchant Handset View)

**Target Viewport:** 390px × 844px (Mobile First)  
**Primary User:** Ramesh Babu (Storekeeper at Counter)  
**Objective:** Instant operational overview and 1-tap voice recording access with oversized controls.

```
+-------------------------------------------------------+
| [Maa Tara General Store]             [Phone | Desktop]|
| Kolkata, WB · 8:15 AM                 [Lang: বাংলা ▾]  |
+-------------------------------------------------------+
|  TODAY'S BUSINESS RIBBON                              |
|  +--------------------+  +-------------------------+  |
|  | Today's Udhaar Owed|  | Cash Collected Today    |  |
|  | ₹1,240             |  | ₹3,480                  |  |
|  | 5 customers        |  | 18 transactions         |  |
|  +--------------------+  +-------------------------+  |
|  Alert: 3 Items Low on Stock (Mustard Oil, Sugar) [!] |
+-------------------------------------------------------+
|                                                       |
|                     (((( 🎙️ ))))                      |
|             [TAP TO SPEAK TRANSACTION]                |
|             "বলুন: শ্যাম কাকু ২ প্যাকেট..."          |
|                                                       |
|  [Presets: 1-Click Bengali | Hindi | Hinglish Demo]   |
+-------------------------------------------------------+
|  RECENT ACTIVITY FEED                                 |
|  • Shyam Kaku  · Udhaar Sale  · ₹260 · [Gold 86]      |
|  • Cash Sale   · Mustard Oil  · ₹130 · Just now       |
|  • Sunita Devi · Repaid Dues  · ₹500 · 20 mins ago    |
+-------------------------------------------------------+
|  [Tab: 🎙️ Home]  [Tab: 📖 Ledger]  [Tab: 📦 Stock]   |
+-------------------------------------------------------+
```

### Key UI Elements
1. **Header Bar:** Store identity, current time, vernacular language picker (`বাংলা`, `हिंदी`, `English`), and the interactive "Phone Simulator vs. Desktop Command Center" toggle button.
2. **Daily Metrics Ribbon:** High-contrast cards displaying Today's Credit Issued, Cash Collected, and Low Stock count.
3. **Hero Voice Launcher:** 72px glowing Saffron circular button with gentle ambient pulse animation and assistive hint text in selected vernacular language.
4. **1-Click Audio Sample Presets:** Quick pill buttons allowing judges to trigger pre-recorded Kirana test entries instantly without speaking into their own microphone.
5. **Sticky Bottom Navigation:** Large 52px thumb tabs for Home, Ledger, and Inventory.

---

## Screen 2: Voice Entry Active Modal & Real-Time Waveform

**Trigger:** Tapping the Saffron Mic button on Screen 1.  
**Objective:** Provide immediate visual feedback that speech is being captured, followed by rapid transaction review.

```
+-------------------------------------------------------+
|                      [ X Cancel ]                     |
|                                                       |
|                  LISTENING (শুনছি...)                 |
|                                                       |
|        /\  /\/\    /\    /\/\/\    /\  /\/\           |
|       /  \/    \  /  \  /      \  /  \/    \          |
|      /          \/    \/        \/          \         |
|             [Real-time Audio Waveform]                |
|                                                       |
|  "শ্যাম কাকুকে ২ প্যাকেট সরিষার তেল আর ১ কেজি চিনি    |
|   ২৬০ টাকা ধার দিলাম"                                 |
|                                                       |
|  Engine: Bhashini Dhruva ASR · Bengali (bn)           |
+-------------------------------------------------------+
|  PARSED TRANSACTION PREVIEW                           |
|  +-------------------------------------------------+  |
|  | Customer: Shyam Kaku           Amount: ₹260     |  |
|  | Type: Udhaar Sale              Trust: Gold (86) |  |
|  | Items:                                          |  |
|  |  • Fortune Mustard Oil x2 (packet)              |  |
|  |  • Loose Sugar x1 (kg)                          |  |
|  +-------------------------------------------------+  |
|                                                       |
|     [ CONFIRM & DUAL-SYNC ]       [ Edit Manually ]   |
|         (Auto-commits in 3s)                          |
+-------------------------------------------------------+
```

### Key UI Elements
1. **Dynamic Waveform Visualizer:** Canvas-rendered frequency bars reacting to spoken volume levels.
2. **Streaming Transcript Display:** Vernacular font showing transcribed speech with real-time confidence indicator.
3. **Parsed Pill Badges:** Green badge for Amount (₹260), Blue for Customer, Orange for Items.
4. **Atomic Confirm CTA:** Oversized button that executes the dual-sync transaction and plays a success confirmation sound.

---

## Screen 3: Udhaar Ledger & Customer Directory

**Trigger:** Tapping "📖 Ledger" from navigation.  
**Objective:** Comprehensive list of customer debts, aging risk, and Trust Score segmentation.

```
+-------------------------------------------------------+
|  UDHAAR LEDGER                               [ Search]|
|  Total Outstanding: ₹38,450 across 18 customers       |
|                                                       |
|  [Filter: All] [Overdue > 14d] [Gold] [Silver] [Bronze]|
+-------------------------------------------------------+
|  CUSTOMER LIST                                        |
|                                                       |
|  +-------------------------------------------------+  |
|  | Sunita Devi                     Due: ₹1,850     |  |
|  | 9830012345 · Last paid 18d ago [GOLD BADGE: 88] |  |
|  | [ 💬 WhatsApp Reminder ]       [ View Ledger ] |  |
|  +-------------------------------------------------+  |
|                                                       |
|  +-------------------------------------------------+  |
|  | Shyam Kaku                      Due: ₹1,420     |  |
|  | 9831154321 · Last paid 2d ago  [GOLD BADGE: 86] |  |
|  | [ 💬 WhatsApp Reminder ]       [ View Ledger ] |  |
|  +-------------------------------------------------+  |
|                                                       |
|  +-------------------------------------------------+  |
|  | Amit Das (At-Risk)              Due: ₹2,150     |  |
|  | 9832298765 · Last paid 38d ago [BRONZE BADGE: 48]|  |
|  | [ 💬 WhatsApp Reminder ]       [ View Ledger ] |  |
|  +-------------------------------------------------+  |
+-------------------------------------------------------+
```

### Key UI Elements
1. **Aggregate Debt Header:** Displays total store working capital currently locked in customer credit.
2. **Trust Tier Filter Pills:** Enables 1-tap filtering for customers at high risk of default (Bronze <65).
3. **Customer Debt Cards:** Displays customer phone, aging duration, dynamic trust badge, and instant "WhatsApp Reminder" shortcut.

---

## Screen 4: Customer Profile & Credit Recovery Hub

**Trigger:** Tapping a customer card or "💬 WhatsApp Reminder" on Screen 3.  
**Objective:** Provide itemized audit history and generate culturally polite WhatsApp debt recovery messages with embedded UPI deep links.

```
+-------------------------------------------------------+
|  < Back to Ledger           Customer Recovery Hub     |
+-------------------------------------------------------+
|  SUNITA DEVI                                          |
|  Phone: 9830012345 · Registered: 8 months ago         |
|  Outstanding Udhaar: ₹1,850 · Lifetime Repaid: ₹14,200|
|                                                       |
|  CREDIT TRUST SCORE: 88 / 100 [GOLD BADGE]            |
|  • Payment Velocity: 36/40 (Settles in ~9 days)       |
|  • Overdue Ratio: 28/30 (Low default risk)           |
|  • Visit Consistency: 14/15 (Visits 4x / week)        |
+-------------------------------------------------------+
|  CULTURALLY POLITE WHATSAPP RECOVERY GENERATOR        |
|                                                       |
|  Tone: [● Polite Gentle]  [○ Friendly]  [○ Firm]      |
|  Lang: [● Bengali (বাংলা)] [○ Hindi]    [○ English]   |
|                                                       |
|  PREVIEW:                                             |
|  "নমস্কার Sunita Devi কাকীমা, Maa Tara General        |
|   Store এ আপনার ₹1,850 টাকার হিসাব বাকি আছে।         |
|   সময় মতো PhonePe বা GPay তে ক্লিয়ার করুন:          |
|   upi://pay?pa=maatarastore@okaxis&am=1850"           |
|                                                       |
|         [ 🟢 SEND ON WHATSAPP (wa.me) ]               |
+-------------------------------------------------------+
|  TRANSACTION HISTORY (LAST 5)                         |
|  • Oct 12: Mustard Oil x2, Sugar x1 · ₹260 (Udhaar)   |
|  • Oct 08: Amul Butter x1 · ₹58 (Udhaar)              |
|  • Sep 28: Repaid via PhonePe · ₹1,200 (Payment)      |
+-------------------------------------------------------+
```

---

## Screen 5: Inventory & Restock Monitor

**Trigger:** Tapping "📦 Stock" from navigation.  
**Objective:** Real-time visibility into fast-moving grocery items, low-stock alerts, and spoken restock triggers.

```
+-------------------------------------------------------+
|  STORE INVENTORY                             [+ Restock]|
|  Catalog: 24 SKUs · Low Stock: 3 · Value: ₹48,250     |
+-------------------------------------------------------+
|  [Filter: All] [Low Stock Only (3)] [Edible Oils] [Dairy]|
+-------------------------------------------------------+
|  • Fortune Mustard Oil 1L                             |
|    Stock: 4 bottles [LOW STOCK ALERT!]                |
|    Cost: ₹115 · Price: ₹130 · Reorder at: 5           |
|                                                       |
|  • Aashirvaad Shudh Chakki Atta 10kg                  |
|    Stock: 12 bags [IN STOCK]                          |
|    Cost: ₹380 · Price: ₹420 · Reorder at: 4           |
|                                                       |
|  • Loose Sugar                                        |
|    Stock: 3 kg [CRITICAL LOW!]                        |
|    Cost: ₹36 · Price: ₹42 · Reorder at: 10            |
+-------------------------------------------------------+
|  RESTOCK VIA VOICE:                                   |
|  [ 🎙️ Speak Restock: "Atta 10 bag restock entry" ]    |
+-------------------------------------------------------+
```

---

## Screen 6: Desktop Merchant Command Center

**Target Viewport:** 1440px × 900px (Desktop / Laptop View)  
**Primary User:** Rohit Gupta (Co-Owner / Manager) & Hackathon Judges  
**Objective:** Expansive multi-column command center demonstrating financial control, live stock sync, and analytics.

```
+----------------------------------------------------------------------------------------------------+
|  KHATAVOICE MERCHANT COMMAND CENTER                                    [Phone View] [ বাংলা ▾]     |
|  Maa Tara General Store · Daily Revenue: ₹4,720 · Total Outstanding: ₹38,450 · Stock: ₹48,250     |
+----------------------------------------------------------------------------------------------------+
|  LEFT: LIVE VOICE HUB           |  CENTER: DUAL-SYNC LEDGER         |  RIGHT: INVENTORY & TRUST    |
|                                 |                                   |                              |
|  (((( 🎙️ ))))                    |  Today's Transactions:            |  Low Stock Watchlist (3):    |
|  [SPEAK TRANSACTION]            |  • 08:15 Shyam Kaku (+₹260)       |  • Mustard Oil: 4 left [!]   |
|  Status: Ready (Bhashini ASR)   |  • 08:02 Cash Sale (₹130)         |  • Sugar: 3 kg left [!]      |
|                                 |  • 07:45 Sunita Devi (-₹500)      |  • Lux Soap: 2 bars left [!] |
|  Audio Sample Presets:          |                                   |                              |
|  [▶ Bengali Mustard Oil Udhaar] |  Customer Debt Radar:             |  Top Credit Recovery Targets:|
|  [▶ Hindi Atta Restock Entry]   |  • Sunita Devi: ₹1,850 (Gold 88)  |  1. Amit Das (38d, Bronze)   |
|  [▶ Hinglish Cash Sale]         |  • Shyam Kaku: ₹1,420 (Gold 86)   |  2. Biren Da (21d, Silver)   |
|                                 |  • Amit Das: ₹2,150 (Bronze 48)   |  3. Sunita Devi (18d, Gold)  |
|  [Live Audio Waveform Canvas]   |                                   |                              |
|                                 |  [ Filter & Export CSV ]          |  [ 1-Tap WhatsApp Recovery ] |
+----------------------------------------------------------------------------------------------------+
```

---

## Screen 7: Hackathon Judge Business & Scalability Portal

**Trigger:** Tapping "Judge Suite / Unit Economics" in header navigation.  
**Primary Evaluator:** Ekansh Jain (LUMA Youth Co-Founder, Hackathon Judge)  
**Objective:** Interactive proof of unit economics, SaaS pricing sustainability, shopkeeper payback period, and distributed cloud scalability.

```
+----------------------------------------------------------------------------------------------------+
|  NEXT FOUNDERS HACKATHON EVALUATION SUITE                                      Judge: Ekansh Jain  |
|  Rubric: Technical Execution (25%) · Innovation (25%) · Business (25%) · Communication (25%)       |
+----------------------------------------------------------------------------------------------------+
|  INTERACTIVE UNIT ECONOMICS CALCULATOR                                                             |
|                                                                                                    |
|  Voice Entries / Store / Day: [ 80 ] (Slider: 20 to 300)                                           |
|  Pro Kirana Monthly SaaS Fee: [ ₹199 ] (Slider: ₹99 to ₹499)                                       |
|                                                                                                    |
|  +--------------------------+  +--------------------------+  +----------------------------------+  |
|  | Cost Per Voice Entry     |  | Store Monthly API Cost   |  | Store Gross Margin               |  |
|  | ₹0.10 (ASR + LLM + DB)   |  | ₹240 / month             |  | 78.4%                            |  |
|  +--------------------------+  +--------------------------+  +----------------------------------+  |
|                                                                                                    |
|  SHOPKEEPER VALUE CREATION:                                                                        |
|  • Average Udhaar Recovered per Store: ₹2,160 / month                                              |
|  • Monthly SaaS Cost: ₹199 / month                                                                 |
|  • Net Shopkeeper Payback Multiplier: 10.8x ROI                                                    |
+----------------------------------------------------------------------------------------------------+
|  SYSTEM ARCHITECTURE & RESILIENCE INSPECTOR                                                        |
|  • Speech Engine: Web Speech API (Client) -> Bhashini Dhruva ASR (Server) -> Presets (Fail-safe)  |
|  • NLP Parsing: Local Ollama LLM -> Gemini Cloud LLM -> Heuristic Phonetic Regex (<20ms)          |
|  • Data Storage: Atomic Dual-Sync Engine with transactional mutex locks                            |
+----------------------------------------------------------------------------------------------------+
```
