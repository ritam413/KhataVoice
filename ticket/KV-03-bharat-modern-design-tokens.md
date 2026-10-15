# KV-03: Implement "Bharat Modern" Fintech Design Tokens & CSS Reset

- **Epic:** Epic 1: Foundation & Design System
- **Priority:** P0 (Blocker)
- **Story Points:** 2 SP
- **Upstream Dependencies:** KV-01
- **Downstream Blockers:** KV-04
- **Target Files:**
  - `src/styles/tokens.module.css`
  - `src/app/globals.css`

---

## 1. Architectural Role & Objective
Define the comprehensive design token system for the **"Bharat Modern" Fintech Aesthetic**. KhataVoice must avoid generic UI templates or plain color ramps. It uses rich deep dark slate backgrounds (`#0B0F19`), warm energetic saffron accents (`#FF7700` / `#FF9933`) representing traditional Indian commerce (*shubh labh*), emerald green (`#10B981`) for repayments/assets, and crimson (`#EF4444`) for overdue debt. Typography leverages modern Google Fonts (*Plus Jakarta Sans* or *Inter*) with high contrast for sunny Kirana storefront legibility.

---

## 2. Input Contract & Pre-Conditions
- Clean CSS reset loaded in `src/app/globals.css`.
- Support for CSS custom properties (`:root` variables) enabling instant dark/light theming.
- Accessibility standards: Minimum 4.5:1 WCAG contrast ratio for all text elements against card backgrounds.

---

## 3. State Invariants & Hardening Guards
- **No Tailwind Dependencies:** Pure CSS custom properties and CSS Modules.
- **Vernacular Legibility Invariant:** Base font sizes must be $\ge 14\text{px}$ and touch targets for mobile buttons must be $\ge 48\text{px} \times 48\text{px}$ to accommodate shopkeepers with varied digital literacy.
- **Theme Resilience:** All colors declared as semantic CSS tokens (`--color-bg-primary`, `--color-accent-saffron`, `--color-accent-emerald`, `--color-trust-gold`).

---

## 4. Implementation Details

### 4.1 Core Color Tokens (`src/styles/tokens.module.css` / `:root`)
```css
:root {
  /* Brand Accents */
  --saffron-primary: #FF7700;
  --saffron-hover: #E06900;
  --saffron-glow: rgba(255, 119, 0, 0.25);
  
  --emerald-primary: #10B981;
  --emerald-hover: #059669;
  --emerald-glow: rgba(16, 185, 129, 0.25);

  --crimson-primary: #EF4444;
  --crimson-hover: #DC2626;

  /* Trust Score Badges */
  --badge-gold: #F59E0B;
  --badge-gold-bg: rgba(245, 158, 11, 0.15);
  --badge-silver: #94A3B8;
  --badge-silver-bg: rgba(148, 163, 184, 0.15);
  --badge-bronze: #F87171;
  --badge-bronze-bg: rgba(248, 113, 113, 0.15);

  /* Surfaces & Backgrounds */
  --bg-app: #0B0F19;
  --bg-card: #131B2E;
  --bg-card-hover: #1A243D;
  --bg-input: #0F172A;
  --border-card: #1E293B;
  --border-focus: #FF7700;

  /* Typography */
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --font-family-base: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;

  /* Elevation Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  --shadow-glow-saffron: 0 0 25px rgba(255, 119, 0, 0.35);

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-pill: 9999px;
}
```

### 4.2 Global Reset (`src/app/globals.css`)
- Box-sizing border-box reset.
- Smooth scrolling and native tap highlight removal (`-webkit-tap-highlight-color: transparent`).
- High-contrast text rendering (`-webkit-font-smoothing: antialiased`).

---

## 5. Behavior-Driven Specification (Given / When / Then)

### Scenario 1: Contrast Verification
- **Given:** A text container with class `text-secondary` rendered on background `bg-card`.
- **When:** Evaluated by WCAG contrast calculators.
- **Then:** Contrast ratio is $\ge 5.2:1$, satisfying AA/AAA legibility standards.

---

## 6. Automated Verification Gates
```bash
# Verify tokens file exports and syntax validity
node -e "const fs = require('fs'); const css = fs.readFileSync('src/styles/tokens.module.css', 'utf8'); console.assert(css.includes('--saffron-primary'), 'Missing saffron token');"
```
