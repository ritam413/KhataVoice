-- ========================================================
-- KHATAVOICE: POSTGRESQL ACID STORED PROCEDURE
-- Migration: 20261013000001_stored_procedure_dual_sync.sql
-- Function: execute_spoken_dual_sync
-- ========================================================

CREATE OR REPLACE FUNCTION execute_spoken_dual_sync(
    p_merchant_id UUID,
    p_customer_name TEXT,
    p_transaction_type TEXT,
    p_amount NUMERIC,
    p_items JSONB DEFAULT '[]'::jsonb,
    p_raw_transcript TEXT DEFAULT '',
    p_language TEXT DEFAULT 'bn'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_customer_id UUID;
    v_current_balance NUMERIC(10,2) := 0.00;
    v_trust_score INTEGER := 75;
    v_trust_tier VARCHAR(16) := 'SILVER';
    v_tx_count INTEGER := 0;
    v_lifetime_repaid NUMERIC(12,2) := 0.00;
    v_new_balance NUMERIC(10,2) := 0.00;

    v_ledger_id UUID;
    v_clean_name TEXT;

    v_item RECORD;
    v_item_id UUID;
    v_current_stock NUMERIC(10,2);
    v_low_stock NUMERIC(10,2);
    v_item_name VARCHAR(128);
    v_item_unit VARCHAR(16);
    v_new_stock NUMERIC(10,2);
    v_delta NUMERIC(10,2);
    v_movement_type VARCHAR(32);

    v_stock_warnings JSONB := '[]'::jsonb;
    v_updated_items JSONB := '[]'::jsonb;
    v_warning_msg TEXT;
BEGIN
    -- 1. Input Validation Guards
    IF p_merchant_id IS NULL THEN
        RAISE EXCEPTION 'Merchant ID cannot be null';
    END IF;

    IF p_amount IS NULL OR p_amount < 0 THEN
        RAISE EXCEPTION 'Transaction amount must be non-negative';
    END IF;

    IF p_transaction_type NOT IN ('udhaar_sale', 'cash_sale', 'payment_received', 'restock') THEN
        RAISE EXCEPTION 'Invalid transaction type: %', p_transaction_type;
    END IF;

    v_clean_name := COALESCE(NULLIF(TRIM(p_customer_name), ''), 'Walk-in Customer');

    -- 2. Concurrency Control: Advisory Transaction Lock on Merchant + Customer Name
    -- Prevents concurrent double-submit race conditions creating duplicate customer rows
    PERFORM pg_advisory_xact_lock(hashtext(p_merchant_id::text || ':' || LOWER(v_clean_name)));

    -- 3. Resolve Customer with Row-Level Lock (FOR UPDATE)
    SELECT id, current_balance, credit_trust_score, trust_tier, total_transactions_count, lifetime_credit_repaid
    INTO v_customer_id, v_current_balance, v_trust_score, v_trust_tier, v_tx_count, v_lifetime_repaid
    FROM customers
    WHERE merchant_id = p_merchant_id AND LOWER(TRIM(name)) = LOWER(v_clean_name)
    LIMIT 1
    FOR UPDATE;

    -- If customer not found, create new customer entry
    IF v_customer_id IS NULL THEN
        INSERT INTO customers (
            merchant_id,
            name,
            phone_number,
            current_balance,
            credit_trust_score,
            trust_tier,
            credit_limit,
            total_transactions_count,
            lifetime_credit_repaid
        ) VALUES (
            p_merchant_id,
            v_clean_name,
            '+919830000000',
            0.00,
            75,
            'SILVER',
            5000.00,
            0,
            0.00
        ) RETURNING id, current_balance, credit_trust_score, trust_tier, total_transactions_count, lifetime_credit_repaid
        INTO v_customer_id, v_current_balance, v_trust_score, v_trust_tier, v_tx_count, v_lifetime_repaid;
    END IF;

    -- 4. Calculate Balance & Trust Score Recalibration
    IF p_transaction_type = 'udhaar_sale' THEN
        v_new_balance := v_current_balance + p_amount;
        
        -- Trust score degradation on rising debt
        IF v_new_balance > 3000.00 THEN
            v_trust_score := LEAST(v_trust_score, 45);
            v_trust_tier := 'BRONZE';
        ELSIF v_new_balance > 1500.00 THEN
            v_trust_score := LEAST(v_trust_score, 68);
            v_trust_tier := 'SILVER';
        ELSE
            v_trust_score := GREATEST(v_trust_score, 85);
            v_trust_tier := 'GOLD';
        END IF;

        UPDATE customers SET
            current_balance = v_new_balance,
            credit_trust_score = v_trust_score,
            trust_tier = v_trust_tier,
            total_transactions_count = total_transactions_count + 1,
            last_transaction_at = TIMEZONE('utc', NOW())
        WHERE id = v_customer_id;

    ELSIF p_transaction_type = 'payment_received' THEN
        v_new_balance := GREATEST(0.00, v_current_balance - p_amount);
        v_lifetime_repaid := v_lifetime_repaid + p_amount;

        -- Debt settled or reduced improves trust score
        IF v_new_balance = 0.00 THEN
            v_trust_score := GREATEST(v_trust_score, 90);
            v_trust_tier := 'GOLD';
        ELSE
            v_trust_score := LEAST(100, v_trust_score + 5);
            IF v_trust_score >= 85 THEN
                v_trust_tier := 'GOLD';
            ELSIF v_trust_score >= 65 THEN
                v_trust_tier := 'SILVER';
            ELSE
                v_trust_tier := 'BRONZE';
            END IF;
        END IF;

        UPDATE customers SET
            current_balance = v_new_balance,
            credit_trust_score = v_trust_score,
            trust_tier = v_trust_tier,
            lifetime_credit_repaid = v_lifetime_repaid,
            total_transactions_count = total_transactions_count + 1,
            last_payment_date = TIMEZONE('utc', NOW()),
            last_transaction_at = TIMEZONE('utc', NOW())
        WHERE id = v_customer_id;

    ELSIF p_transaction_type = 'cash_sale' THEN
        v_new_balance := v_current_balance;
        
        UPDATE customers SET
            total_transactions_count = total_transactions_count + 1,
            last_transaction_at = TIMEZONE('utc', NOW())
        WHERE id = v_customer_id;

    ELSIF p_transaction_type = 'restock' THEN
        v_new_balance := v_current_balance;
    END IF;

    -- 5. Append Immutable Ledger Entry
    INSERT INTO ledger_entries (
        merchant_id,
        customer_id,
        customer_name,
        amount,
        transaction_type,
        items_summary,
        raw_transcript,
        language
    ) VALUES (
        p_merchant_id,
        v_customer_id,
        v_clean_name,
        p_amount,
        p_transaction_type,
        COALESCE(p_items, '[]'::jsonb),
        p_raw_transcript,
        COALESCE(p_language, 'bn')
    ) RETURNING id INTO v_ledger_id;

    -- 6. Process Inventory Adjustments & Stock Movement Logs
    IF p_items IS NOT NULL AND jsonb_array_length(p_items) > 0 THEN
        FOR v_item IN
            SELECT
                (elem->>'item_id')::UUID AS item_id,
                elem->>'name' AS name,
                COALESCE((elem->>'quantity')::NUMERIC, 1.0) AS quantity,
                elem->>'unit' AS unit,
                COALESCE((elem->>'unit_price')::NUMERIC, 0.0) AS unit_price
            FROM jsonb_array_elements(p_items) AS elem
        LOOP
            v_item_id := NULL;

            -- Try matching by item_id first, then by name_english or name_vernacular
            IF v_item.item_id IS NOT NULL THEN
                SELECT id, current_stock, low_stock_threshold, name_english, unit
                INTO v_item_id, v_current_stock, v_low_stock, v_item_name, v_item_unit
                FROM inventory_items
                WHERE id = v_item.item_id AND merchant_id = p_merchant_id
                FOR UPDATE;
            END IF;

            IF v_item_id IS NULL AND v_item.name IS NOT NULL AND TRIM(v_item.name) <> '' THEN
                SELECT id, current_stock, low_stock_threshold, name_english, unit
                INTO v_item_id, v_current_stock, v_low_stock, v_item_name, v_item_unit
                FROM inventory_items
                WHERE merchant_id = p_merchant_id AND (
                    LOWER(TRIM(name_english)) = LOWER(TRIM(v_item.name)) OR
                    LOWER(TRIM(name_vernacular)) = LOWER(TRIM(v_item.name)) OR
                    name_english ILIKE '%' || TRIM(v_item.name) || '%'
                )
                ORDER BY (LOWER(TRIM(name_english)) = LOWER(TRIM(v_item.name))) DESC
                LIMIT 1
                FOR UPDATE;
            END IF;

            -- If item found in store catalog, adjust stock
            IF v_item_id IS NOT NULL THEN
                IF p_transaction_type = 'restock' THEN
                    v_delta := v_item.quantity;
                    v_movement_type := 'restock_add';
                ELSE
                    v_delta := -v_item.quantity;
                    v_movement_type := 'sale_deduct';
                END IF;

                -- Non-blocking negative stock calculation (Council Review Invariant)
                v_new_stock := v_current_stock + v_delta;

                UPDATE inventory_items SET
                    current_stock = v_new_stock
                WHERE id = v_item_id;

                INSERT INTO stock_movements (
                    item_id,
                    ledger_entry_id,
                    quantity_delta,
                    movement_type,
                    resulting_stock
                ) VALUES (
                    v_item_id,
                    v_ledger_id,
                    v_delta,
                    v_movement_type,
                    v_new_stock
                );

                -- Overdraft / Negative Stock Warning
                IF v_new_stock < 0 THEN
                    v_warning_msg := format('Warning: %s is now at %s %s. Please restock.', v_item_name, v_new_stock, v_item_unit);
                    v_stock_warnings := v_stock_warnings || to_jsonb(v_warning_msg);
                ELSIF v_new_stock <= v_low_stock THEN
                    v_warning_msg := format('Notice: %s is low on stock (%s %s remaining).', v_item_name, v_new_stock, v_item_unit);
                    v_stock_warnings := v_stock_warnings || to_jsonb(v_warning_msg);
                END IF;

                v_updated_items := v_updated_items || jsonb_build_object(
                    'id', v_item_id,
                    'name', v_item_name,
                    'unit', v_item_unit,
                    'current_stock', v_new_stock,
                    'low_stock_threshold', v_low_stock
                );
            END IF;
        END LOOP;
    END IF;

    -- 7. Return Structured Transaction Output
    RETURN jsonb_build_object(
        'success', true,
        'ledger_id', v_ledger_id,
        'customer_id', v_customer_id,
        'new_balance', v_new_balance,
        'trust_score', v_trust_score,
        'trust_tier', v_trust_tier,
        'stock_warnings', v_stock_warnings,
        'updated_inventory', v_updated_items
    );
END;
$$;

-- Grant execution privileges to authenticated and anonymous API consumers
GRANT EXECUTE ON FUNCTION execute_spoken_dual_sync(UUID, TEXT, TEXT, NUMERIC, JSONB, TEXT, TEXT) TO authenticated, anon;
