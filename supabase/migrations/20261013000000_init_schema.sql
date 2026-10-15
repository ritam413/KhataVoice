-- ========================================================
-- KHATAVOICE: SUPABASE POSTGRESQL SCHEMA INITIALIZATION
-- Migration: 20261013000000_init_schema.sql
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
    preferred_language VARCHAR(10) DEFAULT 'bn' CHECK (preferred_language IN ('bn', 'hi', 'en')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    current_balance NUMERIC(10,2) DEFAULT 0.00, -- Positive = owes money (Udhaar), Negative = advance payment
    credit_trust_score INTEGER DEFAULT 75 CHECK (credit_trust_score BETWEEN 0 AND 100),
    trust_tier VARCHAR(16) DEFAULT 'SILVER' CHECK (trust_tier IN ('GOLD', 'SILVER', 'BRONZE')),
    credit_limit NUMERIC(10,2) DEFAULT 5000.00,
    total_transactions_count INTEGER DEFAULT 0,
    last_payment_date TIMESTAMPTZ,
    last_transaction_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
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
    unit VARCHAR(16) DEFAULT 'packet' CHECK (unit IN ('kg', 'packet', 'liter', 'piece', 'tin', 'bag', 'bottle', 'bar')),
    low_stock_threshold NUMERIC(10,2) DEFAULT 5.00,
    cost_price NUMERIC(10,2) NOT NULL,
    selling_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(merchant_id, sku)
);

-- 4. LEDGER ENTRIES TABLE
CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(128),
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    transaction_type VARCHAR(32) NOT NULL CHECK (transaction_type IN ('udhaar_sale', 'cash_sale', 'payment_received', 'restock')),
    items_summary JSONB DEFAULT '[]'::jsonb,
    raw_transcript TEXT,
    language VARCHAR(8) DEFAULT 'bn' CHECK (language IN ('bn', 'hi', 'en')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. STOCK MOVEMENTS TABLE
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    ledger_entry_id UUID REFERENCES ledger_entries(id) ON DELETE SET NULL,
    quantity_delta NUMERIC(10,2) NOT NULL,
    movement_type VARCHAR(32) NOT NULL CHECK (movement_type IN ('sale_deduct', 'restock_add', 'manual_adjustment')),
    resulting_stock NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 6. REMINDER LOGS TABLE
CREATE TABLE IF NOT EXISTS reminder_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    amount_due NUMERIC(10,2) NOT NULL,
    tone VARCHAR(32) NOT NULL CHECK (tone IN ('polite', 'friendly', 'firm')),
    language VARCHAR(8) NOT NULL CHECK (language IN ('bn', 'hi', 'en')),
    message_payload TEXT NOT NULL,
    whatsapp_url TEXT,
    dispatched_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ========================================================
-- HIGH VELOCITY INDEXES
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_customers_merchant ON customers(merchant_id);
CREATE INDEX IF NOT EXISTS idx_customers_trust_score ON customers(credit_trust_score DESC);
CREATE INDEX IF NOT EXISTS idx_customers_balance ON customers(merchant_id, current_balance DESC);

CREATE INDEX IF NOT EXISTS idx_inventory_merchant ON inventory_items(merchant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock ON inventory_items(current_stock ASC);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items(merchant_id, category);

CREATE INDEX IF NOT EXISTS idx_ledger_merchant_created ON ledger_entries(merchant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_customer ON ledger_entries(customer_id);

CREATE INDEX IF NOT EXISTS idx_stock_movements_item ON stock_movements(item_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_customer ON reminder_logs(customer_id, dispatched_at DESC);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;

-- Permissive demo access policies for hackathon client evaluation
CREATE POLICY "Demo Access Merchants" ON merchants FOR ALL USING (true);
CREATE POLICY "Demo Access Customers" ON customers FOR ALL USING (true);
CREATE POLICY "Demo Access Inventory" ON inventory_items FOR ALL USING (true);
CREATE POLICY "Demo Access Ledger" ON ledger_entries FOR ALL USING (true);
CREATE POLICY "Demo Access Movements" ON stock_movements FOR ALL USING (true);
CREATE POLICY "Demo Access Reminders" ON reminder_logs FOR ALL USING (true);

-- ========================================================
-- SUPABASE REALTIME REPLICATION
-- ========================================================
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_items;
ALTER PUBLICATION supabase_realtime ADD TABLE ledger_entries;

-- ========================================================
-- SEED DATA (AUTHENTIC KOLKATA KIRANA: RAMESH BABU)
-- ========================================================
INSERT INTO merchants (id, business_name, owner_name, phone_number, upi_id, preferred_language)
VALUES ('00000000-0000-0000-0000-000000000001', 'Maa Tara Variety Stores', 'Ramesh Babu', '+919830099887', 'maatarastore@okaxis', 'bn')
ON CONFLICT (id) DO NOTHING;

INSERT INTO customers (id, merchant_id, name, phone_number, current_balance, credit_trust_score, trust_tier, credit_limit, total_transactions_count) VALUES
('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'Shyam Sundar Das', '+919831154321', 420.00, 86, 'GOLD', 5000.00, 14),
('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'Rohit Gupta', '+919830223344', 1250.00, 72, 'SILVER', 4000.00, 9),
('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'Sunita Devi', '+919830012345', 310.00, 88, 'GOLD', 3000.00, 18),
('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'Amit Das', '+919832298765', 0.00, 92, 'GOLD', 6000.00, 22),
('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000001', 'Rajesh Mondal', '+919830556677', 850.00, 58, 'BRONZE', 2000.00, 6),
('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000001', 'Priya Sen', '+919830667788', 180.00, 84, 'SILVER', 3500.00, 11)
ON CONFLICT (id) DO NOTHING;

INSERT INTO inventory_items (id, merchant_id, sku, name_english, name_vernacular, category, current_stock, unit, low_stock_threshold, cost_price, selling_price) VALUES
('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 'SKU_OIL_01', 'Fortune Mustard Oil 1L', 'ফরচুনা সরিষার তেল ১ লিটার', 'Edible Oils', 4.00, 'liter', 5.00, 115.00, 130.00),
('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 'SKU_ATT_01', 'Aashirvaad Chakki Atta 5kg', 'আশীর্বাদ আটা ৫ কেজি', 'Groceries', 12.00, 'kg', 4.00, 195.00, 220.00),
('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000001', 'SKU_SLT_01', 'Tata Salt 1kg', 'টাটা লবণ ১ কেজি', 'Groceries', 25.00, 'packet', 8.00, 22.00, 28.00),
('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000001', 'SKU_BIS_01', 'Parle-G 80g', 'পার্লে-জি ৮০ গ্রাম', 'Biscuits & Snacks', 40.00, 'packet', 15.00, 8.00, 10.00),
('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0000-000000000001', 'SKU_NOD_01', 'Maggi 2-Minute Noodles 70g', 'ম্যাগি নুডলস ৭০ গ্রাম', 'Instant Food', 30.00, 'packet', 10.00, 12.00, 14.00),
('00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0000-000000000001', 'SKU_SOP_01', 'Dettol Soap 75g', 'ডেটল সাবান ৭৫ গ্রাম', 'Personal Care', 8.00, 'piece', 5.00, 32.00, 38.00),
('00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0000-000000000001', 'SKU_SUG_01', 'Sugar 1kg', 'চিনি ১ কেজি', 'Groceries', 3.00, 'kg', 10.00, 38.00, 44.00),
('00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0000-000000000001', 'SKU_DAL_01', 'Masoor Dal 1kg', 'মসুর ডাল ১ কেজি', 'Pulses', 15.00, 'kg', 5.00, 95.00, 110.00),
('00000000-0000-0000-0002-000000000009', '00000000-0000-0000-0000-000000000001', 'SKU_MLK_01', 'Amul Taaza Milk 500ml', 'আমুল তাজা দুধ ৫০০ মি.লি.', 'Dairy', 18.00, 'packet', 6.00, 25.00, 27.00),
('00000000-0000-0000-0002-000000000010', '00000000-0000-0000-0000-000000000001', 'SKU_TEA_01', 'Brooke Bond Red Label Tea 250g', 'রেড লেবেল চা ২৫০ গ্রাম', 'Beverages', 14.00, 'packet', 5.00, 120.00, 140.00)
ON CONFLICT (id) DO NOTHING;
