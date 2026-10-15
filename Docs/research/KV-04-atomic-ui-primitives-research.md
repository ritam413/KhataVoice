# KV-04 Research: Atomic UI Design System Primitives (Buttons, Badges, Modals, Cards)

- **Ticket Reference:** [KV-04-atomic-ui-primitives.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/Docs/Tickets/KV-04-atomic-ui-primitives.md)
- **Role Persona:** `wshobson-agents` (ROLE: DEVELOPER)
- **Curated Stack via `/pick-ui-library`:** Radix UI Primitives + CVA + Tailwind CSS v3 + Sonner + Lucide React
- **Craft Directives via `/ui-ux-pro-max` & `/ui-skills-root`:** High-contrast Bharat Modern palette, 48px minimum touch targets, zero-pill geometry, 60fps micro-interactions
- **Status:** Research & Architecture Specification Complete
- **Date:** 2026-10-14

---

## 1. Executive Summary & Architectural Role

The objective of **KV-04** is to integrate and deliver the complete set of accessible, production-grade atomic UI primitives for **KhataVoice**. These primitives form the foundational bedrock for all downstream user interfaces in Epic 2, Epic 3, Epic 4, and Epic 5:
- **KV-06 (Waveform Visualizer Canvas):** Requires modal dialogs, status badges, and trigger buttons.
- **KV-14 (Dual-Mode Viewport Simulator):** Requires layout cards, mode switcher pills, and container frames.
- **KV-15 to KV-18 (Mobile Kirana Screens 1–6):** Requires voice buttons, trust score badges, WhatsApp action triggers, stock progress indicators, and vernacular feedback toasts.
- **KV-19 & KV-20 (Judge Suite & Architecture Inspector):** Requires metric cards, tab panels, and interactive controls.

Rather than hand-crafting primitives from scratch with brittle DOM manipulation and custom focus loops, KV-04 adopts **shadcn/ui** patterns backed by battle-tested headless primitives from **Radix UI** (`@radix-ui/react-slot`, `@radix-ui/react-dialog`, `@radix-ui/react-progress`), styled with `class-variance-authority` (CVA) and Tailwind CSS v3, and accompanied by **Sonner** for vernacular notifications.

---

## 2. Multi-Agent Role Invariants (`wshobson-agents` ROLE: DEVELOPER)

Per the `wshobson-agents` engineering framework, this specification represents the handoff from **System Architect** to **Implementation Developer**:

```
┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│     System Architect    │ ───► │ Implementation Developer│ ───► │   QA / Test Engineer    │
│  (Contracts & Tokens)   │      │ (Atomic UI Primitives)  │      │  (Harness & Invariants) │
└─────────────────────────┘      └─────────────────────────┘      └─────────────────────────┘
```

### 2.1 Developer Contract Invariants
1. **Adherence to `/ponytail` (YAGNI & Zero Bloat):** Use standard library primitives and pre-installed packages (`@radix-ui/react-dialog`, `@radix-ui/react-progress`, `@radix-ui/react-slot`, `sonner`, `lucide-react`, `cva`, `clsx`, `tailwind-merge`). Zero net-new dependencies required.
2. **Contract-Driven Typing:** Every component must export typed props extending native HTML attributes (`React.ButtonHTMLAttributes`, `React.HTMLAttributes`, `React.ComponentPropsWithoutRef`), with complete TypeScript declaration.
3. **Radix Polymorphism (`asChild`):** `Button` must support `asChild` via Radix UI `Slot` to enable seamless Next.js `<Link>` composition without nested anchor hydration warnings.
4. **Zero-Crash Server Component Resilience:** Server Components importing UI primitives must not crash. Client-only primitives (`Dialog`, `Progress`, `Sonner`) must include explicit `"use client"` directives at the file root.

---

## 3. Curated Library Selection Audit (`/pick-ui-library`)

The `/pick-ui-library` catalog specifies taste-driven, canonical frontend tooling. Here is the exact mapping to KV-04 components:

| Task / Primitive | Recommended Tool | In-Repo Package | Rationale |
| :--- | :--- | :--- | :--- |
| **Slot Polymorphism** | Radix UI Slot | `@radix-ui/react-slot` (v1.1.0) | Composable buttons without DOM element duplication |
| **Accessible Dialog Modals** | Radix UI Dialog | `@radix-ui/react-dialog` (v1.1.2) | WAI-ARIA compliant focus trap, backdrop scroll lock, Esc key dismissal |
| **Progress / Stock Gauges** | Radix UI Progress | `@radix-ui/react-progress` (v1.1.0) | Accessible meter semantics, smooth transform transitions |
| **Toast Notifications** | Sonner | `sonner` (v1.5.0) | Zero-latency, multi-line Indic toasts, richColors, swipe-to-dismiss |
| **Variant-Driven Styling** | Class Variance Authority | `class-variance-authority` (v0.7.0) | Type-safe variant mapping with zero runtime CSS overhead |
| **Class String Merging** | `clsx` + `tailwind-merge` | `src/lib/utils.ts` (`cn`) | Collision-free Tailwind utility merging |
| **Iconography** | Lucide Icons | `lucide-react` (v0.453.0) | Ultra-crisp SVGs, pre-optimized in Next.js build |

---

## 4. Craft Directives & Anti-Slop Discipline (`/ui-ux-pro-max`)

To ensure the interface feels like an authentic, high-craft Indian Fintech application rather than a generic boilerplate template, the following rules are enforced:

### 4.1 Strict Geometry & Radii
- **Buttons & Inputs:** `rounded-[10px]` (`var(--radius)`). Never use pill buttons (`rounded-full`) for standard action buttons; pills look like generic consumer toy apps. (Exception: circular icon actions such as hero Voice Mic `rounded-full`).
- **Cards & Data Panels:** `rounded-2xl` (`16px`) with subtle 1px border (`border-border`) and glassmorphism backdrop (`bg-card/90 backdrop-blur-sm`).
- **Modal Dialogs:** `rounded-2xl` (`16px` to `20px`) with deep shadow (`shadow-2xl`) and dark obsidian backdrop (`bg-black/80 backdrop-blur-sm`).

### 4.2 WCAG 2.1 AAA Contrast Guards (From KV-03 Research)
- **Primary Saffron (`#FF7700`):** White text on saffron yields only `2.66:1` (failing WCAG AA). All default Saffron buttons and badges MUST use dark inverse text (`#0B0F19` / `text-primary-foreground`), yielding **7.20:1 AAA compliance**.
- **Emerald Primary (`#10B981`):** Uses dark inverse text (`#0B0F19`) or high-contrast white text (`#F8FAFC`) with dark emerald background.
- **Card Background (`#131B2E`):** Primary text (`#F8FAFC`) achieves **16.40:1 AAA contrast**.

### 4.3 Kirana Touch Ergonomics
- Kirana shopkeepers operate smartphones with calloused thumbs while weighing vegetables, handling cash, or holding goods.
- **Default Button Height:** Minimum `48px` (`h-12`) with generous horizontal padding (`px-5`).
- **Input Height:** `48px` (`h-12`) with `text-base` (preventing iOS auto-zoom on focus).
- **Icon Actions:** Minimum `48px x 48px` active touch boundary (`h-12 w-12`).

### 4.4 Micro-Interactions & States
- **Active Press Feedback:** `active:scale-[0.98] transition-all duration-150` gives tactile feedback even on budget Android devices.
- **Loading State:** Built-in `isLoading` prop with spinning `Loader2` icon and pointer-events disabled.
- **Disabled State:** `disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed`.

---

## 5. Detailed Component Specifications

### 5.1 `src/components/ui/button.tsx`
- **Variants:**
  - `default`: Bharat Saffron primary (`bg-primary text-primary-foreground hover:bg-saffron-600 shadow-md shadow-saffron-500/20 active:scale-[0.98]`).
  - `emerald`: Bharat Emerald action (`bg-emerald text-accent-foreground hover:bg-emerald-dark shadow-md shadow-emerald-500/20 active:scale-[0.98]`).
  - `secondary`: Slate surface (`bg-secondary text-secondary-foreground hover:bg-secondary/80`).
  - `destructive`: Crimson alert (`bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm`).
  - `outline`: Bordered surface (`border border-input bg-transparent hover:bg-accent/10 hover:text-foreground`).
  - `ghost`: Transparent hover (`hover:bg-accent/10 hover:text-foreground`).
  - `link`: Underline text (`text-primary underline-offset-4 hover:underline`).
- **Sizes:**
  - `default`: `h-12 px-5 py-2 text-sm font-semibold min-h-[48px]` (Kirana touch-safe).
  - `sm`: `h-9 px-3 text-xs rounded-md`.
  - `lg`: `h-14 px-8 text-base font-semibold min-h-[56px]`.
  - `icon`: `h-12 w-12 min-h-[48px] min-w-[48px] rounded-[10px]`.
  - `voiceHero`: `h-20 w-20 min-h-[80px] min-w-[80px] rounded-full shadow-xl shadow-saffron-500/30`.
- **Props:** Supports `asChild?: boolean`, `isLoading?: boolean`, and `variant / size`.

### 5.2 `src/components/ui/badge.tsx`
- **Variants:**
  - `default`: Saffron badge (`bg-primary text-primary-foreground`).
  - `secondary`: Slate badge (`bg-secondary text-secondary-foreground`).
  - `destructive`: Crimson alert badge (`bg-destructive text-destructive-foreground`).
  - `outline`: Border badge (`border border-input text-foreground`).
  - `emerald`: Success badge (`bg-emerald text-accent-foreground font-medium`).
- **Geometry:** `rounded-md px-2.5 py-1 text-xs font-semibold`.

### 5.3 `src/components/ui/trust-badge.tsx`
- **Deterministic Domain Logic:**
  $$\text{Tier} = \begin{cases} \text{GOLD} & \text{score} \ge 85 \\ \text{SILVER} & 65 \le \text{score} \le 84 \\ \text{BRONZE} & \text{score} < 65 \end{cases}$$
- **Visual Stylings:**
  - **GOLD ($\ge 85$):** Amber border, dark amber surface, golden shimmer, `ShieldCheck` icon.
    - Bengali label: `গোল্ড (বিশ্বস্ত)`
    - Hindi label: `उत्तम (विश्वसनीय)`
    - English label: `GOLD (High Trust)`
  - **SILVER ($65–84$):** Slate silver border, slate surface, `Shield` icon.
    - Bengali label: `সিলভার (স্বাভাবিক)`
    - Hindi label: `मध्यम (सामान्य)`
    - English label: `SILVER (Standard)`
  - **BRONZE ($< 65$):** Crimson border, dark red surface, `AlertTriangle` icon.
    - Bengali label: `সতর্ক (বাকি ঝুঁকি)`
    - Hindi label: `जोखिम (उधार सतर्क)`
    - English label: `AT RISK (Overdue)`
- **Features:**
  - Tabular numerals (`tabular-nums`) for numeric scores ($0\text{--}100$).
  - `size` variants: `sm` (compact inline table pill), `md` (standard list item), `lg` (customer profile banner).
  - Screen reader accessibility: `aria-label="Kirana Credit Trust Score: {score} out of 100 ({tier})"`.

### 5.4 `src/components/ui/card.tsx`
- Sub-components: `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent`.
- Styling: `rounded-2xl border border-border bg-card/90 backdrop-blur-sm text-card-foreground shadow-sm`.
- Micro-interactions: Optional hover glow variant for actionable cards (`hover:border-saffron/40 hover:shadow-saffron-500/5 transition-all`).

### 5.5 `src/components/ui/dialog.tsx`
- Sub-components: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`.
- Implementation: Backed by `@radix-ui/react-dialog`.
- Modal Overlay: `fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out`.
- Content Shell: Centered with smooth zoom-in animation, `rounded-2xl border border-border bg-card p-6 shadow-2xl max-w-lg w-full`.
- Accessible Close: Includes 48px touch-target cross button with screen reader text.

### 5.6 `src/components/ui/progress.tsx`
- Sub-components: `Progress`.
- Implementation: Backed by `@radix-ui/react-progress`.
- Invariants: Supports dynamic color variants via prop `variant`:
  - `saffron` (default): 4-second auto-commit countdown progress.
  - `emerald`: Inventory healthy stock gauge.
  - `destructive`: Inventory critically low warning gauge.
- Styling: `relative h-3 w-full overflow-hidden rounded-full bg-secondary`.

### 5.7 `src/components/ui/input.tsx`
- Implementation: Native `<input>` with forwardRef.
- Styling: `h-12 min-h-[48px] w-full rounded-[10px] border border-input bg-background/60 px-4 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:opacity-50 md:text-sm`.
- Touch target: Full 48px mobile height ensures error-free numerical input of rupee amounts and item quantities.

### 5.8 `src/components/ui/sonner.tsx`
- Implementation: Custom theme-aware `<Toaster />` wrapping `sonner`.
- Features:
  - Custom styling harmonized with Bharat Modern colors (`background`, `border`, `saffron`, `emerald`, `destructive`).
  - Vernacular font class integration (`font-sans`).
  - `richColors` enabled with custom class overrides.
  - Position: `top-center` on mobile viewports for immediate visibility, `bottom-right` on desktop.

---

## 6. Automated Verification & Regression Strategy

### 6.1 Verification Harness (`scripts/verify-kv04.ts`)
An automated TypeScript script will execute to verify:
1. **File Existence:** All 8 target primitive files exist in `src/components/ui/`.
2. **Export Integrity:** All expected exports (`Button`, `badgeVariants`, `TrustBadge`, `Card`, `Dialog`, `Progress`, `Input`, `Toaster`) exist and are non-null.
3. **TrustBadge Determinism:**
   - Score $92 \implies$ GOLD tier
   - Score $72 \implies$ SILVER tier
   - Score $45 \implies$ BRONZE tier
4. **Touch Target Rule:** Inspects Button & Input classes to confirm `min-h-[48px]` or `h-12` is present.
5. **Contrast Compliance:** Asserts dark text class on Saffron button variants.

### 6.2 Compilation & Build Gates
- `npm.cmd run type-check` (`tsc --noEmit`) passes with 0 errors.
- `npm.cmd run build` (`next build`) compiles without warnings or bundle bloat.

---

## 7. Downstream Dependencies Unblocked

Upon completion of KV-04:
- **KV-06 (Waveform Visualizer Canvas):** Unblocked to use `Card`, `Button`, and `Badge`.
- **KV-14 (Dual-Mode Viewport Simulator):** Unblocked to assemble the phone chassis and desktop frame using `Card` and `Button`.
- **KV-15 (Voice Recording Modal):** Unblocked to assemble the recording dialog using `Dialog`, `Progress`, and `Button`.
- **KV-17 (WhatsApp Recovery Modal):** Unblocked to display customer `TrustBadge`, repayment tone selectors, and 1-tap WhatsApp launch button.
