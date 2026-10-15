# KhataVoice: Component Architecture & Atomic Design Library (components.md)

This document defines the component hierarchy, design tokens, props contracts, state behaviors, and accessibility specifications for **KhataVoice**.

---

## 1. Atomic Hierarchy Overview

```
+─────────────────────────────────────────────────────────────────────────────+
|                               LAYOUT CONTAINERS                             |
|  • MobileFrameSimulator       • DesktopCommandLayout      • ThemeWrapper    |
+─────────────────────────────────────────────────────────────────────────────+
                                       ▲
+─────────────────────────────────────────────────────────────────────────────+
|                                  ORGANISMS                                  |
|  • VoiceEntrySheet            • LedgerTable               • InventoryGrid   |
|  • WhatsAppReminderModal      • UnitEconomicsSimulator    • CommandHeader   |
+─────────────────────────────────────────────────────────────────────────────+
                                       ▲
+─────────────────────────────────────────────────────────────────────────────+
|                                  MOLECULES                                  |
|  • TransactionCard            • CustomerListItem          • InventoryRow    |
|  • ReminderToneSelector       • PresetVoiceChip           • MetricStatCard  |
+─────────────────────────────────────────────────────────────────────────────+
                                       ▲
+─────────────────────────────────────────────────────────────────────────────+
|                                    ATOMS                                    |
|  • MicButton                  • BadgeTrustScore           • AudioWaveVisual |
|  • CurrencyDisplay            • VernacularSelect          • StatusPill      |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 2. Atoms (Base UI Primitives)

### 2.1 `MicButton`
The central voice trigger button of KhataVoice.
- **Props Interface:**
```typescript
export interface MicButtonProps {
  state: 'idle' | 'listening' | 'processing' | 'disabled';
  size?: 'sm' | 'md' | 'lg'; // lg = 72px mobile hero
  onClick: () => void;
  languageLabel?: string;
  ariaLabel?: string;
}
```
- **Visual States:**
  - `idle`: Vibrant saffron background (`#FF7700`) with subtle radial pulse glow.
  - `listening`: High-energy emerald ring with active scale animation (1.05x) and breathing ripple effect.
  - `processing`: Dark slate background with spinning circular spinner indicator.
  - `disabled`: Muted charcoal background (`#2A3245`) with 0.5 opacity.
- **Touch Target:** Minimum 72px × 72px on mobile viewports for one-tap thumb accessibility.

---

### 2.2 `BadgeTrustScore`
Visual indicator of customer repayment reliability (0–100).
- **Props Interface:**
```typescript
export interface BadgeTrustScoreProps {
  score: number; // 0 to 100
  tier: 'GOLD' | 'SILVER' | 'BRONZE';
  showNumerical?: boolean;
  size?: 'sm' | 'md';
}
```
- **Style Rules:**
  - `GOLD` (85–100): Metallic gold gradient (`#F59E0B` to `#D97706`), dark badge text, crown/star icon.
  - `SILVER` (65–84): Sleek silver gradient (`#94A3B8` to `#64748B`), white text.
  - `BRONZE / AT-RISK` (<65): Warning crimson accent (`#EF4444`), shield/alert icon.

---

### 2.3 `AudioWaveVisualizer`
Canvas-driven reactive waveform displaying live audio decibel oscillations.
- **Props Interface:**
```typescript
export interface AudioWaveVisualizerProps {
  isActive: boolean;
  audioStream?: MediaStream;
  height?: number; // default: 48px
  barCount?: number; // default: 24
  accentColor?: string; // default: #10B981 (emerald)
}
```
- **Behavior:** Reads `AnalyserNode.getByteFrequencyData()` and animates vertical bar amplitudes at 60fps using `requestAnimationFrame`. Falls back to an aesthetic CSS CSS-keyframe wave when stream is simulated.

---

### 2.4 `CurrencyDisplay`
High-contrast Indian Rupee typography component.
- **Props Interface:**
```typescript
export interface CurrencyDisplayProps {
  amount: number;
  currencySymbol?: string; // default: '₹'
  variant?: 'large' | 'medium' | 'small';
  colorTone?: 'neutral' | 'credit' | 'debit'; // credit: green, debit: red/amber
}
```
- **Formatting:** Indian numbering formatting (e.g., `₹38,450.00` with lakh separators).

---

## 3. Molecules (Composite Controls)

### 3.1 `CustomerListItem`
Displays customer profile summary in ledger directory.
- **Props Interface:**
```typescript
export interface CustomerListItemProps {
  customer: Customer;
  onSelect: (customer: Customer) => void;
  onQuickWhatsApp: (customer: Customer) => void;
}
```
- **Elements:**
  - Customer Name in prominent vernacular/English typography.
  - Phone number and aging indicator (e.g., *"Last payment 18 days ago"*).
  - `BadgeTrustScore` pill.
  - Current outstanding udhaar in bold `CurrencyDisplay`.
  - 1-Tap WhatsApp shortcut button.

---

### 3.2 `PresetVoiceChip`
Quick-action buttons for triggering 1-click test scenarios for video recording and demo evaluation.
- **Props Interface:**
```typescript
export interface PresetVoiceChipProps {
  language: 'bn' | 'hi' | 'en';
  title: string;
  transcriptSample: string;
  onTrigger: (sample: PresetSample) => void;
  isPlaying?: boolean;
}
```
- **Elements:** Language badge (`বাংলা`, `हिंदी`), sample title (*"Mustard Oil Udhaar"*), play icon, active loading indicator.

---

### 3.3 `ReminderToneSelector`
Three-way cultural tone selector for debt recovery messages.
- **Props Interface:**
```typescript
export interface ReminderToneSelectorProps {
  selectedTone: ReminderTone;
  onChange: (tone: ReminderTone) => void;
  recommendedTone?: ReminderTone;
}
```
- **Options:**
  1. **Polite Gentle:** Respectful, elder-honoring language for high-trust regulars (Gold).
  2. **Friendly Follow-up:** Casual balance update for standard regulars (Silver).
  3. **Firm Overdue:** Direct, clear payment request for overdue balances (Bronze).

---

## 4. Organisms (Complex Functional Modules)

### 4.1 `VoiceEntrySheet`
The full-screen or bottom-sheet overlay hosting the speech recording and transaction review pipeline.
- **Internal States:**
  - `LISTENING`: Full visualizer wave, streaming text bubble, cancel button.
  - `PARSING`: Skeleton loading pills, spinning indicator.
  - `CONFIRMATION`: Extracted customer pill, itemized pills, dual-sync CTA, auto-commit progress bar.
- **Key Interactivity:** Merchant can click any extracted item pill to tweak quantities or amount before finalizing.

---

### 4.2 `WhatsAppReminderModal`
The debt recovery control hub for engaging customers.
- **Internal Modules:**
  - Customer summary header with Trust Score explanation.
  - `ReminderToneSelector` and Language Selector.
  - Live preview message text area (editable).
  - Dynamic UPI deep link preview box (`upi://pay?pa=...`).
  - "Send on WhatsApp (wa.me)" direct anchor button.

---

### 4.3 `UnitEconomicsSimulator`
Interactive financial modeling organism for hackathon judges.
- **Controls:**
  - Daily Voice Entries slider (range: 20 to 300 entries/day).
  - Monthly Pro Subscription slider (range: ₹99 to ₹499/month).
- **Computed Outputs:**
  - Cost per Voice Entry: ₹0.10.
  - Store Monthly Infrastructure Cost: `entries * 30 * ₹0.10`.
  - Store Gross Margin %: `((subscription - cost) / subscription) * 100`.
  - Merchant ROI Multiplier: `recovered_capital / subscription`.

---

## 5. Layout Containers

### 5.1 `MobileFrameSimulator`
Wraps the application in a realistic smartphone chassis when "Phone Mode" is active:
- Outer dimensions: 412px × 870px, centered horizontally.
- Rounded corners (`border-radius: 44px`), subtle drop shadow, status bar header, and home bar indicator.
- Allows evaluator to experience exact Kirana mobile ergonomics directly on a laptop monitor.

### 5.2 `DesktopCommandLayout`
Unfolds the UI into an expansive 3-column command dashboard:
- Column 1: Voice Hub & Audio Presets.
- Column 2: Live Dual-Sync Ledger Feed.
- Column 3: Store Inventory Watchlist & Customer Debt Radar.

---

## 6. Global State Integration (Zustand v5)

All interactive Organisms, Molecules, and Layout Containers bind to the centralized **Zustand v5 Store** (`src/lib/store/useAppStore.ts`):

```typescript
import { useAppStore, useShallow } from '@/lib/store/useAppStore';

// In Layout Containers: Viewport & Screen Selector
const { viewportMode, setViewportMode } = useAppStore(
  useShallow((state) => ({
    viewportMode: state.viewportMode,
    setViewportMode: state.setViewportMode,
  }))
);

// In VoiceEntrySheet: Voice State & 4s Countdown Timer
const { voiceState, countdownSeconds, draftTransaction } = useAppStore(
  useShallow((state) => ({
    voiceState: state.voiceState,
    countdownSeconds: state.countdownSeconds,
    draftTransaction: state.draftTransaction,
  }))
);

// In LedgerTable / InventoryGrid: Granular Data Subscriptions
const ledger = useAppStore((state) => state.ledger);
const inventory = useAppStore((state) => state.inventory);
```
- **Re-render Isolation:** Components only re-render when their explicitly selected slice fields mutate.
- **Out-of-Tree Binding:** Audio callbacks and Supabase Realtime channels mutate state directly via `useAppStore.getState()`.

