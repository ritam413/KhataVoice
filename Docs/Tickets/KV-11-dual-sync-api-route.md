# KV-11: Route Handler `POST /api/dual-sync` with Concurrency Mutex Lock

- **Epic:** Epic 3: Atomic Dual-Sync & Business Logic
- **Priority:** P0 (Blocker)
- **Story Points:** 4 SP
- **Upstream Dependencies:** KV-09, KV-10
- **Downstream Blockers:** KV-15, KV-16
- **Target Files:**
  - `src/app/api/dual-sync/route.ts`
  - `src/lib/sync/mutex-lock.ts`
  - `src/types/api.ts`

---

## 1. Architectural Role & Objective
Implement the core transactional API route `POST /api/dual-sync`. Accepts parsed voice transaction payloads, validates constraints, acquires an in-flight concurrency lock, and executes the atomic dual-sync operation via either the Supabase stored procedure or the local in-memory fallback store. Returns updated balances, inventory states, trust scores, and stock warnings.

---

## 2. Input Contract & Pre-Conditions
- Request Body:
```typescript
export interface DualSyncRequest {
  merchant_id: string;
  customer_name: string;
  transaction_type: 'udhaar_sale' | 'cash_sale' | 'restock' | 'payment_received';
  amount: number;
  items: Array<{
    item_id?: string;
    name: string;
    quantity: number;
    unit: string;
    price: number;
  }>;
  raw_transcript?: string;
  language?: 'bn' | 'hi' | 'en';
  idempotency_key?: string;
}
```

---

## 3. State Invariants & Hardening Guards
- **Adversarial Review Hardening (Concurrency Mutex & Idempotency):**
  - Multiple rapid button taps or spoken entries during the 4-second auto-commit window must NOT cause duplicate debit/credit operations.
  - The route enforces an `idempotency_key` cache (in-memory `Map` or Redis/DB). If a duplicate request arrives with the same key within $10\text{seconds}$, return the previously committed result without executing the stored procedure again.
- **Fail-Safe Persistence Dispatch:** If Supabase is unreachable or unconfigured, execute the transaction inside `localStore.executeDualSync()` and return HTTP 200 with header `x-storage-mode: local-fallback`.

---

## 4. Implementation Details

### 4.1 Route Logic (`src/app/api/dual-sync/route.ts`)
```typescript
export async function POST(req: NextRequest) {
  try {
    const body: DualSyncRequest = await req.json();

    // 1. Validation
    if (!body.customer_name || body.amount < 0) {
      return NextResponse.json({ error: 'Invalid transaction parameters' }, { status: 400 });
    }

    // 2. Check Idempotency Lock
    const idempotencyKey = body.idempotency_key || `${body.merchant_id}-${body.customer_name}-${body.amount}-${Date.now()}`;
    if (isDuplicateTransaction(idempotencyKey)) {
      return NextResponse.json({ error: 'Duplicate transaction in progress' }, { status: 409 });
    }
    lockTransaction(idempotencyKey);

    // 3. Dispatch to Supabase RPC or Local Fallback
    const adapter = getDbAdapter();
    let result;
    if (adapter.mode === 'cloud') {
      const { data, error } = await adapter.client.rpc('execute_spoken_dual_sync', {
        p_merchant_id: body.merchant_id,
        p_customer_name: body.customer_name,
        p_transaction_type: body.transaction_type,
        p_amount: body.amount,
        p_items: body.items,
        p_raw_transcript: body.raw_transcript,
        p_language: body.language || 'bn'
      });
      if (error) throw error;
      result = data;
    } else {
      result = await adapter.client.executeDualSync(body);
    }

    unlockTransaction(idempotencyKey);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Dual sync failed' }, { status: 500 });
  }
}
```

---

## 5. Behavior-Driven Specification (Given / When / Then)

### Scenario 1: Successful Atomic Dual-Sync
- **Given:** Shyam Babu purchases ₹260 udhaar (1 bottle oil, 2kg rice).
- **When:** `POST /api/dual-sync` is invoked.
- **Then:** Customer balance increments by ₹260, inventory counts for oil and rice decrement, and response returns HTTP 200 with `new_balance`.

### Scenario 2: Double-Submit Prevention
- **Given:** Client fires two identical requests with the same idempotency key $50\text{ms}$ apart.
- **When:** Route receives the second request.
- **Then:** The second request is rejected or returned cached state without re-incrementing the balance.

---

## 6. Automated Verification Gates
```bash
# Typecheck route handler
npx tsc --noEmit src/app/api/dual-sync/route.ts
```
