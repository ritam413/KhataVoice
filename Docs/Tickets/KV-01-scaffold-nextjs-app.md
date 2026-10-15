# KV-01: Scaffold Next.js 14/15 App Router Application & Directory Structure

- **Epic:** Epic 1: Foundation & Design System
- **Priority:** P0 (Blocker)
- **Story Points:** 3 SP
- **Upstream Dependencies:** None
- **Downstream Blockers:** KV-02, KV-03, KV-05, KV-07, KV-19, KV-20
- **Target Files:**
  - `package.json`
  - `tsconfig.json`
  - `next.config.mjs`
  - `tailwind.config.ts`
  - `postcss.config.mjs`
  - `components.json`
  - `src/lib/utils.ts`
  - `src/app/globals.css`
  - `src/app/layout.tsx`
  - `src/app/page.tsx`
  - `src/types/domain.ts`

---

## 1. Architectural Role & Objective
Scaffold the foundational Next.js 14/15 full-stack TypeScript project using the App Router. Establish a strict directory layout separating client presentation, server Route Handlers, audio processing, domain models, and database adapters. Set up Tailwind CSS v3 (v3.4), PostCSS, Autoprefixer, shadcn/ui foundation (`components.json`, `cn` utility), `@supabase/supabase-js`, `lucide-react`, and curated libraries from `/pick-ui-library` (`sonner`, `@number-flow/react`, `cmdk`).

---

## 2. Input Contract & Pre-Conditions
- Node.js runtime $\ge 18.17.0$.
- Zero mandatory external secrets required to boot the development server.
- Default ports configured: `3000` (Next.js), `11434` (Ollama local proxy default).

---

## 3. State Invariants & Hardening Guards
- **Zero-Crash Boot Guarantee:** The application must start cleanly in development mode (`npm run dev`) and production build (`npm run build`) even when environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BHASHINI_API_KEY`) are missing or empty.
- **Strict TypeScript Mode:** `tsconfig.json` must enforce `"strict": true`, `"noImplicitAny": true`, and path alias `"@/*": ["./src/*"]`.
- **Tailwind CSS v3 & shadcn/ui Foundation:** Configured with `tailwind.config.ts`, `postcss.config.mjs`, and `components.json`. Bharat Modern design tokens mapped into HSL CSS variables in `globals.css`.

---

## 4. Implementation Details

### 4.1 Directory Layout
```
src/
├── app/
│   ├── api/
│   │   ├── transcribe/
│   │   ├── parse-transaction/
│   │   ├── dual-sync/
│   │   ├── reminders/
│   │   ├── ledger/
│   │   └── inventory/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/               # Atomic primitives (Button, Card, Badge, Modal)
│   ├── audio/            # Waveform canvas, mic button, presets
│   ├── views/            # Screen views (Home, Ledger, Inventory, WhatsApp, Desktop, Judge)
│   └── layout/           # Simulator chassis, header, navigation
├── lib/
│   ├── db/               # Supabase client & in-memory local fallback
│   ├── speech/           # Tri-tier speech adapter (Web Speech, Bhashini proxy)
│   ├── nlp/              # Hybrid Ollama/Gemini + deterministic regex parser
│   ├── trust/            # Kirana credit trust score engine
│   └── whatsapp/         # Cultural reminder URL generator & UPI encoder
├── styles/               # Design tokens & CSS modules
└── types/                # Domain models, API schemas, and contracts
```

### 4.2 Core Domain Models (`src/types/domain.ts`)
```typescript
export type Language = 'bn' | 'hi' | 'en';
export type TransactionType = 'udhaar_sale' | 'cash_sale' | 'restock' | 'payment_received';
export type TrustBadgeTier = 'GOLD' | 'SILVER' | 'BRONZE';
export type WhatsAppTone = 'polite' | 'friendly' | 'firm';

export interface Customer {
  id: string;
  merchant_id: string;
  name: string;
  phone: string;
  current_balance: number; // positive = owes money (udhaar)
  trust_score: number;     // 0 to 100
  trust_badge: TrustBadgeTier;
  credit_limit: number;
  total_transactions_count: number;
  last_transaction_at: string;
}

export interface InventoryItem {
  id: string;
  merchant_id: string;
  name: string;
  unit: 'kg' | 'packet' | 'liter' | 'piece' | 'tin';
  current_stock: number;
  unit_price: number;
  cost_price: number;
  low_stock_threshold: number;
}

export interface LedgerEntry {
  id: string;
  merchant_id: string;
  customer_id?: string;
  customer_name?: string;
  transaction_type: TransactionType;
  amount: number;
  items_summary: Array<{ item_id?: string; name: string; quantity: number; unit: string; price: number }>;
  raw_transcript?: string;
  language: Language;
  created_at: string;
}
```

---

## 5. Behavior-Driven Specification (Given / When / Then)

### Scenario 1: Clean Application Initialization
- **Given:** A fresh clone of the repository without any `.env.local` file.
- **When:** Developer executes `npm run build` and `npm run start`.
- **Then:** The Next.js application compiles with zero TypeScript errors and boots on `http://localhost:3000`.

### Scenario 2: Path Alias Resolution
- **Given:** A component imports domain interfaces from `@/types/domain`.
- **When:** Next.js compiles the route handler or client page.
- **Then:** Module resolution resolves correctly to `src/types/domain.ts` without runtime or bundling errors.

---

## 6. Automated Verification Gates
```bash
# 1. Typecheck verification
npm run type-check # npx tsc --noEmit

# 2. Production build verification
npm run build
```
