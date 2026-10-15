# KV-13: Route Handlers `GET /api/ledger`, `GET /api/inventory`, & `GET /api/customers`

- **Epic:** Epic 3: Atomic Dual-Sync & Business Logic
- **Priority:** P1
- **Story Points:** 3 SP
- **Upstream Dependencies:** KV-02
- **Downstream Blockers:** KV-16
- **Target Files:**
  - `src/app/api/ledger/route.ts`
  - `src/app/api/inventory/route.ts`
  - `src/app/api/customers/route.ts`

---

## 1. Architectural Role & Objective
Implement the server read route handlers for querying merchant ledgers, inventory catalog with stock levels, and customer credit profiles. Supports search filtering, sorting, pagination, and multi-tenant scoping. Works seamlessly across both Supabase cloud PostgreSQL and the local fallback store.

---

## 2. Input Contract & Pre-Conditions
- `GET /api/ledger?merchantId=...&limit=20&offset=0&search=...`
- `GET /api/inventory?merchantId=...&lowStockOnly=false`
- `GET /api/customers?merchantId=...&filter=all|overdue`

---

## 3. State Invariants & Hardening Guards
- **Data Isolation:** All queries must require or default to the merchant identifier (`merchant_id`). Unfiltered cross-merchant data leaks are strictly prohibited.
- **Local Fallback Transparency:** If Supabase client fails, route handlers automatically delegate to `localStore` methods and return valid JSON structures without throwing unhandled exceptions.

---

## 4. Implementation Details

### 4.1 Route `GET /api/ledger/route.ts`
- Retrieves recent ledger entries ordered by `created_at DESC`.
- Computes aggregate metrics: total udhaar outstanding, total sales today, cash collections.

### 4.2 Route `GET /api/inventory/route.ts`
- Returns all items with `current_stock`, `low_stock_threshold`, and `unit_price`.
- Flags items where `current_stock <= low_stock_threshold` as `is_low_stock: true`.

### 4.3 Route `GET /api/customers/route.ts`
- Returns customer list with calculated Trust Badge tier (`GOLD`, `SILVER`, `BRONZE`).
- Includes outstanding balance and days overdue.

---

## 5. Behavior-Driven Specification (Given / When / Then)

### Scenario 1: Fetching Low-Stock Inventory
- **Given:** Mustard oil has stock = 0, threshold = 2.
- **When:** Client queries `GET /api/inventory?lowStockOnly=true`.
- **Then:** Result includes Mustard Oil with `is_low_stock = true`.

---

## 6. Automated Verification Gates
```bash
# Typecheck route handlers
npx tsc --noEmit src/app/api/ledger/route.ts src/app/api/inventory/route.ts src/app/api/customers/route.ts
```
