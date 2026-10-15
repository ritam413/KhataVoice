import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type {
  Customer,
  InventoryItem,
  DualSyncPayload,
  DualSyncResponse,
} from '@/types/domain';
import { localStore } from './local-fallback';
import { DEFAULT_MERCHANT_ID } from './seed-data';

export interface SpokenDualSyncRpcParams {
  p_merchant_id: string;
  p_customer_name: string;
  p_transaction_type: string;
  p_amount: number;
  p_items: Array<{
    item_id?: string;
    name?: string;
    quantity?: number;
    unit?: string;
    unit_price?: number;
  }>;
  p_raw_transcript?: string;
  p_language?: string;
}

export interface SpokenDualSyncRpcResult {
  success: boolean;
  ledger_id: string;
  customer_id?: string;
  new_balance?: number;
  trust_score?: number;
  trust_tier?: 'GOLD' | 'SILVER' | 'BRONZE';
  stock_warnings?: string[];
  updated_inventory?: Array<{
    id: string;
    name: string;
    unit: string;
    current_stock: number;
    low_stock_threshold: number;
  }>;
}

/**
 * Type-safe RPC Bridge for `execute_spoken_dual_sync` PostgreSQL stored procedure.
 * Features an automatic fallback to `localStore` if Supabase RPC fails or is unavailable.
 */
export async function invokeExecuteSpokenDualSync(
  client: SupabaseClient<Database>,
  payload: DualSyncPayload
): Promise<DualSyncResponse> {
  const merchantId = payload.merchant_id || DEFAULT_MERCHANT_ID;
  const customerName = payload.customer_name || 'Walk-in Customer';

  const rpcParams: SpokenDualSyncRpcParams = {
    p_merchant_id: merchantId,
    p_customer_name: customerName,
    p_transaction_type: payload.transaction_type,
    p_amount: Number(payload.amount) || 0,
    p_items: (payload.items || []).map((item) => ({
      item_id: item.item_id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
    })),
    p_raw_transcript: payload.raw_transcript || '',
    p_language: payload.language || 'bn',
  };

  try {
    const { data, error } = await client.rpc('execute_spoken_dual_sync', {
      p_merchant_id: rpcParams.p_merchant_id,
      p_customer_name: rpcParams.p_customer_name,
      p_transaction_type: rpcParams.p_transaction_type,
      p_amount: rpcParams.p_amount,
      p_items: rpcParams.p_items as unknown as Database['public']['Functions']['execute_spoken_dual_sync']['Args']['p_items'],
      p_raw_transcript: rpcParams.p_raw_transcript || '',
      p_language: rpcParams.p_language || 'bn',
    });

    if (error) {
      console.warn(
        '[invokeExecuteSpokenDualSync] RPC error, failing over to localStore:',
        error.message
      );
      return localStore.executeDualSync(payload);
    }

    if (!data) {
      console.warn(
        '[invokeExecuteSpokenDualSync] RPC returned null data, failing over to localStore'
      );
      return localStore.executeDualSync(payload);
    }

    const result = data as unknown as SpokenDualSyncRpcResult;

    if (!result.success || !result.ledger_id) {
      console.warn(
        '[invokeExecuteSpokenDualSync] RPC returned unsuccessful status, failing over to localStore'
      );
      return localStore.executeDualSync(payload);
    }

    // Resolve updated customer record from Supabase
    let customer: Customer | null = null;
    if (result.customer_id) {
      const { data: customerData } = await client
        .from('customers')
        .select('*')
        .eq('id', result.customer_id)
        .single();

      if (customerData) {
        customer = {
          id: customerData.id,
          merchant_id: customerData.merchant_id,
          name: customerData.name,
          phone: customerData.phone_number,
          current_balance: Number(customerData.current_balance),
          trust_score: customerData.credit_trust_score,
          trust_badge: customerData.trust_tier,
          credit_limit: Number(customerData.credit_limit),
          total_transactions_count: customerData.total_transactions_count,
          last_transaction_at: customerData.last_transaction_at,
        };
      }
    }

    // Resolve updated inventory items from Supabase
    const { data: inventoryData } = await client
      .from('inventory_items')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('name_english', { ascending: true });

    const updatedInventory: InventoryItem[] = (inventoryData || []).map((i) => ({
      id: i.id,
      merchant_id: i.merchant_id,
      name: i.name_english,
      unit: i.unit,
      current_stock: Number(i.current_stock),
      unit_price: Number(i.selling_price),
      cost_price: Number(i.cost_price),
      low_stock_threshold: Number(i.low_stock_threshold),
    }));

    return {
      success: true,
      ledger_entry_id: result.ledger_id,
      customer,
      updated_inventory: updatedInventory,
      warnings: result.stock_warnings && result.stock_warnings.length > 0 ? result.stock_warnings : undefined,
    };
  } catch (err) {
    console.warn(
      '[invokeExecuteSpokenDualSync] Exception during execution, delegating to localStore:',
      err
    );
    return localStore.executeDualSync(payload);
  }
}
