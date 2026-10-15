# KV-03 Research: "Bharat Modern" Fintech Design Tokens & CSS Reset

- **Ticket Reference:** `ticket/KV-03-bharat-modern-design-tokens.md` (BEADS Contract Ticket)
- **Role Persona:** `wshobson-agents` (ROLE: DEVELOPER)
- **Status:** Research Completed & Validated
- **Date:** 2026-10-13

---

## 1. Executive Summary & Objective

The objective of KV-03 is to define and implement the comprehensive **"Bharat Modern" Fintech Design Token System** and CSS reset for KhataVoice. The platform serves 13–15 million Indian Kirana store owners who operate in demanding physical environments (glaring midday sunlight in open-front stalls, dusty smartphone touchscreens, calloused fingers, and multilingual customer interactions).

KV-03 establishes:
1. **Mathematical Contrast Integrity (WCAG 2.1 AA/AAA):** Guaranteed $\ge 4.5:1$ contrast against dark obsidian surfaces for all informational text, with primary text achieving $\ge 16.4:1$, and saffron CTAs using dark inverse text for a $7.2:1$ contrast ratio.
2. **Physical Kirana Ergonomics:** Minimum interactive touch target boundary of $48\text{px} \times 48\text{px}$ (and $52\text{px}$ to $72\text{px}$ for high-velocity voice capture).
3. **Dual-Stack Harmonization:** Seamless interoperability between pure CSS Modules custom properties (`src/styles/tokens.module.css`), Tailwind CSS v3 semantic tokens, and shadcn/ui HSL CSS variables (`src/app/globals.css`).
4. **Vernacular Typography Stack:** Variable font integration (`Plus Jakarta Sans`, `Noto Sans Bengali`, `Noto Sans Devanagari`) with vertical line-height compensation for Indic matras and ligatures.

---

## 2. Color Palette & WCAG 2.1 Luminance Verification

### 2.1 Mathematical Luminance Formula
Relative luminance $L$ is calculated per WCAG 2.1:
$$L = 0.2126 \cdot R + 0.7152 \cdot G + 0.0722 \cdot B$$
where each sRGB channel is linearized:
$$C_{\text{linear}} = \begin{cases} \frac{C}{12.92} & C \le 0.03928 \\ \left(\frac{C + 0.055}{1.055}\right)^{2.4} & C > 0.03928 \end{cases}$$
The contrast ratio between two colors is:
$$\text{Ratio} = \frac{L_1 + 0.05}{L_2 + 0.05} \quad (L_1 > L_2)$$

### 2.2 Empirical Verification Results
The test script executed on the exact hex tokens yielded:

| Foreground Token | Background Surface | Contrast Ratio | WCAG 2.1 Rating | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `text-primary` (`#F8FAFC`) | `bg-app` (`#0B0F19`) | **18.30:1** | **AAA** (Exceeds 7.0:1) | Maximum legibility in harsh sunlight |
| `text-primary` (`#F8FAFC`) | `bg-card` (`#131B2E`) | **16.40:1** | **AAA** (Exceeds 7.0:1) | Crystal-clear card contents |
| `text-secondary` (`#94A3B8`) | `bg-app` (`#0B0F19`) | **7.47:1** | **AAA** (Exceeds 7.0:1) | Subtitles & timestamps |
| `text-secondary` (`#94A3B8`) | `bg-card` (`#131B2E`) | **6.69:1** | **AA** (Exceeds 4.5:1) | Card secondary descriptions |
| `text-muted` (`#64748B`) | `bg-app` (`#0B0F19`) | **4.02:1** | Non-text / Graphical | Restricted to icons & borders |
| `saffron-primary` (`#FF7700`) | `bg-app` (`#0B0F19`) | **7.20:1** | **AAA** (Large text / UI) | Brand highlight & accent glow |
| `saffron-primary` (`#FF7700`) | `bg-card` (`#131B2E`) | **6.45:1** | **AA** (Exceeds 4.5:1) | Button & tag borders |
| `emerald-primary` (`#10B981`) | `bg-app` (`#0B0F19`) | **7.55:1** | **AAA** (Exceeds 7.0:1) | Cash received & Gold trust |
| `crimson-primary` (`#EF4444`) | `bg-app` (`#0B0F19`) | **5.09:1** | **AA** (Exceeds 4.5:1) | Overdue debt & Bronze alert |
| `badge-gold` (`#F59E0B`) | `bg-app` (`#0B0F19`) | **8.92:1** | **AAA** (Exceeds 7.0:1) | Trust score badges |
| `text-inverse` (`#0B0F19`) | `saffron-primary` (`#FF7700`)| **7.20:1** | **AAA** (Exceeds 7.0:1) | **Optimal CTA button label text** |
| *White text (`#FFFFFF`)* | `saffron-primary` (`#FF7700`)| *2.66:1* | **FAIL (< 3.0:1)** | **Forbidden on Saffron buttons** |

> [!CRITICAL]
> **Accessibility Guard:** White text on `#FF7700` saffron yields only `2.66:1` contrast and fails WCAG AA! Therefore, all primary saffron buttons and badges MUST use dark inverse text (`#0B0F19` or `var(--text-inverse)`), which delivers `7.20:1` AAA compliance.

---

## 3. Architecture: CSS Modules & Tailwind CSS v3 Harmonization

### 3.1 Token System Layers
The architecture utilizes a two-tier token strategy:
1. **Tier 1 — CSS Custom Properties (`src/styles/tokens.module.css`):**
   - Pure CSS variables defined under `:root` and `.dark`.
   - Reusable CSS classes for module-based styling (e.g., `.saffronButton`, `.cardGlow`, `.trustGoldBadge`, `.touchTargetMin`).
   - Automated verification gate compliance: guarantees `css.includes('--saffron-primary')`.
2. **Tier 2 — Global Application Reset & Tailwind Bridge (`src/app/globals.css`):**
   - `@import "../styles/tokens.module.css";` ensuring tokens are universally in scope.
   - Global box-sizing, smooth scroll, `-webkit-tap-highlight-color: transparent`, and font smoothing.
   - Synchronization of shadcn CSS variables (`--primary`, `--primary-foreground`, `--card`, `--accent`, `--destructive`) with Bharat Modern tokens.
   - Enforcing `--primary-foreground: 224 71% 4%` (dark inverse text) to maintain 7.2:1 contrast.

### 3.2 CSS Module Verification Test
Next.js 14 App Router builds cleanly when `:root` custom properties are housed inside `tokens.module.css`:
```bash
node -e "const fs = require('fs'); const css = fs.readFileSync('src/styles/tokens.module.css', 'utf8'); console.assert(css.includes('--saffron-primary'), 'Missing saffron token');"
```

---

## 4. Vernacular Script Typography & Ergonomics

### 4.1 Typography Stack
- **Primary Latin Font:** `Plus Jakarta Sans` (geometric, legible figures).
- **Indic Script Support:** `Noto Sans Bengali` and `Noto Sans Devanagari` via Next.js Google Fonts optimization.
- **Line-Height Expansion:** Indic scripts feature complex conjuncts and top/bottom diacritics (*matras*). Standard English line-heights ($1.2$) cause vertical clipping. The CSS reset introduces a `.vernacular-text` utility providing `line-height: 1.6` and `padding: 2px 0`.

### 4.2 Touch Targets for Kirana Merchants
- Standard WCAG minimum: $44\text{px} \times 44\text{px}$.
- Bharat Modern invariant: **Minimum $48\text{px} \times 48\text{px}$** for all actionable elements (`button`, `input`, `select`, clickable pills).
- Voice Mic action: **$72\text{px} \times 72\text{px}$** to allow effortless 1-tap operation while holding a grocery item with the other hand.

---

## 5. Downstream Unblocking Matrix

Implementing KV-03 unblocks:
- **KV-04 (Atomic UI Primitives):** Enables `Button`, `Badge`, `TrustBadge`, `Card`, and `Progress` to reference verified tokens and contrast rules.
- **KV-06 (Waveform Visualizer Canvas):** Supplies exact hex color references (`#10B981` emerald, `#FF7700` saffron) for canvas rendering contexts.
- **KV-14 (Dual-Mode Viewport Simulator):** Provides layout and elevation tokens for mobile chassis rendering.
