# KV-12: Multilingual WhatsApp Reminder Engine (`wa.me`, Desktop Web Fallback & 1-Tap Copy)

- **Epic:** Epic 3: Atomic Dual-Sync & Business Logic
- **Priority:** P0 (Blocker)
- **Story Points:** 4 SP
- **Upstream Dependencies:** KV-02, KV-10
- **Downstream Blockers:** KV-17
- **Target Files:**
  - `src/lib/whatsapp/reminder-engine.ts`
  - `src/lib/whatsapp/templates.ts`
  - `src/app/api/reminders/generate/route.ts`
  - `src/types/whatsapp.ts`

---

## 1. Architectural Role & Objective
Build the culturally sensitive, multilingual WhatsApp debt recovery message generator. Solves the Kirana shopkeeper's greatest pain point: the awkwardness of chasing overdue credit (*udhaar*). Generates culturally polite message drafts in Bengali, Hindi, and English across 3 customizable tones (Polite Gentle, Friendly Follow-up, Firm Overdue), formatted into zero-cost WhatsApp deep links (`wa.me`) with embedded UPI payment links.

---

## 2. Input Contract & Pre-Conditions
- Input Parameters:
  - Customer Name & Phone Number
  - Overdue Balance (INR)
  - Tone: `'polite'` | `'friendly'` | `'firm'`
  - Language: `'bn'` | `'hi'` | `'en'`
  - Store Name & Merchant UPI ID

---

## 3. State Invariants & Hardening Guards
- **Adversarial Review Hardening (Desktop Browser Fallback & 1-Tap Copy):**
  - Standard `wa.me` mobile schemes can freeze or prompt app installation on desktop laptops.
  - The engine must detect client environment:
    - Mobile devices $\implies$ direct `https://wa.me/91XXXXXXXXXX?text=...`
    - Desktop devices $\implies$ route to `https://web.whatsapp.com/send?phone=91XXXXXXXXXX&text=...`
  - Alongside the link, provide an instant 1-tap clipboard action: *"📋 Copy formatted message & UPI payment link"* so the user can paste anywhere.
- **Strict Character & URI Encoding:** All text and UPI deep link strings must be processed via `encodeURIComponent()` to avoid truncating messages at spaces or ampersands.

---

## 4. Implementation Details

### 4.1 Cultural Template Matrix (`src/lib/whatsapp/templates.ts`)
1. **Bengali Polite (`bn`):**
   > "নমস্কার শ্যামবাবু, মা তারা ভ্যারাইটি স্টোর থেকে রমেশ বলছি। আশা করি আপনি ভালো আছেন। আপনার আগের ₹২৬০ বাকি রয়েছে। সময়মতো দিয়ে দিলে খুব সুবিধা হয়। UPI এর মাধ্যমে দিতে পারেন: [UPI_LINK]"
2. **Hindi Polite (`hi`):**
   > "नमस्ते रोहित जी, माँ तारा किराना स्टोर से रमेश। आशा है आप सकुशल हैं। आपकी ₹५०० की पुरानी उधारी शेष है। कृपया सुविधानुसार चुका दें। UPI लिंक: [UPI_LINK]"
3. **English Friendly (`en`):**
   > "Hello Sunita ji, warm greetings from Maa Tara Variety Store. Just a gentle reminder regarding the pending balance of ₹310. You can clear this easily via UPI: [UPI_LINK]. Thank you!"
4. **Firm Overdue (`hi` / `bn`):**
   > Contains explicit invoice dates, total days overdue, and request for settlement within 48 hours to preserve credit trust score.

### 4.2 Reminder Generator Function (`src/lib/whatsapp/reminder-engine.ts`)
```typescript
export interface ReminderDraft {
  formattedText: string;
  waUrl: string;
  webWaUrl: string;
  upiUrl: string;
  phone: string;
  tone: WhatsAppTone;
  language: Language;
}

export function generateReminderDraft(params: ReminderDraftParams): ReminderDraft {
  const upiUrl = generateValidUpiUrl({
    vpa: params.merchantUpiVpa,
    payeeName: params.merchantStoreName,
    amount: params.balance,
    note: `Udhaar settlement for ${params.customerName}`
  });

  const rawMessage = renderTemplate(params, upiUrl);
  const encodedText = encodeURIComponent(rawMessage);
  const cleanPhone = params.customerPhone.replace(/\D/g, '');
  const internationalPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

  return {
    formattedText: rawMessage,
    waUrl: `https://wa.me/${internationalPhone}?text=${encodedText}`,
    webWaUrl: `https://web.whatsapp.com/send?phone=${internationalPhone}&text=${encodedText}`,
    upiUrl,
    phone: internationalPhone,
    tone: params.tone,
    language: params.language
  };
}
```

---

## 5. Behavior-Driven Specification (Given / When / Then)

### Scenario 1: Polite Bengali Reminder Generation
- **Given:** Shyam Babu owes ₹260, preferred language is Bengali.
- **When:** `generateReminderDraft({ tone: 'polite', language: 'bn', balance: 260, ... })` runs.
- **Then:** Output contains courteous Bengali greeting, embedded UPI link, and valid `wa.me` URL.

### Scenario 2: Desktop Clipboard Fallback
- **Given:** Shopkeeper accesses KhataVoice from desktop laptop browser.
- **When:** Reminder card is displayed.
- **Then:** UI offers `webWaUrl` and 1-tap clipboard copy action.

---

## 6. Automated Verification Gates
```bash
# Verify reminder engine compiles and generates valid URI
node -e "const { generateReminderDraft } = require('./src/lib/whatsapp/reminder-engine.ts'); const d = generateReminderDraft({ customerName: 'Shyam', customerPhone: '9876543210', balance: 260, tone: 'polite', language: 'bn', merchantStoreName: 'Maa Tara', merchantUpiVpa: 'ramesh@upi' }); console.assert(d.waUrl.includes('https://wa.me/919876543210'), 'Invalid WA URL');"
```
