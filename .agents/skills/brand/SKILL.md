---
name: brand
description: Brand voice, visual identity, messaging frameworks, asset management, and brand consistency. Activate for branded content, tone of voice, marketing assets, brand compliance, style guides, and creating comprehensive BRAND.md specifications.
argument-hint: "[create|review|update] [brand-name-or-context]"
metadata:
  author: agent-kit
  version: "1.0.0"
---

# Brand Skill: Identity, Voice, Strategy & Design System

Use this skill when defining, creating, reviewing, or codifying a brand for a website, digital product, or service. It generates an authoritative, cohesive, anti-slop **`BRAND.md`** brand book, establishes brand voice and messaging frameworks, defines visual identity assets and color tokens, and ensures relentless consistency across the entire user experience.

---

## Core Brand Creation Framework

A production-grade brand consists of four interconnected pillars:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. BRAND STRATEGY & POSITIONING                             │
│    Mission · Vision · Archetype · Core Wedge · Audience     │
├─────────────────────────────────────────────────────────────┤
│ 2. BRAND VOICE & MESSAGING FRAMEWORK                        │
│    Tone Spectrum · Elevator Pitches · Cultural Vernacular   │
├─────────────────────────────────────────────────────────────┤
│ 3. VISUAL & MULTISENSORY IDENTITY SYSTEM                    │
│    Logo Mark · Colors & Semantics · Typography · Audio/Haptic│
├─────────────────────────────────────────────────────────────┤
│ 4. BRAND ASSETS, COMPLIANCE & TOUCHPOINTS                   │
│    Website UI · WhatsApp Persona · Social OG · Anti-Slop    │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Brand Strategy & Positioning

1. **Brand Essence & Purpose Statement**:
   - What fundamental human, operational, or economic friction does the brand eliminate?
   - What is the brand's core truth? (e.g., selling *unlocked working capital and dignity*, not just a speech-to-text tool).
2. **Brand Archetype**:
   - Identify the primary and secondary archetypes (e.g., *The Hero + The Trusted Neighbor*, *The Sage + The Craftsman*).
   - Define how this archetype behaves in high-stress customer interactions (e.g., polite debt collection vs. clinical billing).
3. **The Wedge & Value Proposition**:
   - The immediate irresistible entry point (low cognitive load, instant utility).
   - Target personas, emotional transformation, and why legacy alternatives feel alien or hostile.

---

## 2. Brand Voice & Messaging Framework

1. **Tone Matrix**:
   - Define the brand's tonal dials across standard axes:
     - *Empathetic* vs. *Clinical* (e.g., 85% Warm & Culturally Respectful)
     - *Decisive* vs. *Hesitant* (e.g., 90% Punchy, direct actions)
     - *Accessible* vs. *Academic* (e.g., 95% Plain everyday vernacular)
2. **Multilingual & Cultural Sensitivity**:
   - Specify vocabulary and idioms for regional languages and colloquial dialects (e.g., Bengali, Hindi, Hinglish, English).
   - Establish rules for sensitive scenarios (debt recovery, stock depletion, payment reminders) ensuring cultural dignity.
3. **Pillars of Messaging**:
   - **One-Liner / Hook**: 5–8 words that stick instantly.
   - **Elevator Pitch (30 seconds)**: Problem + Solution + Transformational Benefit.
   - **Boilerplate**: 50-word and 100-word official media/investor descriptions.

---

## 3. Visual & Multisensory Identity System

1. **Brand Colors & Semantic Mapping**:
   - **Primary Brand Tint**: Signature recognizable color (with exact Hex, HSL, and semantic role).
   - **Secondary & Accent Tones**: Intentional contrast accents (e.g., Emerald for financial recovery, Crimson for urgent alerts).
   - **Surfaces & Neutrals**: Sleek canvas backgrounds, border subtleties, and dark/light elevation tiers.
   - **Accessible Contrast Verification**: Ensure every text-on-color combination satisfies WCAG 2.1 AAA (minimum 7:1) or AA (4.5:1).
2. **Typography Hierarchy**:
   - **Display / Brand Headline**: Characterful, modern font expressing credibility and vitality.
   - **Body & Tabular Numerals**: High-readability font with monospace numeric alignment (`font-variant-numeric: tabular-nums`) for currency and metrics.
   - **Vernacular Scripts**: Native regional fonts (e.g., Noto Sans Bengali, Noto Sans Devanagari) formatted with appropriate line-height expansion.
3. **Logo Mark & Iconography**:
   - Symbolic rationale, clear space rules, favicon adaptations, and vector geometry principles.
4. **Multisensory & Sonic Branding**:
   - Audio earcons (e.g., Indian retail Soundbox harmonic bell chime).
   - Haptic feedback and micro-interaction easing.

---

## 4. Brand Deliverables: `BRAND.md` Specification

When creating a brand, write a comprehensive **`BRAND.md`** at the workspace root containing:

1. **Brand Identity Overview**: Name, meaning, core purpose, and tagline.
2. **Brand Archetype & Voice Guidelines**: Tone dials, vocabulary dos and don'ts, and situational phrasing.
3. **Design Tokens & Color Palette**: Complete table of Hex, HSL, and semantic roles.
4. **Typography System**: Font families, weights, tabular figures, and regional script rules.
5. **Brand Mark & Icon Guidelines**: Logo layout, clear zones, app icon specs, and favicon SVGs.
6. **Multi-Channel Applications**:
   - Website Hero & Navigation branding
   - WhatsApp message persona & formatting
   - Social metadata & Open Graph card designs
   - Retail Soundbox audio branding
7. **Anti-Slop Brand Checklist**: Guardrails against generic AI aesthetics and corporate fluff.

---

## Execution Workflow

1. **Discovery & Context Ingestion**:
   - Read project files (`context.md`, `prd.md`, `design.md`, persona specifications) to align with existing product DNA.
2. **Brand Synthesis & Validation**:
   - Propose or refine brand pillars with the user.
3. **Artifact Generation**:
   - Write canonical `BRAND.md` to repository root.
   - Sync brand tokens with `tokens.module.css` and `tailwind.config.ts`.
4. **Verification**:
   - Ensure zero generic AI filler words ("seamless", "revolutionary", "game-changing").
   - Test contrast ratios and brand harmony.
