# KV-15: Screens 1 & 2: Kirana Mobile Home & Voice Modal with 4s Countdown & Soundbox TTS

- **Epic:** Epic 4: Dual-Mode Screens & UI Workflows
- **Priority:** P0 (Blocker)
- **Story Points:** 5 SP
- **Upstream Dependencies:** KV-06, KV-08, KV-11
- **Downstream Blockers:** KV-18
- **Target Files:**
  - `src/components/views/HomeScreen.tsx`
  - `src/components/views/VoiceEntryModal.tsx`
  - `src/components/audio/PresetSelector.tsx`
  - `src/lib/audio/soundbox.ts`
  - `src/styles/voice-modal.module.css`

---

## 1. Architectural Role & Objective
Implement Screen 1 (Kirana Mobile Home View) and Screen 2 (Active Voice Recording Modal). Screen 1 features the prominent floating 1-Tap Microphone CTA (*"🎙️ বোলিয়ে বা লিখুন"*), today's credit metrics, and quick action cards. Screen 2 provides the live voice recording interface: audio waveform visualizer, 1-Click Preset tray, real-time transcription display, parsed entity pills, and the **4-Second Auto-Commit Grace Window** with tactile soundbox vernacular audio feedback.

---

## 2. Input Contract & Pre-Conditions
- User triggers mic button or taps an audio sample preset.
- Access to `transcribeAudio` and `parseTransaction` route handlers.
- Access to `POST /api/dual-sync`.

---

## 3. State Invariants & Hardening Guards
- **Adversarial Review Hardening (4-Second Auto-Commit Countdown & Mutex):**
  - Once entities are parsed, a 4-second linear countdown timer animates on the Confirm CTA.
  - User can tap **"Confirm Now"** to commit immediately, or **"Edit / Cancel"** to abort.
  - During commit execution, the UI enters a locked `isSyncing` state, disabling the mic and confirm buttons to prevent double submission.
- **Council Review Hardening (Soundbox Vernacular Confirmation):**
  - Upon successful dual-sync commit, the app simulates an Indian retail Soundbox (Paytm / PhonePe audio box):
    1. Plays a high-fidelity payment chime audio tone.
    2. Uses Web Speech Synthesis (`window.speechSynthesis`) to speak confirmation in the active language:
       - Bengali: *"শ্যামবাবু: ₹২৬০ বাকি সেভ হয়েছে"*
       - Hindi: *"रोहित जी: ₹२४० उधार दर्ज हो गया"*

---

## 4. Implementation Details

### 4.1 Screen 1 (Mobile Home Screen)
- **Top Header:** Merchant name (*"মা তারা ভ্যারাইটি স্টোর"*), date, language picker.
- **Hero Credit Summary Card:**
  - Total Udhaar Outstanding: ₹3,010 (Crimson badge).
  - Recovered This Week: ₹2,450 (Emerald badge).
  - At-Risk Customers: 2 (Bronze alerts).
- **Giant Saffron 1-Tap Microphone CTA:**
  - Centered floating circular button ($80\text{px} \times 80\text{px}$) with pulsing saffron glow.
  - Subtext: *"বোলিয়ে: 'শ্যামবাবু ২ কেজি চাল বাকি'"*

### 4.2 Screen 2 (Voice Entry Active Modal)
- **State Machine Transitions:**
  `IDLE` $\to$ `LISTENING` $\to$ `TRANSCRIBING` $\to$ `PARSED` $\to$ `COUNTDOWN` $\to$ `COMMITTING` $\to$ `CONFIRMED`.
- **Parsed Entity Card:**
  - Customer Badge: Name + Trust Score + Tier.
  - Transaction Type Badge: `Udhaar Sale` (Amber) / `Cash Sale` (Emerald).
  - Amount: Large ₹260 display.
  - Items list with quantities and units.
- **Countdown Progress Bar:**
  - Animates from $100\%$ width to $0\%$ over 4000ms.
  - Auto-triggers `handleCommit()` on expiration.

### 4.3 Soundbox Feedback Helper (`src/lib/audio/soundbox.ts`)
```typescript
export function playSoundboxConfirmation(message: string, language: 'bn' | 'hi' | 'en') {
  // 1. Play synthetic audio chime via Web Audio API
  playChimeTone();

  // 2. Vernacular TTS
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = language === 'bn' ? 'bn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}
```

---

## 5. Behavior-Driven Specification (Given / When / Then)

### Scenario 1: Voice Entry Auto-Commit with Soundbox
- **Given:** Shopkeeper clicks "Preset 1: Shyam Babu".
- **When:** Modal displays parsed details and the 4-second timer completes.
- **Then:** Transaction commits atomically, chime plays, Bengali TTS confirms *"শ্যামবাবু: ₹২৬০ বাকি সেভ হয়েছে"*, and balance updates.

### Scenario 2: Cancel Auto-Commit
- **Given:** Countdown progress bar is at 2 seconds remaining.
- **When:** Shopkeeper taps "Edit / Cancel".
- **Then:** Countdown halts immediately, zero database writes occur, and user returns to edit screen.

---

## 6. Automated Verification Gates
```bash
# Typecheck HomeScreen and VoiceEntryModal
npx tsc --noEmit src/components/views/HomeScreen.tsx src/components/views/VoiceEntryModal.tsx
```
