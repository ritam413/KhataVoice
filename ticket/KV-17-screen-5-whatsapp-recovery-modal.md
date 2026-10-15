# KV-17: Screen 5: Cultural WhatsApp Debt Recovery Modal with 3 Tones & 1-Tap Launch

- **Epic:** Epic 4: Dual-Mode Screens & UI Workflows
- **Priority:** P0 (Blocker)
- **Story Points:** 3 SP
- **Upstream Dependencies:** KV-12
- **Downstream Blockers:** KV-18
- **Target Files:**
  - `src/components/views/WhatsAppModal.tsx`
  - `src/styles/whatsapp-modal.module.css`

---

## 1. Architectural Role & Objective
Implement Screen 5 (Multilingual Cultural WhatsApp Debt Recovery Modal). When triggered for an indebted customer, this modal provides an interactive preview of the recovery message with 3 selectable cultural tones (Polite Gentle, Friendly Follow-up, Firm Overdue) in the customer's language. Shopkeepers can launch WhatsApp with 1 tap or copy the message and UPI link with 1 tap for desktop/SMS sharing.

---

## 2. Input Contract & Pre-Conditions
- Props:
  - `customer: Customer`
  - `isOpen: boolean`
  - `onClose: () => void`
  - `merchantStoreName: string`
  - `merchantUpiVpa: string`

---

## 3. State Invariants & Hardening Guards
- **Adversarial Review Hardening (Desktop Link Routing & 1-Tap Clipboard Copy):**
  - When the modal launches the reminder, inspect `window.navigator.userAgent`.
  - If desktop, open `web.whatsapp.com` in a new window or tab.
  - Provide a primary button: **"🚀 Send on WhatsApp"** and a secondary button: **"📋 Copy Message & UPI Link"** that copies to clipboard and flashes a green toast (*"Copied! Ready to paste in WhatsApp"*).
- **Tone & Language Synchrony:** Toggling between tones (Polite / Friendly / Firm) or languages (Bengali / Hindi / English) updates the rendered message preview card in real time.

---

## 4. Implementation Details

### 4.1 UI Layout
- **Modal Header:** Customer name + Phone + Current Balance (e.g. Shyam Babu · ₹420).
- **Tone Selector Segmented Control:**
  - `[🌸 Polite Gentle]` (Default)
  - `[🤝 Friendly Follow-up]`
  - `[⚠️ Firm Overdue]`
- **Live Message Bubble:** Styled like an authentic WhatsApp chat bubble (light green surface, timestamp, UPI link formatted).
- **Actions Bar:**
  - Large Green Button: `[🚀 Open WhatsApp (wa.me)]`
  - Slate Glass Button: `[📋 Copy Message]`
  - Log Reminder Status: Upon tap, trigger `POST /api/reminders/log` or update customer's `last_reminder_sent_at`.

---

## 5. Behavior-Driven Specification (Given / When / Then)

### Scenario 1: Changing Tone Updates Preview
- **Given:** Modal is open for Rohit Gupta (Hindi).
- **When:** User switches from "Polite" to "Firm Overdue".
- **Then:** Preview bubble instantly updates to include overdue date notice and settlement request in Hindi.

### Scenario 2: 1-Tap Copy on Desktop
- **Given:** User is on desktop laptop.
- **When:** User clicks "Copy Message".
- **Then:** Full text including UPI deep link is copied to clipboard, and feedback badge indicates success.

---

## 6. Automated Verification Gates
```bash
# Typecheck WhatsAppModal component
npx tsc --noEmit src/components/views/WhatsAppModal.tsx
```
