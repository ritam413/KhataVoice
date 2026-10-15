export type Language = 'bn' | 'hi' | 'en';
export type TransactionType = 'udhaar_sale' | 'cash_sale' | 'restock' | 'payment_received';
export type TrustBadgeTier = 'GOLD' | 'SILVER' | 'BRONZE';
export type WhatsAppTone = 'polite' | 'friendly' | 'firm';

export interface Merchant {
  id: string;
  business_name: string;
  owner_name: string;
  phone_number: string;
  upi_id: string;
  preferred_language: Language;
  created_at: string;
}

export interface Customer {
  id: string;
  merchant_id: string;
  name: string;
  phone: string;
  current_balance: number; // positive = owes money (udhaar), negative = advance
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
  unit: 'kg' | 'packet' | 'liter' | 'piece' | 'tin' | 'bottle' | 'bag' | 'bar';
  current_stock: number;
  unit_price: number;
  cost_price: number;
  low_stock_threshold: number;
}

export interface LedgerEntryItem {
  item_id?: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface LedgerEntry {
  id: string;
  merchant_id: string;
  customer_id?: string;
  customer_name?: string;
  transaction_type: TransactionType;
  amount: number;
  items_summary: LedgerEntryItem[];
  raw_transcript?: string;
  language: Language;
  created_at: string;
}

export interface DualSyncPayload {
  merchant_id?: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  transaction_type: TransactionType;
  amount: number;
  items: Array<{
    item_id?: string;
    name: string;
    quantity: number;
    unit: string;
    unit_price: number;
  }>;
  raw_transcript?: string;
  language: Language;
}

export interface DualSyncResponse {
  success: boolean;
  ledger_entry_id: string;
  customer: Customer | null;
  updated_inventory: InventoryItem[];
  warnings?: string[];
}
