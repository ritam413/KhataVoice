# KhataVoice: User Journeys & Experience Maps

This document details five core end-to-end user journeys for the **KhataVoice** platform, tracking user stages, actions, emotional states, touchpoints, system operations, and target metrics.

---

## Journey 1: The Morning Rush — Spoken Credit Sale (*Udhaar*)

**Actor:** Ramesh Babu (48, Kolkata Kirana Owner)  
**Context:** 8:15 AM rush hour; 5 customers waiting in front of the counter. Customer "Shyam Kaku" takes 2 bottles of mustard oil and 1 kg sugar on credit without cash.

```
[Customer Takes Goods] ──> [1-Tap Voice Mic] ──> [Speak Bengali Entry] ──> [Instant Dual-Sync] ──> [Done in 2 Secs]
         😊                         ⚡                         🎙️                       ⚙️                    🎉
```

| Phase | User Action | System Response & UI State | Emotional Curve | Friction / Fallback Guard |
| :--- | :--- | :--- | :--- | :--- |
| **1. Trigger** | Hands mustard oil & sugar to customer. Cannot wash hands or touch keyboard. | KhataVoice Mobile View displays oversized glowing Saffron Mic button (72px diameter). | 😐 Stressed (busy rush) | Big touch target accessible even with wet/floured hands. |
| **2. Spoken Capture** | Taps Mic button and speaks in natural Bengali: *"Shyam kaku ke 2 bottle mustard oil ar 1kg chini 260 taka udhaar dilam."* | Pulse wave visualizer animates in real time. Transcription stream appears live in vernacular font. | 😌 Relieved (speaking is effortless) | Audio clamped to max 8 seconds; ambient noise filtering active. |
| **3. Entity Parsing** | Stops speaking (or taps Stop Mic). | Hybrid Parser extracts: <br>• Customer: `Shyam Kaku`<br>• Amount: `₹260`<br>• Items: `[Mustard Oil x2, Sugar 1kg]`<br>• Type: `UDHAAR_SALE` | ⚡ Anticipation (<1.2s latency) | Fallback deterministic regex engine fires if cloud/local LLM lags. |
| **4. Dual-Sync Commit** | Glance-verifies the 1-tap confirmation card showing parsed pills. Taps "Confirm" (or auto-commits after 3s). | Atomic update: <br>1. Shyam Kaku's ledger balance: +₹260<br>2. Mustard Oil stock: -2 units<br>3. Sugar stock: -1 kg | 😃 Satisfaction | Reversible via 5-second "Undo" snackbar banner. |
| **5. Post-Action State** | Packs next order for the next customer in queue. | Audio subtle chime. Screen returns to clean idle state showing updated Daily Udhaar total. | 🟢 Confident & calm | Total elapsed time: **2.8 seconds** (vs. 45s on Khatabook manual typing). |

---

## Journey 2: Evening Settlement & Culturally Polite Debt Recovery

**Actor:** Ramesh Babu (Shopkeeper) & Sunita Devi (Customer)  
**Context:** 9:30 PM store closing. Ramesh reviews outstanding customer tabs and initiates polite recovery reminders.

```
[Review Udhaar Ledger] ──> [Filter Overdue >15d] ──> [Select Trust Tone] ──> [1-Tap wa.me Dispatch] ──> [Customer Pays UPI]
          📊                         🔍                       💬                        📲                        💰
```

| Phase | User Action | System Response & UI State | Emotional Curve | Friction / Fallback Guard |
| :--- | :--- | :--- | :--- | :--- |
| **1. Ledger Inspection** | Opens "Udhaar Ledger" tab. Filters by "Overdue > 14 Days". | Displays prioritized customer list ordered by aging balance. Each card shows Trust Score Badge (Gold, Silver, Bronze). | 🧐 Analytical | High-contrast badges highlight customers needing immediate follow-up. |
| **2. Customer Selection** | Taps on Sunita Devi (Balance: ₹1,850, Last Payment: 18 days ago, Trust Score: 88 - Gold). | Opens "Customer Recovery Drawer". Displays detailed ledger breakdown and WhatsApp generator. | 😌 Reassured (trust is high) | System notes Sunita is a reliable payer; recommends "Polite Gentle" tone. |
| **3. Tone Calibration** | Selects **"Polite Gentle"** tone and **Bengali** language. | Formats culturally respectful message praising her loyalty, detailing balance, and appending UPI deep link. | 😊 Comfortable | No aggressive language; avoids neighborhood awkwardness. |
| **4. 1-Tap Dispatch** | Taps "Send on WhatsApp" button. | Directs immediately to `https://wa.me/9198300XXXXX?text=...` opening native WhatsApp with pre-filled message. | 🚀 Empowered | Zero Meta API credentials or charges required; works 100% on standard phone. |
| **5. Customer Payment** | Sunita Devi reads message on her phone, taps the embedded UPI link, and pays ₹1,850 via PhonePe. | PhonePe Soundbox rings in shop. Ramesh taps "Record Payment" (or speaks *"Sunita Devi 1850 taka shodh dilen"*). | 🥳 Triumphant (working capital unlocked) | Trust Score increases from 88 to 92 for prompt repayment. |

---

## Journey 3: Stock Delivery & Restock Voice Entry

**Actor:** Rohit Gupta (24, Lucknow Next-Gen Kirana Co-Owner)  
**Context:** Afternoon wholesale delivery truck arrives with 15 crates of Amul Taaza milk and 10 sacks of Aashirvaad Atta.

```
[Wholesale Truck Arrives] ──> [Voice Restock Entry] ──> [Inventory Increments] ──> [Supplier Ledger Updated]
           🚚                          🎙️                         📦                          🧾
```

| Phase | User Action | System Response & UI State | Emotional Curve | Friction / Fallback Guard |
| :--- | :--- | :--- | :--- | :--- |
| **1. Unloading Stock** | Checks crates against physical wholesale challan. | Opens KhataVoice on smartphone or Desktop Command Center. | 💼 Focused | Doesn't need to sit at a computer or type SKUs. |
| **2. Spoken Restock** | Taps Mic and speaks in Hindi: *"Amul Taaza 30 packet aur Aashirvaad Atta 10 bag restock entry karo, kul 4,200 rupaye."* | Real-time audio waveform active. Parser identifies `RESTOCK_PURCHASE`. | 😌 In control | Recognizes units (`packet`, `bag`, `kg`, `crate`). |
| **3. Catalog Match** | System matches vernacular names to inventory catalog. | Auto-maps to existing SKUs (`Amul Taaza Milk 500ml`, `Aashirvaad Shudh Chakki Atta 10kg`). | 💡 Impressed | Fuzzy string matching bridges colloquial vs. formal product names. |
| **4. Stock Increment** | Verifies preview and confirms. | Inventory counts increase: Amul Taaza +30, Aashirvaad Atta +10. Total store stock valuation updates. | 📈 Confident | Low-stock badges automatically clear for restocked items. |

---

## Journey 4: Customer In-Shop Transparency & Query Resolution

**Actor:** Ramesh Babu (Shopkeeper) & Biren Da (Customer)  
**Context:** Customer asks: *"Ramesh, how much do I owe you this month? I think you added yesterday's oil twice."*

```
[Customer Questions Tab] ──> [Voice or 1-Tap Search] ──> [Interactive Ledger Card] ──> [Instant Trust Restored]
           ❓                          🔍                          📱                         🤝
```

| Phase | User Action | System Response & UI State | Emotional Curve | Friction / Fallback Guard |
| :--- | :--- | :--- | :--- | :--- |
| **1. Dispute Trigger** | Biren Da questions the balance in front of other waiting customers. | Ramesh pulls up KhataVoice on his phone. | 😬 Tense (potential public dispute) | Must resolve dispute in <5 seconds to protect reputation. |
| **2. Instant Search** | Speaks: *"Biren da"* into search or taps his pinned card. | Customer Profile opens immediately displaying itemized transaction timeline with exact timestamps. | ⚡ Rapid retrieval | Shows exact time: *"Yesterday 6:42 PM - 1 Mustard Oil ₹130"*. |
| **3. Mutual Verification** | Shows phone screen to Biren Da. High-contrast typography displays exact line items. | Biren Da sees: *"Oh yes, my son took the second bottle at 8 PM, I forgot!"* | 😌 Relieved & respectful | Full transparency eliminates "shopkeeper overcharging" suspicion. |
| **4. Outcome** | Biren Da pays part-payment of ₹300 via cash on the spot. | Ramesh taps "Record Payment: ₹300". Balance updates instantly. | 🌟 Deepened community trust | Customer loyalty cemented; zero shouting or bad blood. |

---

## Journey 5: Hackathon Judge Evaluation (The 5-Minute Pitch Walkthrough)

**Actor:** Ekansh Jain (LUMA Youth Co-Founder, Hackathon Judge)  
**Context:** Evaluating KhataVoice's Devpost submission and 5-minute video presentation.

```
[Problem & ₹20L Cr Gap] ──> [Live Voice Demo (Bengali/Hindi)] ──> [Unit Economics Tool] ──> [Architecture Inspector]
          🎯                                ⚡                             💰                       🛠️
```

| Video Segment | Judge Focus | KhataVoice Feature Demonstrated | Judge Reaction / Evaluation (Rubric) |
| :--- | :--- | :--- | :--- |
| **0:00 – 1:00 (Problem)** | Is this a real problem or an artificial AI toy? | Real video footage/quotes of Kirana owners losing ₹38K in paper ledgers; explanation of social friction and typing barrier. | **Communication (25%):** Hooks judge with authentic founder empathy and hard macro data. |
| **1:00 – 2:30 (Live Demo)** | Does it actually work live? Can it handle vernacular? | Taps Saffron Mic button (or 1-Click Audio Preset), speaks Bengali and Hindi; watch live audio visualizer, instant transcription, and simultaneous dual-sync of Udhaar ledger + stock decrement. | **Innovation & UX (25%) & Technical Execution (25%):** Impressed by sub-1.2s speed, zero keyboard input, and dual sync. |
| **2:30 – 3:45 (Recovery & Trust)** | What is the defensible business moat? | Demonstrates 0–100 Credit Trust Score algorithm; shows 1-tap WhatsApp reminder with dynamic UPI deep link (`wa.me`). | **Business & Finance (25%):** Recognizes that the product sells unlocked working capital, not just ASR. |
| **3:45 – 4:30 (Unit Economics)** | Can this scale sustainably? | Navigates to embedded **Judge Unit Economics Calculator**; toggles sliders showing ₹0.10 cost/entry, ₹199/mo subscription, and 78% gross margin. | **Business & Finance (25%):** Validates viable SaaS unit economics with immediate shopkeeper ROI. |
| **4:30 – 5:00 (Architecture)** | Is the engineering scalable and resilient? | Shows Architecture Inspector: Next.js App Router, pluggable speech adapters (Web Speech API / Bhashini / Whisper), and fallback heuristic parser. | **Technical Execution (25%):** Full score across all 4 judging pillars. |
