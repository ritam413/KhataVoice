# Research: KV-09 PostgreSQL ACID Stored Procedure `execute_spoken_dual_sync` & Overdraft Alert

- **Author / Persona:** `wshobson-agents` (ROLE: DEVELOPER / Database Systems Specialist)
- **Ticket Reference:** [Docs/Tickets/KV-09-supabase-acid-stored-procedure.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/Docs/Tickets/KV-09-supabase-acid-stored-procedure.md)
- **Upstream Dependencies:** [KV-02-supabase-ddl-and-client.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/Docs/Tickets/KV-02-supabase-ddl-and-client.md)
- **Downstream Blockers:** [KV-11-dual-sync-api-route.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/Docs/Tickets/KV-11-dual-sync-api-route.md)
- **Primary Sources:**
  - Supabase Official Docs: [Database Functions](https://supabase.com/docs/guides/database/functions)
  - Supabase Client Docs: [Calling Postgres Functions via RPC](https://supabase.com/docs/reference/javascript/rpc)
  - PostgreSQL Official Docs: [CREATE FUNCTION](https://www.postgresql.org/docs/current/sql-createfunction.html), [Chapter 43. PL/pgSQL](https://www.postgresql.org/docs/current/plpgsql.html)
  - PostgreSQL Locking: [Explicit Locking & Advisory Locks](https://www.postgresql.org/docs/current/explicit-locking.html)

---

## 1. Architectural Role & Objective

The primary role of **KV-09** is to provide an atomic, zero-orphan, single-roundtrip database transaction for KhataVoice's core value proposition: **The Spoken Dual-Sync Mutation**.

In India's neighborhood Kirana stores, a single spoken utterance like *"Shyam Babu 2kg rice and 1L mustard oil on udhaar"* represents four distinct, tightly coupled business mutations:
1. **Append an immutable audit log** to `ledger_entries`.
2. **Update customer credit balance** in `customers`.
3. **Recalibrate customer credit trust score** (`credit_trust_score` and `trust_tier`).
4. **Decrement product stock** in `inventory_items` and log an auditable delta row in `stock_movements`.

Without a database-level ACID stored procedure, implementing this dual sync in serverless Node.js Route Handlers across multiple sequential HTTP queries introduces critical failure modes:
- **Partial Failure Anomaly:** A network timeout after updating customer credit but before inserting the ledger entry creates an uncollectable ghost balance dispute.
- **Double-Submit Clobbering:** Two concurrent voice taps from the shopkeeper clobber customer balance calculations due to lost update anomalies.
- **Network Roundtrip Latency:** Four separate PostgREST roundtrips take 400–800ms over 3G/4G connections. An in-database PL/pgSQL function runs in $<15\text{ms}$ in a single roundtrip.

---

## 2. Official Supabase & PostgreSQL Specifications

### 2.1 Function Declaration & Execution Context
According to Supabase official documentation:
- Functions exposed via PostgREST RPC must be defined in the `public` schema.
- To avoid privilege escalation or security search-path attacks, functions declared with `SECURITY DEFINER` must explicitly set the search path:
  ```sql
  CREATE OR REPLACE FUNCTION execute_spoken_dual_sync(...)
  RETURNS JSONB
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
  AS $$
  ...
  ```
- Functions execute within an atomic transaction. If any unhandled exception occurs (`RAISE EXCEPTION` or SQL constraint failure), PostgreSQL automatically rolls back all mutations performed by the function, ensuring true ACID atomicity.

### 2.2 Client-Side Invocation via `supabase-js` v2
The Supabase client invokes functions via the `.rpc()` method:
```typescript
const { data, error } = await supabase.rpc('execute_spoken_dual_sync', {
  p_merchant_id: '00000000-0000-0000-0000-000000000001',
  p_customer_name: 'Shyam Sundar Das',
  p_transaction_type: 'udhaar_sale',
  p_amount: 260.00,
  p_items: [
    { item_id: '...', name: 'Fortune Mustard Oil 1L', quantity: 1, unit: 'liter', unit_price: 130 }
  ],
  p_raw_transcript: 'Shyam Babu 1L mustard oil udhaar',
  p_language: 'bn'
});
```

### 2.3 Row-Level & Advisory Locking for Concurrency
To enforce **Adversarial Review Hardening** against double-submit balance clobbering:
1. **Advisory Transaction Lock on Customer Name:**
   ```sql
   PERFORM pg_advisory_xact_lock(hashtext(p_merchant_id::text || ':' || LOWER(TRIM(p_customer_name))));
   ```
   `pg_advisory_xact_lock` acquires an exclusive lock scoped to the current transaction. This prevents race conditions where two simultaneous requests try to get-or-create the same customer simultaneously.
2. **Row-Level Lock on Existing Customer:**
   ```sql
   SELECT id, current_balance, credit_trust_score, total_transactions_count, lifetime_credit_repaid
   INTO v_customer_id, v_current_balance, v_trust_score, v_tx_count, v_lifetime_repaid
   FROM customers
   WHERE merchant_id = p_merchant_id AND LOWER(TRIM(name)) = LOWER(TRIM(p_customer_name))
   FOR UPDATE;
   ```
   `FOR UPDATE` prevents concurrent balance overwrites by serializing transactions targeting the same customer row.

---

## 3. Schema Alignment & Corrections

A critical inspection of the database schema in [supabase/migrations/20261013000000_init_schema.sql](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/supabase/migrations/20261013000000_init_schema.sql) revealed discrepancies in the preliminary pseudocode in ticket KV-09 that must be corrected:

| Table | Ticket KV-09 Pseudocode | Actual DDL Schema (`init_schema.sql`) | Correction Required |
| :--- | :--- | :--- | :--- |
| `customers` | `phone` | `phone_number VARCHAR(15)` | Use `phone_number` |
| `customers` | `trust_score` | `credit_trust_score INTEGER` | Use `credit_trust_score` |
| `customers` | `trust_badge` | `trust_tier VARCHAR(16)` ('GOLD', 'SILVER', 'BRONZE') | Use `trust_tier` |
| `inventory_items` | `name` | `name_english VARCHAR(128)`, `name_vernacular VARCHAR(128)` | Match by both or fallback |
| `stock_movements` | (Omitted in KV-09 snippet) | Table exists with `item_id`, `ledger_entry_id`, `quantity_delta`, `movement_type`, `resulting_stock` | Must insert row into `stock_movements` |

---

## 4. State Invariants & Hardening Guards

### 4.1 Non-Blocking Negative Stock Override (Council Review Invariant)
In physical Kirana stores, goods are frequently sold before wholesale purchase invoices are entered into the computer. Crashing or rejecting an udhaar sale because digital stock is `0` or `1` would halt retail operations at the counter.
- **Rule:** If `current_stock - quantity < 0`, the transaction **MUST NOT** abort.
- **Action:** Decrement `current_stock` into negative numbers (e.g. `-1.00`), insert an auditable `stock_movements` record, and return an actionable warning string in `stock_warnings`:
  ```json
  "Warning: Fortune Mustard Oil 1L is now at -1.00 liter. Please restock."
  ```
- **Action:** If `current_stock <= low_stock_threshold`, return a low-stock advisory warning.

### 4.2 Dynamic Credit Trust Recalibration
Upon every udhaar sale or debt repayment:
- **Udhaar Sale:** Customer balance increases. If balance exceeds credit limits ($> ₹3,000$), trust score drops and tier demotes to `BRONZE`.
- **Payment Received:** Customer balance decreases by `p_amount`. Lifetime credit repaid increases. If balance settles to 0, trust score rises to $\ge 90$ (`GOLD`).
- **Cash Sale:** Cash sale has zero credit impact; balance remains unaffected, but total transactions count increments.
- **Restock:** Merchant inventory restock increases stock count (+ delta) and logs `restock_add` in `stock_movements`.

### 4.3 Zero-Crash Client Bridge (`src/lib/db/stored-proc-bridge.ts`)
The client bridge must adhere to the **Zero-Crash Boot Guarantee**:
- If Supabase environment variables are missing or invalid, or if the database is unreachable, `stored-proc-bridge.ts` must catch the exception, issue a structured warning, and delegate cleanly to `localStore.executeDualSync` without throwing unhandled rejections to the frontend.

---

## 5. Verification Strategy

1. **SQL Syntax & Invariant Check:**
   Verify migration script defines `execute_spoken_dual_sync`, uses `SECURITY DEFINER`, sets `search_path`, handles `stock_movements`, and supports `pg_advisory_xact_lock`.
2. **Bridge Module Typings & Dispatch:**
   Verify `src/lib/db/stored-proc-bridge.ts` exports `invokeExecuteSpokenDualSync` and typed RPC contracts.
3. **Automated Regression Suite (`scripts/verify-kv09.ts`):**
   - Assert PL/pgSQL function syntax and security settings.
   - Assert customer get-or-create and balance logic.
   - Assert inventory decrement and non-blocking negative warning generation.
   - Assert stock movements row insertion.
   - Assert zero-crash local fallback delegation.
4. **Build & Typecheck:**
   - `npm run type-check` (`tsc --noEmit`) -> 0 errors.
   - `npm run build` (`next build`) -> 0 errors.
