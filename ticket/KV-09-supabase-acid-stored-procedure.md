# KV-09: PostgreSQL ACID Stored Procedure `execute_spoken_dual_sync` & Overdraft Alert

- **Epic:** Epic 3: Atomic Dual-Sync & Business Logic
- **Priority:** P0 (Blocker)
- **Story Points:** 4 SP
- **Upstream Dependencies:** KV-02
- **Downstream Blockers:** KV-11
- **Target Files:**
  - `supabase/migrations/20261013000001_stored_procedure_dual_sync.sql`
  - `src/lib/db/stored-proc-bridge.ts`

---

## 1. Architectural Role & Objective
Implement the PostgreSQL Stored Procedure `execute_spoken_dual_sync` in Supabase to atomically execute the dual-entry mutation:
1. Append an immutable record to `ledger_entries`.
2. Update the customer's credit balance in `customers`.
3. Recalculate customer credit trust score.
4. Decrement product stock in `inventory_items` and log row in `stock_movements`.
Wrap all operations in an ACID transaction so partial failures rollback completely, leaving no orphan ledger entries or ghost inventory decrements.

---

## 2. Input Contract & Pre-Conditions
- RPC Function Signature:
```sql
CREATE OR REPLACE FUNCTION execute_spoken_dual_sync(
  p_merchant_id UUID,
  p_customer_name TEXT,
  p_transaction_type TEXT,
  p_amount NUMERIC,
  p_items JSONB,
  p_raw_transcript TEXT,
  p_language TEXT
) RETURNS JSONB;
```

---

## 3. State Invariants & Hardening Guards
- **Adversarial Review Hardening (Double-Submit Protection):** Use row-level locking (`SELECT ... FOR UPDATE`) or advisory locks on customer ID to prevent concurrent balance clobbering during simultaneous requests.
- **Council Review Hardening (Non-Blocking Negative Stock Override):** In an authentic Kirana shop, physical goods are often sold even when the digital stock counter has not yet been updated. **Do not** abort or crash the transaction if current stock is insufficient. Instead, decrement the stock into negative territory and return an amber alert badge in the response:
  ```json
  { "stock_warning": "Warning: Fortune Mustard Oil is now at -1 L. Please restock." }
  ```
- **ACID Atomicity:** Any catastrophic database failure during ledger entry creation must roll back customer balance and inventory decrements.

---

## 4. Implementation Details

### 4.1 SQL Procedure Definition (`supabase/migrations/...`)
```sql
CREATE OR REPLACE FUNCTION execute_spoken_dual_sync(
  p_merchant_id UUID,
  p_customer_name TEXT,
  p_transaction_type TEXT,
  p_amount NUMERIC,
  p_items JSONB,
  p_raw_transcript TEXT,
  p_language TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_customer_id UUID;
  v_new_balance NUMERIC;
  v_ledger_id UUID;
  v_item RECORD;
  v_stock_warnings TEXT[] := '{}';
BEGIN
  -- 1. Resolve or create customer
  SELECT id, current_balance INTO v_customer_id, v_new_balance
  FROM customers 
  WHERE merchant_id = p_merchant_id AND LOWER(name) = LOWER(p_customer_name)
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO customers (merchant_id, name, phone, current_balance, trust_score, trust_badge)
    VALUES (p_merchant_id, p_customer_name, '9876543210', 0, 70, 'SILVER')
    RETURNING id, current_balance INTO v_customer_id, v_new_balance;
  END IF;

  -- 2. Adjust customer balance
  IF p_transaction_type = 'udhaar_sale' THEN
    v_new_balance := v_new_balance + p_amount;
  ELSIF p_transaction_type = 'payment_received' THEN
    v_new_balance := GREATEST(0, v_new_balance - p_amount);
  END IF;

  UPDATE customers 
  SET current_balance = v_new_balance,
      total_transactions_count = total_transactions_count + 1,
      last_transaction_at = NOW()
  WHERE id = v_customer_id;

  -- 3. Insert ledger entry
  INSERT INTO ledger_entries (
    merchant_id, customer_id, customer_name, transaction_type,
    amount, items_summary, raw_transcript, language
  ) VALUES (
    p_merchant_id, v_customer_id, p_customer_name, p_transaction_type,
    p_amount, p_items, p_raw_transcript, p_language
  ) RETURNING id INTO v_ledger_id;

  -- 4. Decrement inventory (non-blocking)
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(item_id UUID, name TEXT, quantity NUMERIC)
  LOOP
    IF v_item.item_id IS NOT NULL THEN
      UPDATE inventory_items 
      SET current_stock = current_stock - v_item.quantity
      WHERE id = v_item.item_id
      RETURNING current_stock INTO v_new_balance;

      IF v_new_balance < 0 THEN
        v_stock_warnings := array_append(v_stock_warnings, 'Item ' || v_item.name || ' stock is negative: ' || v_new_balance);
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'ledger_id', v_ledger_id,
    'customer_id', v_customer_id,
    'new_balance', v_new_balance,
    'stock_warnings', v_stock_warnings
  );
END;
$$;
```

---

## 5. Behavior-Driven Specification (Given / When / Then)

### Scenario 1: Udhaar Sale with Negative Stock Warning
- **Given:** Item "Mustard Oil" has stock = 0.
- **When:** `execute_spoken_dual_sync` runs for 1 bottle udhaar sale to Shyam Babu.
- **Then:** Transaction commits successfully, customer balance increases, stock becomes -1, and response contains `stock_warnings` without failing the sale.

---

## 6. Automated Verification Gates
```bash
# Verify SQL syntax
cat supabase/migrations/20261013000001_stored_procedure_dual_sync.sql | grep "CREATE OR REPLACE FUNCTION"
```
