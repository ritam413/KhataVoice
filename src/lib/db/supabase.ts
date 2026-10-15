import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type {
  Customer,
  InventoryItem,
  LedgerEntry,
  DualSyncPayload,
  DualSyncResponse,
} from '@/types/domain';
import { localStore } from './local-fallback';
import { DEFAULT_MERCHANT_ID } from './seed-data';
import { invokeExecuteSpokenDualSync } from './stored-proc-bridge';

export interface IDatabaseAdapter {
  readonly mode: 'cloud' | 'local';
  getCustomers(merchantId?: string): Promise<Customer[]>;
  getCustomerById(id: string): Promise<Customer | null>;
  getCustomerByName(name: string, merchantId?: string): Promise<Customer | null>;
  getInventory(merchantId?: string): Promise<InventoryItem[]>;
  getLedgerEntries(merchantId?: string, limit?: number): Promise<LedgerEntry[]>;
  executeDualSync(payload: DualSyncPayload): Promise<DualSyncResponse>;
  resetToInitialSeed?(): void;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project') &&
    supabaseUrl.startsWith('https://')
);

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!)
  : null;

class CloudSupabaseAdapter implements IDatabaseAdapter {
  readonly mode = 'cloud' as const;
  private client: SupabaseClient<Database>;

  constructor(client: SupabaseClient<Database>) {
    this.client = client;
  }

  async getCustomers(merchantId: string = DEFAULT_MERCHANT_ID): Promise<Customer[]> {
    const { data, error } = await this.client
      .from('customers')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('current_balance', { ascending: false });

    if (error || !data) {
      console.warn('[CloudSupabaseAdapter] getCustomers fallback to local:', error?.message);
      return localStore.getCustomers(merchantId);
    }

    return data.map((c) => ({
      id: c.id,
      merchant_id: c.merchant_id,
      name: c.name,
      phone: c.phone_number,
      current_balance: Number(c.current_balance),
      trust_score: c.credit_trust_score,
      trust_badge: c.trust_tier,
      credit_limit: Number(c.credit_limit),
      total_transactions_count: c.total_transactions_count,
      last_transaction_at: c.last_transaction_at,
    }));
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    const { data, error } = await this.client
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return localStore.getCustomerById(id);
    }

    return {
      id: data.id,
      merchant_id: data.merchant_id,
      name: data.name,
      phone: data.phone_number,
      current_balance: Number(data.current_balance),
      trust_score: data.credit_trust_score,
      trust_badge: data.trust_tier,
      credit_limit: Number(data.credit_limit),
      total_transactions_count: data.total_transactions_count,
      last_transaction_at: data.last_transaction_at,
    };
  }

  async getCustomerByName(name: string, merchantId: string = DEFAULT_MERCHANT_ID): Promise<Customer | null> {
    const { data, error } = await this.client
      .from('customers')
      .select('*')
      .eq('merchant_id', merchantId)
      .ilike('name', name.trim())
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return localStore.getCustomerByName(name, merchantId);
    }

    return {
      id: data.id,
      merchant_id: data.merchant_id,
      name: data.name,
      phone: data.phone_number,
      current_balance: Number(data.current_balance),
      trust_score: data.credit_trust_score,
      trust_badge: data.trust_tier,
      credit_limit: Number(data.credit_limit),
      total_transactions_count: data.total_transactions_count,
      last_transaction_at: data.last_transaction_at,
    };
  }

  async getInventory(merchantId: string = DEFAULT_MERCHANT_ID): Promise<InventoryItem[]> {
    const { data, error } = await this.client
      .from('inventory_items')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('name_english', { ascending: true });

    if (error || !data) {
      console.warn('[CloudSupabaseAdapter] getInventory fallback to local:', error?.message);
      return localStore.getInventory(merchantId);
    }

    return data.map((i) => ({
      id: i.id,
      merchant_id: i.merchant_id,
      name: i.name_english,
      unit: i.unit,
      current_stock: Number(i.current_stock),
      unit_price: Number(i.selling_price),
      cost_price: Number(i.cost_price),
      low_stock_threshold: Number(i.low_stock_threshold),
    }));
  }

  async getLedgerEntries(
    merchantId: string = DEFAULT_MERCHANT_ID,
    limit: number = 50
  ): Promise<LedgerEntry[]> {
    const { data, error } = await this.client
      .from('ledger_entries')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      console.warn('[CloudSupabaseAdapter] getLedgerEntries fallback to local:', error?.message);
      return localStore.getLedgerEntries(merchantId, limit);
    }

    return data.map((e) => ({
      id: e.id,
      merchant_id: e.merchant_id,
      customer_id: e.customer_id || undefined,
      customer_name: e.customer_name || undefined,
      transaction_type: e.transaction_type,
      amount: Number(e.amount),
      items_summary: (e.items_summary as unknown as LedgerEntry['items_summary']) || [],
      raw_transcript: e.raw_transcript || undefined,
      language: e.language,
      created_at: e.created_at,
    }));
  }

  async executeDualSync(payload: DualSyncPayload): Promise<DualSyncResponse> {
    return invokeExecuteSpokenDualSync(this.client, payload);
  }

  resetToInitialSeed(): void {
    localStore.resetToInitialSeed();
  }
}

export function getDbAdapter(): IDatabaseAdapter {
  if (isSupabaseConfigured && supabase) {
    return new CloudSupabaseAdapter(supabase);
  }
  return localStore;
}

export const dbAdapter = getDbAdapter();
