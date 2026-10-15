export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      merchants: {
        Row: {
          id: string;
          business_name: string;
          owner_name: string;
          phone_number: string;
          upi_id: string;
          preferred_language: 'bn' | 'hi' | 'en';
          created_at: string;
        };
        Insert: {
          id?: string;
          business_name: string;
          owner_name: string;
          phone_number: string;
          upi_id: string;
          preferred_language?: 'bn' | 'hi' | 'en';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['merchants']['Insert']>;
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          merchant_id: string;
          name: string;
          phone_number: string;
          current_balance: number;
          credit_trust_score: number;
          trust_tier: 'GOLD' | 'SILVER' | 'BRONZE';
          credit_limit: number;
          total_transactions_count: number;
          last_payment_date: string | null;
          last_transaction_at: string;
          lifetime_credit_repaid: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          name: string;
          phone_number: string;
          current_balance?: number;
          credit_trust_score?: number;
          trust_tier?: 'GOLD' | 'SILVER' | 'BRONZE';
          credit_limit?: number;
          total_transactions_count?: number;
          last_payment_date?: string | null;
          last_transaction_at?: string;
          lifetime_credit_repaid?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
        Relationships: [];
      };
      inventory_items: {
        Row: {
          id: string;
          merchant_id: string;
          sku: string;
          name_english: string;
          name_vernacular: string;
          category: string;
          current_stock: number;
          unit: 'kg' | 'packet' | 'liter' | 'piece' | 'tin' | 'bag' | 'bottle' | 'bar';
          low_stock_threshold: number;
          cost_price: number;
          selling_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          sku: string;
          name_english: string;
          name_vernacular: string;
          category: string;
          current_stock?: number;
          unit?: 'kg' | 'packet' | 'liter' | 'piece' | 'tin' | 'bag' | 'bottle' | 'bar';
          low_stock_threshold?: number;
          cost_price: number;
          selling_price: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['inventory_items']['Insert']>;
        Relationships: [];
      };
      ledger_entries: {
        Row: {
          id: string;
          merchant_id: string;
          customer_id: string | null;
          customer_name: string | null;
          amount: number;
          transaction_type: 'udhaar_sale' | 'cash_sale' | 'payment_received' | 'restock';
          items_summary: Json;
          raw_transcript: string | null;
          language: 'bn' | 'hi' | 'en';
          created_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          customer_id?: string | null;
          customer_name?: string | null;
          amount: number;
          transaction_type: 'udhaar_sale' | 'cash_sale' | 'payment_received' | 'restock';
          items_summary?: Json;
          raw_transcript?: string | null;
          language?: 'bn' | 'hi' | 'en';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['ledger_entries']['Insert']>;
        Relationships: [];
      };
      stock_movements: {
        Row: {
          id: string;
          item_id: string;
          ledger_entry_id: string | null;
          quantity_delta: number;
          movement_type: 'sale_deduct' | 'restock_add' | 'manual_adjustment';
          resulting_stock: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          ledger_entry_id?: string | null;
          quantity_delta: number;
          movement_type: 'sale_deduct' | 'restock_add' | 'manual_adjustment';
          resulting_stock: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['stock_movements']['Insert']>;
        Relationships: [];
      };
      reminder_logs: {
        Row: {
          id: string;
          customer_id: string;
          merchant_id: string;
          amount_due: number;
          tone: 'polite' | 'friendly' | 'firm';
          language: 'bn' | 'hi' | 'en';
          message_payload: string;
          whatsapp_url: string | null;
          dispatched_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          merchant_id: string;
          amount_due: number;
          tone: 'polite' | 'friendly' | 'firm';
          language: 'bn' | 'hi' | 'en';
          message_payload: string;
          whatsapp_url?: string | null;
          dispatched_at?: string;
        };
        Update: Partial<Database['public']['Tables']['reminder_logs']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      execute_spoken_dual_sync: {
        Args: {
          p_merchant_id: string;
          p_customer_name: string;
          p_transaction_type: string;
          p_amount: number;
          p_items: Json;
          p_raw_transcript: string;
          p_language: string;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
