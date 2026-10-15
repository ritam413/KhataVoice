# KhataVoice: Design System & Visual Identity (design.md)

This document establishes the **"Bharat Modern" Fintech** design system for **KhataVoice**. It is engineered to combine world-class fintech visual polish with ultra-functional ergonomics tailored for Indian neighborhood retail merchants operating in high-sunlight, fast-paced street counter environments.

---

## 1. Visual Design Philosophy: "Bharat Modern"

Traditional enterprise accounting software is gray, sterile, and cluttered with microscopic data tables. Conversely, generic consumer apps rely on washed-out pastel cards that wash out under glaring midday sunlight in open-front Kirana stalls.

**"Bharat Modern"** adheres to three unbreakable principles:
1. **High-Contrast Legibility First:** Deep, rich dark backgrounds paired with luminous foreground elements ensure zero squinting and AAA contrast compliance in outdoor lighting conditions.
2. **Cultural Energy & Trust:** Grounded in energetic Indian Saffron (`#FF7700` / `#FF9933`) representing commerce, warmth, and vibrancy, balanced with Emerald Green (`#10B981`) denoting financial solvency, cash recovery, and positive trust.
3. **Physical Ergonomics for Calloused Thumbs:** Generous touch targets (52px to 72px) with physical-feeling haptic visual feedback, oversized vernacular typography, and micro-animations that communicate transaction states unambiguously.

---

## 2. Color Palette & CSS Design Tokens

```css
:root {
  /* ==========================================
     1. Background & Surface Tokens
     ========================================== */
  --bg-canvas: #090D16;          /* Deepest cosmic slate */
  --bg-surface: #121826;         /* Primary container obsidian */
  --bg-surface-elevated: #1B2337;/* Raised card background */
  --bg-surface-glass: rgba(27, 35, 55, 0.75); /* Frosted backdrop blur */
  --border-subtle: #242E47;      /* Clean structural borders */
  --border-focus: #3B4B72;       /* Active input boundary */

  /* ==========================================
     2. Primary Accent Tokens (Bharat Saffron)
     ========================================== */
  --accent-saffron: #FF7700;     /* Primary brand saffron */
  --accent-saffron-light: #FF9933;/* Glow and hover state */
  --accent-saffron-dim: rgba(255, 119, 0, 0.15); /* Tinted pill background */

  /* ==========================================
     3. Financial Status Tokens (Emerald & Crimson)
     ========================================== */
  --color-emerald: #10B981;       /* Cash collected, Gold trust, In stock */
  --color-emerald-dim: rgba(16, 185, 129, 0.15);
  --color-amber: #F59E0B;         /* Pending credit, Silver trust, Low stock */
  --color-amber-dim: rgba(245, 158, 11, 0.15);
  --color-crimson: #EF4444;       /* Overdue debt, Bronze trust, Depleted stock */
  --color-crimson-dim: rgba(239, 68, 68, 0.15);

  /* ==========================================
     4. Typography & Foreground Tokens
     ========================================== */
  --text-primary: #F8FAFC;       /* 98% white high-contrast text */
  --text-secondary: #94A3B8;     /* Clean muted descriptive text */
  --text-tertiary: #64748B;      /* Timestamp and footnote text */
  --text-inverse: #090D16;       /* Dark text on saffron/emerald badges */

  /* ==========================================
     5. Shadows & Elevation Tokens
     ========================================== */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-card: 0 4px 16px rgba(0, 0, 0, 0.4);
  --shadow-glow-saffron: 0 0 24px rgba(255, 119, 0, 0.35);
  --shadow-glow-emerald: 0 0 24px rgba(16, 185, 129, 0.35);

  /* ==========================================
     6. Layout & Sizing Tokens
     ========================================== */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-full: 9999px;
  --touch-target-min: 52px;
}
```

---

## 3. Typography Hierarchy

### 3.1 Font Stack
- **Primary Latin Display & UI Font:** `Plus Jakarta Sans`, sans-serif (clean, geometric, ultra-legible numbers).
- **Vernacular Scripts (Bengali & Hindi):** `Hind`, `Noto Sans Bengali`, `Noto Sans Devanagari`, sans-serif.

### 3.2 Scale & Weights
| Token | Font Size | Line Height | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `display-hero` | 32px (2.0rem) | 1.2 | 800 (ExtraBold) | Total Outstanding Udhaar banner |
| `heading-1` | 24px (1.5rem) | 1.3 | 700 (Bold) | Screen titles, Customer name in profile |
| `heading-2` | 18px (1.125rem) | 1.4 | 600 (SemiBold) | Section headers, Metric values |
| `body-primary` | 15px (0.9375rem)| 1.5 | 500 (Medium) | Ledger line items, WhatsApp preview |
| `body-caption` | 12px (0.75rem) | 1.4 | 500 (Medium) | Timestamps, SKUs, category tags |

---

## 4. Touch Targets & Ergonomic Constraints

Kirana merchants handle bulk commodities (flour, oil, pulses), requiring distinct physical design rules:
1. **Minimum Interactive Touch Target:** Every clickable button, pill, tab, and card must measure **at least 52px × 52px**.
2. **Hero Mic Action:** The primary Voice Mic is sized at **72px × 72px** on mobile screens, positioned within the thumb's natural sweep arc at the center-bottom of the viewport.
3. **No Hidden Swipe Gestures:** All destructive or critical actions (deleting an entry, approving recovery) have visible, labelled buttons. No reliance on swipe-to-delete gestures that can be accidentally triggered by sweaty fingers.

---

## 5. Micro-Animations & Audio-Visual Feedback

1. **Pulse Waveform Visualizer:** When recording, the mic button emanates concentric glowing rings (`keyframes: pulse-ring`) while the canvas visualizer renders real-time audio amplitude bars in emerald green.
2. **Atomic Confirmation Pop:** When dual-sync commits, the transaction card expands with a subtle spring transition (`cubic-bezier(0.175, 0.885, 0.32, 1.275)`), accompanied by a high-frequency confirmation chime.
3. **Trust Score Badge Shimmer:** Gold trust badges feature a subtle metallic sweep animation every 8 seconds to highlight high-value, reliable customers.

---

## 6. Anti-Slop Interface Guidelines

To ensure the interface feels crafted, intentional, and production-grade rather than a templated prototype:
- **No Unused Generic Placeholders:** All mock data uses authentic Kirana grocery brands (*Fortune Kachi Ghani Mustard Oil*, *Aashirvaad Shudh Chakki Atta*, *Tata Salt*, *Amul Taaza Milk*, *Lux Beauty Bar*) with realistic pricing and metric units (`packet`, `kg`, `litre`).
- **No Clashing AI Pastels:** Strict adherence to the dark obsidian, saffron, and emerald palette. Zero arbitrary purples, pinks, or generic bootstrap blues.
- **Vernacular Authenticity:** Bengali and Hindi text samples are translated idiomatically for neighborhood trade (*"ধার দিলাম"*, *"উধার"*, *"পরিশোধ"*, *"রসিদ"*), avoiding stiff machine translations.
