# KV-18: Screen 6: Desktop Merchant Command Center with Live Supabase Realtime Stream

- **Epic:** Epic 4: Dual-Mode Screens & UI Workflows
- **Priority:** P0 (Blocker)
- **Story Points:** 4 SP
- **Upstream Dependencies:** KV-14, KV-15, KV-16, KV-17
- **Downstream Blockers:** KV-21
- **Target Files:**
  - `src/components/views/DesktopCommandCenter.tsx`
  - `src/components/views/RealtimeEventFeed.tsx`
  - `src/styles/command-center.module.css`

---

## 1. Architectural Role & Objective
Implement Screen 6 (Desktop Merchant Command Center). When the user toggles into desktop mode, KhataVoice unfolds from the single-column smartphone view into an expansive, professional multi-pane Kirana operations hub. Displays high-level working capital KPIs, a live Supabase Realtime transaction audit stream, low-stock warnings, and full customer debt ledgers side-by-side.

---

## 2. Input Contract & Pre-Conditions
- Unified state store with active merchant, customers, ledger, and inventory.
- Realtime channel subscription to Supabase `ledger_entries` (or polling event emitter in local fallback mode).

---

## 3. State Invariants & Hardening Guards
- **Live Stream Multi-Device Sync:** Spoken entries recorded on a mobile device or via presets must appear in the desktop transaction feed within $< 500\text{ms}$ without requiring manual page refresh.
- **Responsive Widescreen Layout:** Adapts cleanly across $1024\text{px}$, $1280\text{px}$, and $1920\text{px}$ viewports using CSS Grid.

---

## 4. Implementation Details

### 4.1 Dashboard Layout Grid
- **Top Row (4 KPI Metric Cards):**
  - Total Outstanding Udhaar: ₹3,010 (across 6 customers).
  - Recovered This Month: ₹4,800.
  - Active Voice Transactions Today: 14 entries.
  - Inventory Value: ₹18,450 (10 items tracked).
- **Left Column (Real-Time Live Transaction Feed):**
  - Renders recent ledger entries as an animated stream with pulse badges (`[Udhaar Sale]`, `[Cash Sale]`, `[Restock]`).
  - Shows raw spoken transcript and timestamp.
- **Center/Right Column (Customer Ledgers & Quick Recovery):**
  - Full customer table with Trust Scores, badges, balances, and inline WhatsApp reminder trigger buttons.
- **Bottom Shelf (Inventory Low-Stock Alerts):**
  - Alerts for critical items (e.g. Mustard Oil at negative stock or Dal below threshold).

---

## 5. Behavior-Driven Specification (Given / When / Then)

### Scenario 1: Real-Time Entry Arrival
- **Given:** Desktop Command Center is open in one tab.
- **When:** A voice transaction is committed in another window.
- **Then:** Realtime event feed automatically animates the new transaction to the top of the feed with a subtle saffron highlight.

---

## 6. Automated Verification Gates
```bash
# Typecheck DesktopCommandCenter
npx tsc --noEmit src/components/views/DesktopCommandCenter.tsx
```
