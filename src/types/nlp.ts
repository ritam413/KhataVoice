import type { Language, TransactionType, InventoryItem } from './domain';

export type NlpEngine = 'ollama' | 'gemini' | 'regex_heuristic';

export interface ParsedTransactionItem {
  item_id?: string;
  name: string;
  quantity: number;
  unit: string;
  estimated_price?: number;
}

export interface ParsedTransaction {
  customer_name?: string;
  customer_id?: string;
  transaction_type: TransactionType;
  amount: number;
  items: ParsedTransactionItem[];
  confidence: number;
  engine: NlpEngine;
  raw_transcript: string;
  notes?: string;
}

export interface ParseTransactionInput {
  transcript: string;
  language: Language;
  merchantId?: string;
  catalogContext?: InventoryItem[];
}

export interface TranscribeRouteRequestBody {
  audioBlobBase64?: string;
  presetId?: string;
  language: Language;
}

export interface TranscribeRouteResponseData {
  transcript: string;
  language: Language;
  engine: string;
  durationMs: number;
  confidence: number;
}

export interface ParseTransactionRouteRequestBody {
  transcript: string;
  language: Language;
  merchantId?: string;
}
