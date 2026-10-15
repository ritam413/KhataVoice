# Firecrawl Deep Research: KV-01 Scaffold Next.js App Router with Tailwind CSS v3 & shadcn/ui

**Document ID:** `RESEARCH-KV-01-SCAFFOLD-TAILWIND-SHADCN`  
**Target Ticket:** [KV-01-scaffold-nextjs-app.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/Docs/Tickets/KV-01-scaffold-nextjs-app.md)  
**Agent Role:** Developer (`wshobson-agents` ROLE: DEVELOPER)  
**Curated Stack Directive:** `/pick-ui-library` & User Override (Tailwind CSS v3 + shadcn/ui)  
**Sprint Phase:** Day 1 — Foundation & Design System (Epic 1)  
**Status:** Approved & Specified  

---

## 1. Architectural Role & Objective

Per user request and confirmed selection, the UI architecture transitions from authoring atomic components from scratch in Vanilla CSS Modules to leveraging **Tailwind CSS v3 (v3.4)** with **shadcn/ui** and curated libraries from `/pick-ui-library`.

This provides:
1. **Zero Reinvented Wheels:** Production-ready, accessible, accessible-first Radix UI primitives with focus trapping, ARIA roles, and keyboard navigation.
2. **Speed & Consistency:** Avoids writing manual modal backdrops, dialog locks, button variants, and progress bars from scratch.
3. **Bharat Modern Theme Integration:** Mapped into shadcn/ui CSS custom properties (`--primary: 24 100% 50%` for Saffron, `--accent: 156 72% 38%` for Emerald) inside `globals.css` and `tailwind.config.ts`.
4. **`/pick-ui-library` Integration:**
   - Primitives: `shadcn/ui` (Radix UI + CVA + `clsx` + `tailwind-merge`)
   - Notifications / Toasts: `Sonner`
   - Numbers / Balance animation: `number-flow`
   - Command palette (⌘K): `cmdk`
   - Icons: `lucide-react`
   - Theme switching: `next-themes`

---

## 2. Dependency Specification & Version Matrix

### 2.1 Production Dependencies
```json
{
  "dependencies": {
    "next": "^14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@supabase/supabase-js": "^2.45.4",
    "lucide-react": "^0.453.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4",
    "class-variance-authority": "^0.7.0",
    "tailwindcss-animate": "^1.0.7",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-progress": "^1.1.0",
    "sonner": "^1.5.0",
    "next-themes": "^0.3.0",
    "@number-flow/react": "^0.3.2",
    "cmdk": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.6.3",
    "@types/node": "^20.16.11",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "tailwindcss": "^3.4.14",
    "postcss": "^8.4.47",
    "autoprefixer": "^10.4.20"
  }
}
```

---

## 3. Configuration Blueprints

### 3.1 `components.json` (shadcn/ui Canonical Schema)
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### 3.2 `src/lib/utils.ts` (Class Merging Utility)
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

### 3.3 `postcss.config.mjs`
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### 3.4 `tailwind.config.ts` (Tailwind v3.4 + Bharat Modern Colors)
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Bharat Modern specific brand accents
        saffron: {
          DEFAULT: "#FF7700",
          light: "#FFA043",
          dark: "#D66300",
          50: "#FFF7ED",
          500: "#FF7700",
          600: "#EA580C",
        },
        emerald: {
          DEFAULT: "#10B981",
          light: "#34D399",
          dark: "#059669",
        },
        trust: {
          gold: "#F59E0B",
          silver: "#94A3B8",
          bronze: "#EF4444",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.03)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### 3.5 `src/app/globals.css` (Tailwind Directives & HSL Design Tokens)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 220 25% 97%;
    --foreground: 222 47% 11%;

    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;

    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;

    /* Bharat Saffron Primary */
    --primary: 28 100% 50%;
    --primary-foreground: 0 0% 100%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222 47% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    /* Bharat Emerald Accent */
    --accent: 156 72% 38%;
    --accent-foreground: 0 0% 100%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 28 100% 50%;

    --radius: 0.75rem;
  }

  .dark {
    --background: 224 71% 4%;
    --foreground: 213 31% 91%;

    --card: 224 71% 7%;
    --card-foreground: 213 31% 91%;

    --popover: 224 71% 7%;
    --popover-foreground: 213 31% 91%;

    /* Bharat Saffron Glow in Dark Mode */
    --primary: 28 100% 50%;
    --primary-foreground: 0 0% 100%;

    --secondary: 222 47% 13%;
    --secondary-foreground: 210 40% 98%;

    --muted: 223 47% 14%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 156 72% 42%;
    --accent-foreground: 0 0% 100%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 216 34% 17%;
    --input: 216 34% 17%;
    --ring: 28 100% 50%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

---

## 4. shadcn/ui Component Catalog (Replaces Scratch Components in KV-04)

Instead of hand-coding primitives from scratch, KV-04 implements these shadcn-compatible components:

| Component | Origin | Purpose in KhataVoice |
| :--- | :--- | :--- |
| `Button` | shadcn/ui (`@radix-ui/react-slot` + CVA) | Oversized Kirana mobile action buttons, mic trigger, WhatsApp dispatches |
| `Badge` | shadcn/ui (CVA) | Transaction type pill tags (`Udhaar`, `Cash`, `Restock`) |
| `TrustBadge` | Custom wrapper around Badge & CVA | Dynamic 0–100 Credit Trust Badge (`GOLD`, `SILVER`, `BRONZE`) |
| `Card` | shadcn/ui | Ledger list entries, inventory metric cards, judge economics summary |
| `Dialog` | shadcn/ui (`@radix-ui/react-dialog`) | Voice recording modal with backdrop lock, WhatsApp debt recovery dialog |
| `Progress` | shadcn/ui (`@radix-ui/react-progress`)| 4-second auto-commit countdown timer and stock level gauge |
| `Input` | shadcn/ui | Customer phone search, manual transaction override inputs |
| `Sonner` | shadcn/ui (`sonner`) | Zero-latency toast notifications ("Udhaar recorded", "Stock updated") |
| `NumberFlow`| `/pick-ui-library` (`@number-flow/react`)| Smooth sliding digit transitions for ledger balance and recovered capital |

---

## 5. Inter-Agent Handoff Packet (`wshobson-agents` Protocol)

```
================================================================================
                    INTER-AGENT HANDOFF PACKET (BEADS PROTOCOL)
================================================================================
1. SOURCE ROLE & DESTINATION ROLE:
   - Source Role: System Architect / Research Specialist
   - Destination Role: Implementation Developer (`wshobson-agents` ROLE: DEVELOPER)

2. ARTIFACTS PRODUCED:
   - Revised Research Report: Docs/research/KV-01-scaffold-research.md
   - Architecture configs: tailwind.config.ts, postcss.config.mjs, components.json,
     src/lib/utils.ts, globals.css with Bharat Modern HSL tokens.

3. VERIFIED INVARIANTS:
   - Tailwind CSS v3.4 verified as official target for maximum shadcn stability.
   - Radix UI primitives resolve focus trapping, accessibility, and dialog locks.
   - Zero-Crash Boot Guarantee preserved: no external secrets needed for build.
   - Sonner and NumberFlow added per /pick-ui-library recommendation.

4. ASSUMPTIONS & OPEN RISKS:
   - Ensure "tailwindcss-animate" is installed in devDependencies or dependencies.
   - Dialog and Progress components from @radix-ui must be client components.

5. ACCEPTANCE CRITERIA FOR NEXT ROLE:
   [ ] Scaffold package.json with Tailwind v3 + shadcn dependencies.
   [ ] Create tailwind.config.ts, postcss.config.mjs, components.json, src/lib/utils.ts.
   [ ] Create src/app/globals.css with Tailwind base/components/utilities and HSL vars.
   [ ] Author src/app/layout.tsx and src/app/page.tsx.
   [ ] Run npm install && npm run type-check && npm run build.
================================================================================
```
