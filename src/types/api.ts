import { TransactionType, Language, DualSyncResponse } from './domain';

export interface DualSyncRequest {
  merchant_id?: string;
  customer_name?: string;
  customer_phone?: string;
  transaction_type: TransactionType;
  amount: number;
  items: Array<{
    item_id?: string;
    name: string;
    quantity: number;
    unit: string;
    unit_price?: number;
    price?: number;
  }>;
  raw_transcript?: string;
  language?: Language;
  idempotency_key?: string;
}

export interface DualSyncApiResponse {
  success: boolean;
  data?: DualSyncResponse;
  error?: string;
  is_duplicate?: boolean;
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}
