# KhataVoice Brand Identity & Style Guide (BRAND.md)

> **"Bharat Modern" Voice-First Retail FinTech for India's 15 Million Neighborhood Kirana Stores**

---

## 1. Brand Strategy & Core Narrative

### 1.1 Brand Name & Etymology
* **Brand Name:** **KhataVoice**
* **Pronunciation:** `/kʰaː.t̪aː vɔɪs/`
* **Etymology:**
  * **Khata (खाता / খাতা):** The centuries-old Indian merchant tradition of trust-based customer ledgers (*Bahi-Khata*).
  * **Voice:** Natural spoken communication that removes the cognitive friction of typing on small keyboards with busy, dusty shop hands.
* **Tagline:**
  * **Primary (English):** *Speak your ledger. Recover your capital.*
  * **Hindi (हिंदी):** *बोलो और बही-खाता संभालो — उधारी वसूली चुटकी में।*
  * **Bengali (বাংলা):** *মুখে বলুন, খাতা রাখুন — বকেয়া আদায় এবার সহজ।*

---

### 1.2 The Core Purpose & Brand Truth
* **The Problem:** 13–15 million Indian Kiranas lose **₹10,000 to ₹50,000 in frozen working capital** because chasing debts from neighbors is socially awkward, and logging entries in paper books is tedious.
* **Our Core Truth:** We do not sell "speech recognition" or "AI software." **We sell unlocked working capital, timely debt recovery, and neighborhood dignity.**
* **The Wedge:** Spoken 3-second vernacular transaction entry simultaneously updates the customer's credit balance and store stock, calculates a Kirana Credit Trust Score (0–100), and drafts culturally respectful WhatsApp recovery reminders with 1-tap UPI payment links.

---

### 1.3 Brand Archetype & Personality
* **Primary Archetype:** *The Trusted Neighborhood Partner & Modern Ally*
* **Personality Attributes:**
  1. **Respectful & Culturally Rooted:** Understands that udhaar is rooted in community trust, not malice. Reminders preserve neighborhood relationships.
  2. **Fast & Tactile:** Built for 40°C heat, fluorescent streetlights, and busy shop counters. 1-tap actions, instant sound confirmation, zero clutter.
  3. **Financially Prudent:** Transparent unit economics (₹0.10 cost/entry, 10.8x merchant payback ROI).
  4. **Vernacular-First:** Bengali, Hindi, Hinglish, and English treated as first-class citizens, never machine-translated afterthoughts.

---

## 2. Brand Voice & Messaging Framework

### 2.1 The Tone Spectrum

| Dimension | Dial | Brand Manifestation | Anti-Pattern to Avoid |
| :--- | :--- | :--- | :--- |
| **Warmth vs. Clinical** | **85% Warm** | Neighborly, polite, encouraging ("দোকানের হিসাব নিরাপদ") | Stiff corporate banking jargon ("Accounts receivable aging") |
| **Directness vs. Wordiness** | **90% Direct** | 1-tap actions, short status pills, zero fluff | Lengthy walkthrough modals, walls of instructions |
| **Accessibility vs. Tech Jargon** | **95% Accessible** | Everyday terms (*Udhaar*, *Bahi-Khata*, *Stock*, *Baki*) | "Dual-ledger consensus protocol", "Vector embeddings" |
| **Urgency vs. Pressure** | **Balanced** | Clear payment deadlines with polite dignity | Aggressive collection threats or intimidating legal notices |

---

### 2.2 Core Positioning Statements

#### The 5-Second Hook
> *"KhataVoice turns your spoken words into an instant credit ledger, live store inventory, and 1-tap WhatsApp debt recovery."*

#### The 30-Second Elevator Pitch
> *"Over 13 million neighborhood Kirana shopkeepers in India lend ₹20 Lakh Crore in informal credit, recording it in paper notebooks. When debts go overdue, asking neighbors for money feels uncomfortable, and stock records slip out of sync. KhataVoice solves this with one tap: speak in Bengali, Hindi, or English — the voice entry simultaneously updates customer udhaar and store inventory, computes a Credit Trust Score, and sends polite WhatsApp reminders with 1-tap UPI payment links. It delivers a 10.8x monthly payback ROI on day one."*

---

### 2.3 Situational UX Copy & Voice Guidelines

| State | Primary Copy (EN) | Hindi (हिंदी) | Bengali (বাংলা) | Sonic / Visual Feedback |
| :--- | :--- | :--- | :--- | :--- |
| **Idle Mic CTA** | Tap to Speak Transaction | बोलने के लिए माइक दबाएं | লেনদেন বলতে মাইক চাপুন | Pulsing Saffron Ripple |
| **Active Listening** | Listening to shop... | आपकी आवाज़ सुन रहे हैं... | শুনছি, বলুন... | 60fps Audio Waveform |
| **Parsed Confirmation** | Added ₹250 Udhaar to Rohit | रोहित के खाते में ₹250 उधारी जोड़ी गई | রোহিতের খাতায় ₹250 বাকি যোগ হলো | Dual-tone Soundbox Bell |
| **Negative Stock Warning** | Digital stock depleted (sale completed) | डिजिटल स्टॉक समाप्त (बिक्री दर्ज हुई) | স্টক শেষ, তবুও বিক্রি নথিভুক্ত হলো | Amber Warning Pill |
| **WhatsApp Sent** | Reminder copied to WhatsApp | व्हाट्सएप पर संदेश भेजा गया | হোয়াটসঅ্যাপে তাগাদা পাঠানো হলো | Sonner Emerald Toast |

---

## 3. Visual Identity System ("Bharat Modern" FinTech)

### 3.1 Color Palette & Semantic Tokens

The KhataVoice visual identity pairs the vibrancy of traditional Indian commerce (Saffron and Gold) with high-trust FinTech modernism (Midnight Slate and Emerald).

```
┌────────────────────────────────────────────────────────────────────────┐
│  PRIMARY BRAND           ACCENT RECOVERY         CANVAS MIDNIGHT       │
│  Saffron #FF7700         Emerald #10B981         Deep Slate #0B0F19    │
│  hsl(24, 100%, 50%)      hsl(160, 84%, 39%)      hsl(224, 43%, 7%)     │
└────────────────────────────────────────────────────────────────────────┘
```

#### Detailed Token Mapping

| Token Name | Hex Code | HSL Value | Semantic Role & Usage | WCAG 2.1 Contrast |
| :--- | :--- | :--- | :--- | :--- |
| `--saffron-primary` | `#FF7700` | `24 100% 50%` | Hero CTA, Mic Button, Primary Brand Mark | **7.20:1 AAA** (with Dark Inverse Text) |
| `--saffron-hover` | `#E06600` | `24 100% 44%` | Interactive hover/active state on primary controls | $\ge 7:1$ AAA |
| `--emerald-primary` | `#10B981` | `160 84% 39%` | Credit recovered, payments received, healthy stock | 4.85:1 AA on dark slate |
| `--emerald-surface` | `#064E3B` | `166 85% 16%` | WhatsApp preview background, recovery badges | Muted green surface |
| `--crimson-alert` | `#EF4444` | `0 84% 60%` | Overdue debts, negative stock alerts, cancellations | 4.60:1 AA on dark slate |
| `--surface-canvas` | `#0B0F19` | `224 43% 7%` | Root application background (Midnight slate) | Base level |
| `--surface-card` | `#111827` | `222 47% 11%` | Elevated cards, tables, modal chassis | 1.2:1 elevation step |
| `--border-subtle` | `#1F2937` | `217 33% 17%` | 1px hairline component borders, card dividers | Non-distracting structure |
| `--text-primary` | `#F9FAFB` | `210 40% 98%` | High-contrast headline text, debt balances | **14.8:1 AAA** on canvas |
| `--text-muted` | `#9CA3AF` | `218 11% 65%` | Secondary descriptions, timestamps, phone numbers | 5.8:1 AA on canvas |

---

### 3.2 Dynamic Kirana Credit Trust Badges

The Trust Engine assigns each customer a dynamic badge based on turnaround days, overdue ratio, and transaction velocity:

| Tier Badge | Score Range | Color Token | Hex Code | Meaning & Max Recommended Credit |
| :--- | :--- | :--- | :--- | :--- |
| **🥇 GOLD** | **85 – 100** | `--trust-gold` | `#F59E0B` | High Turnaround Velocity. Punctual repayer. Max credit ₹5,000. |
| **🥈 SILVER** | **65 – 84** | `--trust-silver` | `#94A3B8` | Regular customer. Occasional minor delay. Max credit ₹1,500. |
| **🥉 BRONZE** | **< 65** | `--trust-bronze` | `#EF4444` | High Overdue Debt / Chronic Defaulter. Strictly cash or ₹0 credit. |

---

### 3.3 Typography Stack

```css
/* Display & Headlines */
font-family: var(--font-sans), 'Plus Jakarta Sans', system-ui, sans-serif;

/* Tabular Numerals for Currency & Balances */
font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11', 'tnum' 1;

/* Regional Vernacular Scripts */
font-family: var(--font-bengali), 'Noto Sans Bengali', sans-serif; /* Bengali */
font-family: var(--font-devanagari), 'Noto Sans Devanagari', sans-serif; /* Hindi */
line-height: 1.6; /* Prevents matra/vowel diacritic clipping */
```

* **Plus Jakarta Sans:** Crisp geometric letterforms providing authoritative FinTech precision.
* **Tabular Figures (`tnum`):** Essential for financial tables — rupee figures align strictly on the decimal without optical horizontal shifting.
* **Vernacular Diacritic Protection:** 1.6 line-height preserves upper and lower matras in Bengali (`ি`, `ী`, `ু`) and Devanagari (`ि`, `ी`, `ु`).

---

## 4. Logo Mark & Iconography Direction

### 4.1 The Brand Mark: "The Prosperity Sigil"
The KhataVoice brand mark harmonizes two iconic symbols:
1. **The Bahi-Khata (Red/Saffron Ledger Fold):** Representing centuries of trust and honest bookkeeping.
2. **The Acoustic Soundwave Arc:** Concentric dynamic waves forming the letter "K" and "V", signifying voice input that immediately manifests into financial prosperity.

```
       ▲  Soundwave Arc (Voice Input)
    ( ( ( 
    ──────┐  Bahi-Khata Ledger Fold
    │  ₹  │  Capital Unlocked
    └─────┘
```

### 4.2 Minimum Touch Target Standard
* **Interactive Buttons:** Minimum $48\text{px} \times 48\text{px}$ touch target to accommodate busy shopkeepers with dusty hands on mobile screens.
* **Hero Microphone CTA:** $80\text{px} \times 80\text{px}$ pulsing circular button centered in the bottom third of the Kirana handset view.

---

## 5. Multisensory & Sonic Branding

### 5.1 The Kirana Retail Soundbox Chime
In Indian retail, the "Soundbox" (Paytm / PhonePe audio speaker) is the ultimate physical badge of payment certainty. KhataVoice reproduces this trust electronically:
* **Audio Characteristic:** Clean dual-harmonic bell chime ($587.33\text{Hz} \to 880\text{Hz} \to 1174.66\text{Hz}$) synthesized via the Web Audio API with exponential gain decay.
* **TTS Audio Voiceout:** Spoken confirmation in the merchant's chosen language:
  * *"₹250 उधारी रोहित के खाते में जोड़ी गई।"*
  * *"₹250 বাকি রোহিতের খাতায় যোগ হয়েছে।"*
  * *"₹250 udhaar added for Rohit Gupta."*

---

## 6. Multi-Channel Touchpoint Specifications

### 6.1 WhatsApp Recovery Message Persona
Messages sent to customers via `wa.me` links embody polite respect:
* **Tone 1: 🌸 Polite Gentle (For Gold/Silver accounts):**
  > *"Namaste Rohit ji, your total balance at Maa Tara Variety Stores is ₹250. Whenever convenient, you can clear it via UPI here: upi://pay?pa=ramesh@upi&am=250. Thank you!"*
* **Tone 2: 🤝 Friendly Follow-up (Regular reminder):**
  > *"Hello Rohit, gentle reminder regarding the ₹250 balance at Maa Tara Stores. Tap to pay directly: upi://pay?pa=ramesh@upi&am=250. Dhanyawad!"*
* **Tone 3: ⚠️ Firm Overdue (For overdue Bronze debts):**
  > *"Attention Rohit ji: Your balance of ₹250 at Maa Tara Stores has been pending for over 30 days. Please clear it today via UPI: upi://pay?pa=ramesh@upi&am=250 to keep credit open."*

---

## 7. Anti-Slop Brand Guardrails

### ❌ Strictly Banned Words & Tropes
* **Banned Buzzwords:** *"Seamless"*, *"Revolutionary"*, *"Game-changer"*, *"Supercharge"*, *"Next-gen AI powerhouse"*, *"Disruptive synergy"*.
* **Banned Visuals:** Generic purple neon AI gradients, floating generic 3D robot hands, fake stock photos of Caucasian models in corporate suits pretending to be Kirana owners.
* **Banned UX Anti-Patterns:**
  * Blocking sales when digital inventory is zero (Kirana merchants never turn down cash because the computer says stock is zero).
  * White text on bright Saffron buttons (fails WCAG AA contrast).
  * Chasing debts with threatening or humiliating wording.

### ✅ Mandatory Brand Invariants
* Always use authentic Indian retail Kirana naming and currencies (₹ Rupee symbol, Lakhs/Crores, Udhaar, Kirana).
* Always maintain high-contrast dark text on bright Saffron surfaces (`7.20:1 AAA`).
* Always provide pre-recorded 1-click audio samples so demonstrations never fail on silent microphones.
* Always preserve neighborly dignity in debt collection communications.

---
*Authored with the `/brand` skill for KhataVoice (Next Founders Hackathon submission).*
