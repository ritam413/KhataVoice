# KhataVoice: Supabase (PostgreSQL) Database Schema Specification

This document provides the production-grade **Supabase (PostgreSQL)** database schema, Entity-Relationship Diagram (ERD), Table definitions, Row-Level Security (RLS) policies, PostgreSQL Stored Procedures (RPCs) for atomic dual-sync execution, and seed data for **KhataVoice**.

---

## 1. Entity-Relationship Diagram (ERD)

```
       +---------------------------------------------+
       |               merchants (Stores)            |
       +---------------------------------------------+
       | PK id: UUID (DEFAULT gen_random_uuid())    |
       |    business_name: VARCHAR(128)              |
       |    owner_name: VARCHAR(128)                 |
       |    phone_number: VARCHAR(15) UNIQUE         |
       |    upi_id: VARCHAR(64)                      |
       |    preferred_language: VARCHAR(10)          |
       |    created_at: TIMESTAMPTZ                  |
       +----------------------+----------------------+
                              | 1
                              |
                              +──────────────────────────────────────┐
                              | N                                    | N
       +----------------------+----------------------+ +-------------+-------------------------------+
       |             customers (Debtors)             | |             inventory_items (Stock)         |
       +---------------------------------------------+ +---------------------------------------------+
       | PK id: UUID (DEFAULT gen_random_uuid())    | | PK id: UUID (DEFAULT gen_random_uuid())    |
       | FK merchant_id: UUID REFERENCES merchants   | | FK merchant_id: UUID REFERENCES merchants   |
       |    name: VARCHAR(128)                       | |    sku: VARCHAR(32)                         |
       |    phone_number: VARCHAR(15)                | |    name_english: VARCHAR(128)               |
       |    current_balance: NUMERIC(10,2)           | |    name_vernacular: VARCHAR(128)            |
       |    credit_trust_score: INT (0 to 100)       | |    category: VARCHAR(64)                    |
       |    trust_tier: VARCHAR(16)                  | |    current_stock: NUMERIC(10,2)             |
       |    last_payment_date: TIMESTAMPTZ           | |    unit: VARCHAR(16)                        |
       |    lifetime_credit_repaid: NUMERIC(12,2)    | |    reorder_threshold: NUMERIC(10,2)         |
       |    created_at: TIMESTAMPTZ                  | |    cost_price: NUMERIC(10,2)                |
       +----------------------+----------------------+ |    selling_price: NUMERIC(10,2)             |
                              | 1                      |    created_at: TIMESTAMPTZ                  |
                              |                        +---------------------+-----------------------+
                              | N                                            | 1
       +----------------------+----------------------+                       |
       |            ledger_entries (Ledger)          |                       | N
       +---------------------------------------------+         +-------------+-----------------------+
       | PK id: UUID (DEFAULT gen_random_uuid())    |         |            stock_movements            |
       | FK merchant_id: UUID REFERENCES merchants   |         +-------------------------------------+
       | FK customer_id: UUID REFERENCES customers   |         | PK id: UUID (DEFAULT gen_random_uuid())
       |    amount: NUMERIC(10,2)                    |         | FK item_id: UUID REFERENCES items   |
       |    type: VARCHAR(32)                        |         | FK ledger_entry_id: UUID REF ledger |
       |    items_json: JSONB                        |         |    quantity_delta: NUMERIC(10,2)    |
       |    raw_audio_transcript: TEXT               |         |    movement_type: VARCHAR(32)       |
       |    created_at: TIMESTAMPTZ                  |         |    resulting_stock: NUMERIC(10,2)   |
       +----------------------+----------------------+         |    created_at: TIMESTAMPTZ          |
                              | 1                              +-------------------------------------+
                              | N
       +----------------------+----------------------+
       |                reminder_logs                |
       +---------------------------------------------+
       | PK id: UUID (DEFAULT gen_random_uuid())    |
       | FK customer_id: UUID REFERENCES customers   |
       |    amount_due: NUMERIC(10,2)                |
       |    tone: VARCHAR(32)                        |
       |    language: VARCHAR(8)                     |
       |    message_payload: TEXT                    |
       |    dispatched_at: TIMESTAMPTZ               |
       +---------------------------------------------+
```

---

## 2. Supabase SQL Migration Script (Ready for SQL Editor)

You can copy and run this complete migration script directly inside the **Supabase Dashboard $\to$ SQL Editor**:

```sql
-- ========================================================
-- KHATAVOICE: SUPABASE POSTGRESQL SCHEMA INITIALIZATION
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. MERCHANTS TABLE
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(128) NOT NULL,
    owner_name VARCHAR(128) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    upi_id VARCHAR(64) NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'bn',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    current_balance NUMERIC(10,2) DEFAULT 0.00,
    credit_trust_score INTEGER DEFAULT 75 CHECK (credit_trust_score BETWEEN 0 AND 100),
    trust_tier VARCHAR(16) DEFAULT 'SILVER' CHECK (trust_tier IN ('GOLD', 'SILVER', 'BRONZE')),
    last_payment_date TIMESTAMPTZ,
    lifetime_credit_repaid NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. INVENTORY ITEMS TABLE
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    sku VARCHAR(32) NOT NULL,
    name_english VARCHAR(128) NOT NULL,
    name_vernacular VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    current_stock NUMERIC(10,2) DEFAULT 0.00,
    unit VARCHAR(16) DEFAULT 'unit',
    reorder_threshold NUMERIC(10,2) DEFAULT 5.00,
    cost_price NUMERIC(10,2) NOT NULL,
    selling_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. LEDGER ENTRIES TABLE
CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    type VARCHAR(32) NOT NULL CHECK (type IN ('UDHAAR_SALE', 'CASH_SALE', 'PAYMENT_RECEIVED', 'RESTOCK_PURCHASE')),
    items_json JSONB DEFAULT '[]'::jsonb,
    raw_audio_transcript TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. STOCK MOVEMENTS TABLE
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    ledger_entry_id UUID REFERENCES ledger_entries(id) ON DELETE SET NULL,
    quantity_delta NUMERIC(10,2) NOT NULL,
    movement_type VARCHAR(32) NOT NULL CHECK (movement_type IN ('SALE_DEDUCT', 'RESTOCK_ADD', 'MANUAL_ADJUSTMENT')),
    resulting_stock NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 6. REMINDER LOGS TABLE
CREATE TABLE IF NOT EXISTS reminder_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    amount_due NUMERIC(10,2) NOT NULL,
    tone VARCHAR(32) NOT NULL CHECK (tone IN ('POLITE_GENTLE', 'FRIENDLY_FOLLOWUP', 'FIRM_OVERDUE')),
    language VARCHAR(8) NOT NULL,
    message_payload TEXT NOT NULL,
    dispatched_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ========================================================
-- INDEXES FOR HIGH-VELOCITY QUERY PERFORMANCE
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_customers_merchant ON customers(merchant_id);
CREATE INDEX IF NOT EXISTS idx_customers_trust ON customers(credit_trust_score DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_merchant ON inventory_items(merchant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock ON inventory_items(current_stock ASC);
CREATE INDEX IF NOT EXISTS idx_ledger_merchant_created ON ledger_entries(merchant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_customer ON ledger_entries(customer_id);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for hackathon demo mode (can be scoped to auth.uid() in production)
CREATE POLICY "Public Demo Access for Merchants" ON merchants FOR ALL USING (true);
CREATE POLICY "Public Demo Access for Customers" ON customers FOR ALL USING (true);
CREATE POLICY "Public Demo Access for Inventory" ON inventory_items FOR ALL USING (true);
CREATE POLICY "Public Demo Access for Ledger" ON ledger_entries FOR ALL USING (true);
CREATE POLICY "Public Demo Access for Movements" ON stock_movements FOR ALL USING (true);
CREATE POLICY "Public Demo Access for Reminders" ON reminder_logs FOR ALL USING (true);

-- Enable Supabase Realtime on critical operational tables
ALTER PUBLICATION supabase_realtime ADD TABLE ledger_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_items;
```

---

## 3. Supabase Stored Procedure (RPC): Atomic Dual-Sync Execution

To guarantee that spoken entries update both ledger and inventory **inside a single atomic PostgreSQL transaction** on Supabase:

```sql
CREATE OR REPLACE FUNCTION execute_spoken_dual_sync(
    p_merchant_id UUID,
    p_customer_name VARCHAR,
    p_amount NUMERIC,
    p_type VARCHAR,
    p_items JSONB,
    p_transcript TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_customer_id UUID;
    v_entry_id UUID;
    v_item RECORD;
    v_item_id UUID;
    v_new_stock NUMERIC;
    v_trust_score INTEGER;
    v_tier VARCHAR;
BEGIN
    -- 1. Find or create Customer
    SELECT id INTO v_customer_id 
    FROM customers 
    WHERE merchant_id = p_merchant_id AND LOWER(name) = LOWER(p_customer_name)
    LIMIT 1;

    IF v_customer_id IS NULL THEN
        INSERT INTO customers (merchant_id, name, phone_number, current_balance, credit_trust_score, trust_tier)
        VALUES (p_merchant_id, p_customer_name, '9830000000', 0.00, 75, 'SILVER')
        RETURNING id INTO v_customer_id;
    END IF;

    -- 2. Create Ledger Entry
    INSERT INTO ledger_entries (merchant_id, customer_id, amount, type, items_json, raw_audio_transcript)
    VALUES (p_merchant_id, v_customer_id, p_amount, p_type, p_items, p_transcript)
    RETURNING id INTO v_entry_id;

    -- 3. Adjust Customer Credit Balance
    IF p_type = 'UDHAAR_SALE' THEN
        UPDATE customers 
        SET current_balance = current_balance + p_amount 
        WHERE id = v_customer_id;
    ELSIF p_type = 'PAYMENT_RECEIVED' THEN
        UPDATE customers 
        SET current_balance = GREATEST(0.00, current_balance - p_amount),
            lifetime_credit_repaid = lifetime_credit_repaid + p_amount,
            last_payment_date = NOW()
        WHERE id = v_customer_id;
    END IF;

    -- 4. Recompute Customer Credit Trust Score
    SELECT 
        CASE 
            WHEN current_balance > 3000 THEN 45
            WHEN current_balance > 1500 THEN 68
            ELSE 88
        END INTO v_trust_score
    FROM customers WHERE id = v_customer_id;

    SELECT 
        CASE 
            WHEN v_trust_score >= 85 THEN 'GOLD'
            WHEN v_trust_score >= 65 THEN 'SILVER'
            ELSE 'BRONZE'
        END INTO v_tier;

    UPDATE customers 
    SET credit_trust_score = v_trust_score, trust_tier = v_tier 
    WHERE id = v_customer_id;

    -- 5. Decrement or Increment Inventory Items
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(item_name TEXT, quantity NUMERIC)
    LOOP
        SELECT id, current_stock INTO v_item_id, v_new_stock
        FROM inventory_items
        WHERE merchant_id = p_merchant_id AND (
            LOWER(name_english) LIKE LOWER('%' || v_item.item_name || '%') OR 
            LOWER(name_vernacular) LIKE LOWER('%' || v_item.item_name || '%')
        )
        LIMIT 1;

        IF v_item_id IS NOT NULL THEN
            IF p_type IN ('UDHAAR_SALE', 'CASH_SALE') THEN
                v_new_stock := v_new_stock - v_item.quantity;
                UPDATE inventory_items SET current_stock = v_new_stock WHERE id = v_item_id;

                INSERT INTO stock_movements (item_id, ledger_entry_id, quantity_delta, movement_type, resulting_stock)
                VALUES (v_item_id, v_entry_id, -v_item.quantity, 'SALE_DEDUCT', v_new_stock);
            ELSIF p_type = 'RESTOCK_PURCHASE' THEN
                v_new_stock := v_new_stock + v_item.quantity;
                UPDATE inventory_items SET current_stock = v_new_stock WHERE id = v_item_id;

                INSERT INTO stock_movements (item_id, ledger_entry_id, quantity_delta, movement_type, resulting_stock)
                VALUES (v_item_id, v_entry_id, v_item.quantity, 'RESTOCK_ADD', v_new_stock);
            END IF;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'entry_id', v_entry_id,
        'customer_id', v_customer_id,
        'new_trust_score', v_trust_score,
        'trust_tier', v_tier
    );
END;
$$;
```

---

## 4. Authentic Kirana Seed Data

```sql
-- Seed Merchant
INSERT INTO merchants (id, business_name, owner_name, phone_number, upi_id, preferred_language)
VALUES ('00000000-0000-0000-0000-000000000001', 'Maa Tara General Store', 'Ramesh Babu', '9830099887', 'maatarastore@okaxis', 'bn')
ON CONFLICT DO NOTHING;

-- Seed Customers
INSERT INTO customers (merchant_id, name, phone_number, current_balance, credit_trust_score, trust_tier) VALUES
('00000000-0000-0000-0000-000000000001', 'Sunita Devi', '9830012345', 1850.00, 88, 'GOLD'),
('00000000-0000-0000-0000-000000000001', 'Shyam Kaku', '9831154321', 1420.00, 86, 'GOLD'),
('00000000-0000-0000-0000-000000000001', 'Biren Da', '9830076543', 850.00, 72, 'SILVER'),
('00000000-0000-0000-0000-000000000001', 'Amit Das', '9832298765', 2150.00, 48, 'BRONZE')
ON CONFLICT DO NOTHING;

-- Seed Inventory SKUs
INSERT INTO inventory_items (merchant_id, sku, name_english, name_vernacular, category, current_stock, unit, reorder_threshold, cost_price, selling_price) VALUES
('00000000-0000-0000-0000-000000000001', 'SKU_OIL_01', 'Fortune Mustard Oil 1L', 'সরিষার তেল', 'Edible Oils', 4.00, 'bottle', 5.00, 115.00, 130.00),
('00000000-0000-0000-0000-000000000001', 'SKU_SUG_01', 'Loose Sugar', 'চিনি', 'Groceries', 3.00, 'kg', 10.00, 36.00, 42.00),
('00000000-0000-0000-0000-000000000001', 'SKU_ATT_01', 'Aashirvaad Chakki Atta 10kg', 'আটা', 'Groceries', 12.00, 'bag', 4.00, 380.00, 420.00),
('00000000-0000-0000-0000-000000000001', 'SKU_MLK_01', 'Amul Taaza Milk 500ml', 'দুধ', 'Dairy', 18.00, 'packet', 6.00, 25.00, 27.00),
('00000000-0000-0000-0000-000000000001', 'SKU_SOAP_01', 'Lux Beauty Bar 100g', 'সাবান', 'Personal Care', 2.00, 'bar', 5.00, 32.00, 38.00)
ON CONFLICT DO NOTHING;
```

---

## 5. Next.js Supabase Client Integration

In our Next.js App Router codebase, Supabase will be accessed via:
1. **Server Client (Route Handlers & Server Actions):** Uses `createClient()` with `@supabase/supabase-js`.
2. **Graceful Fallback Mode:** If `NEXT_PUBLIC_SUPABASE_URL` is not yet configured in `.env.local`, the database adapter automatically falls back to the embedded JSON mock store, guaranteeing that local evaluation never crashes.
