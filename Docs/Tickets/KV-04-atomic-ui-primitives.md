# KV-04: Atomic UI Design System Primitives (Buttons, Badges, Modals, Cards)

- **Epic:** Epic 1: Foundation & Design System
- **Priority:** P0 (Blocker)
- **Story Points:** 4 SP
- **Upstream Dependencies:** KV-03
- **Downstream Blockers:** KV-06, KV-14
- **Target Files:**
  - `src/components/ui/button.tsx`
  - `src/components/ui/badge.tsx`
  - `src/components/ui/trust-badge.tsx`
  - `src/components/ui/card.tsx`
  - `src/components/ui/dialog.tsx`
  - `src/components/ui/progress.tsx`
  - `src/components/ui/input.tsx`
  - `src/components/ui/sonner.tsx`

---

## 1. Architectural Role & Objective
Integrate accessible, battle-tested UI primitives via **shadcn/ui** and `/pick-ui-library` adhering to the "Bharat Modern" token system. Instead of building components from scratch, leverage Radix UI primitives (`@radix-ui/react-slot`, `@radix-ui/react-dialog`, `@radix-ui/react-progress`), CVA, and Sonner toasts. Every component is styled with Tailwind CSS, fully typed, keyboard accessible, and optimized for mobile touch interaction (oversized active touch targets, ripple/pulse feedback, screen reader labels).

---

## 2. Input Contract & Pre-Conditions
- Tailwind CSS v3 & `components.json` initialized via KV-01.
- `src/lib/utils.ts` (`cn`) available.
- `lucide-react` icons available for glyph rendering.

---

## 3. State Invariants & Hardening Guards
- **Strict Touch Target Compliance:** All primary and icon buttons must measure at least $48\text{px} \times 48\text{px}$ touch target on mobile viewports.
- **Modal Focus Trapping & Backdrop Lock:** When a dialog is open, Radix UI automatically traps focus, manages ARIA attributes, locks `document.body` scrolling, and handles `Escape` key dismissal.
- **Trust Badge Determinism:** `TrustBadge` component maps score to tier deterministically:
  - $\ge 85 \implies$ `GOLD` (Golden saffron shimmer)
  - $65\text{--}84 \implies$ `SILVER` (Slate silver badge)
  - $< 65 \implies$ `BRONZE` (Warning amber/crimson badge)

---

## 4. Implementation Details

### 4.1 Component Contracts
- `button.tsx`: shadcn/ui Button with variants `default` (saffron primary), `secondary`, `emerald` (confirm sync), `destructive`, `ghost`, `outline`. Supports `asChild`, `isLoading`.
- `trust-badge.tsx`: Renders numeric score ($0\text{--}100$) + ShieldCheck/Alert icon + tier badge pill with CVA styling.
- `dialog.tsx`: shadcn/ui Dialog wrapping `@radix-ui/react-dialog` (backdrop blur, responsive mobile drawer scaling).
- `progress.tsx`: shadcn/ui Progress wrapping `@radix-ui/react-progress` for the 4-second countdown and inventory stock gauges.
- `card.tsx`: shadcn/ui Card (`CardHeader`, `CardTitle`, `CardContent`, `CardFooter`) with subtle border and glassmorphism.
- `sonner.tsx`: shadcn/ui Sonner wrapper for zero-latency vernacular feedback toasts.

---

## 5. Behavior-Driven Specification (Given / When / Then)

### Scenario 1: TrustBadge Tier Rendering
- **Given:** Customer with `trust_score = 72`.
- **When:** `<TrustBadge score={72} />` is rendered.
- **Then:** Component outputs the "SILVER" tier styling with slate silver coloring and score label "72/100".

### Scenario 2: Modal Keyboard Dismissal
- **Given:** An active voice modal is displayed on screen.
- **When:** User presses the `Escape` key on their keyboard.
- **Then:** `onClose` callback fires and the modal unmounts smoothly.

---

## 6. Automated Verification Gates
```bash
# Typecheck atomic UI primitives
npx tsc --noEmit src/components/ui/Button.tsx src/components/ui/TrustBadge.tsx src/components/ui/Modal.tsx
```
