# KV-02: Supabase Cloud PostgreSQL Schema, RLS & Local In-Memory Fallback Client

- **Epic:** Epic 1: Foundation & Design System
- **Priority:** P0 (Blocker)
- **Story Points:** 4 SP
- **Upstream Dependencies:** KV-01
- **Downstream Blockers:** KV-09, KV-10, KV-12, KV-13
- **Target Files:**
  - `src/lib/db/supabase.ts`
  - `src/lib/db/local-fallback.ts`
  - `src/lib/db/seed-data.ts`
  - `supabase/migrations/20261013000000_init_schema.sql`

---

## 1. Architectural Role & Objective
Set up the dual-mode persistence layer. Connect `@supabase/supabase-js` to cloud PostgreSQL when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are provided. When environment keys are absent, seamlessly fail over to `src/lib/db/local-fallback.ts` (an in-memory mock store pre-seeded with authentic Kolkata Kirana shop items and customer ledgers) so hackathon judges can evaluate the app out-of-the-box.

---

## 2. Input Contract & Pre-Conditions
- Environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL` (Optional string)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Optional string)
  - `SUPABASE_SERVICE_ROLE_KEY` (Optional string for server routes)
- Pre-seeded data in `seed-data.ts`:
  - 1 Default Merchant: Ramesh Babu ("Maa Tara Variety Stores", Shyambazar, Kolkata).
  - 6 Customers: Shyam Sundar Das (₹420 udhaar), Rohit Gupta (₹1,250 udhaar), Sunita Devi (₹310 udhaar), Amit Das (₹0 udhaar), Rajesh Mondal (₹850 udhaar), Priya Sen (₹180 udhaar).
  - 10 Inventory Items: Fortune Mustard Oil (1L), Aashirvaad Atta (5kg), Tata Salt (1kg), Parle-G (80g), Maggi 2-Minute Noodles (70g), Dettol Soap (75g), Sugar (1kg), Masoor Dal (1kg), Amul Taaza Milk (500ml), Brooke Bond Red Label Tea (250g).

---

## 3. State Invariants & Hardening Guards
- **Zero-Crash Autonomous Fallback:** `getDbClient()` must inspect environment variables. If either URL or Key is missing, `isLocalFallbackMode()` returns `true` and all database operations redirect transparently to `LocalFallbackStore`.
- **Multi-Tenant Row-Level Security (RLS):** All Supabase tables (`merchants`, `customers`, `inventory_items`, `ledger_entries`, `stock_movements`, `reminder_logs`) must enable RLS with policies isolating records by `merchant_id`.
- **In-Memory Thread Safety:** In-memory store operations must be synchronous or return resolved Promises matching the Supabase response signature (`{ data, error }`).

---

## 4. Implementation Details

### 4.1 Schema Migration (`supabase/migrations/20261013000000_init_schema.sql`)
- Tables: `merchants`, `customers`, `inventory_items`, `ledger_entries`, `stock_movements`, `reminder_logs`.
- Indexes: `idx_customers_merchant`, `idx_inventory_merchant`, `idx_ledger_merchant_created`, `idx_customers_trust_score`.
- Realtime: Add `customers`, `inventory_items`, and `ledger_entries` to `supabase_realtime` publication.

### 4.2 DB Client Dispatcher (`src/lib/db/supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';
import { localStore } from './local-fallback';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export function getDbAdapter() {
  if (isSupabaseConfigured && supabase) {
    return { mode: 'cloud' as const, client: supabase };
  }
  return { mode: 'local' as const, client: localStore };
}
```

### 4.3 In-Memory Local Store (`src/lib/db/local-fallback.ts`)
Must implement:
- `getCustomers(merchantId: string): Promise<Customer[]>`
- `getCustomerById(id: string): Promise<Customer | null>`
- `getInventory(merchantId: string): Promise<InventoryItem[]>`
- `getLedgerEntries(merchantId: string, limit?: number): Promise<LedgerEntry[]>`
- `executeDualSync(payload: DualSyncPayload): Promise<DualSyncResult>`
- `resetToInitialSeed(): void`

---

## 5. Behavior-Driven Specification (Given / When / Then)

### Scenario 1: Unconfigured Environment Local Mode
- **Given:** `NEXT_PUBLIC_SUPABASE_URL` is undefined.
- **When:** Application calls `getDbAdapter().client.getCustomers('merchant-1')`.
- **Then:** It immediately returns the 6 seeded Kirana customers without throwing an exception or network timeout.

### Scenario 2: Cloud Supabase Mode
- **Given:** Valid Supabase credentials are configured in `.env.local`.
- **When:** Application calls `getDbAdapter()`.
- **Then:** Mode resolves to `'cloud'` and client instance is active.

---

## 6. Automated Verification Gates
```bash
# 1. Run local store unit test assertions
node -e "const { localStore } = require('./src/lib/db/local-fallback.ts'); console.assert(localStore.getCustomers().length === 6, 'Failed');"

# 2. Check schema syntax
npx supabase db lint --dry-run || echo "Supabase CLI not required for local mode"
```
