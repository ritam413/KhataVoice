import type {
  Customer,
  InventoryItem,
  LedgerEntry,
  DualSyncPayload,
  DualSyncResponse,
  TrustBadgeTier,
} from '@/types/domain';
import {
  DEFAULT_MERCHANT_ID,
  SEED_CUSTOMERS,
  SEED_INVENTORY,
  SEED_LEDGER_ENTRIES,
} from './seed-data';

export type StoreEventListener = (event: { type: string; payload: unknown }) => void;

class LocalFallbackStore {
  readonly mode = 'local' as const;
  private customers: Map<string, Customer>;
  private inventory: Map<string, InventoryItem>;
  private ledgerEntries: LedgerEntry[];
  private listeners: Set<StoreEventListener>;

  constructor() {
    this.customers = new Map();
    this.inventory = new Map();
    this.ledgerEntries = [];
    this.listeners = new Set();
    this.resetToInitialSeed();
  }

  public resetToInitialSeed(): void {
    this.customers.clear();
    for (const c of SEED_CUSTOMERS) {
      this.customers.set(c.id, structuredClone(c));
    }

    this.inventory.clear();
    for (const item of SEED_INVENTORY) {
      this.inventory.set(item.id, structuredClone(item));
    }

    this.ledgerEntries = structuredClone(SEED_LEDGER_ENTRIES);
    this.notify('RESET', { customers: this.customers.size, inventory: this.inventory.size });
  }

  public subscribe(listener: StoreEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(type: string, payload: unknown): void {
    for (const listener of this.listeners) {
      try {
        listener({ type, payload });
      } catch (err) {
        console.error('[LocalFallbackStore] Listener error:', err);
      }
    }
  }

  // --- Customers ---
  public async getCustomers(merchantId: string = DEFAULT_MERCHANT_ID): Promise<Customer[]> {
    const results = Array.from(this.customers.values()).filter(
      (c) => c.merchant_id === merchantId
    );
    return structuredClone(results);
  }

  public async getCustomerById(id: string): Promise<Customer | null> {
    const customer = this.customers.get(id);
    return customer ? structuredClone(customer) : null;
  }

  public async getCustomerByName(name: string, merchantId: string = DEFAULT_MERCHANT_ID): Promise<Customer | null> {
    const lower = name.trim().toLowerCase();
    for (const c of this.customers.values()) {
      if (c.merchant_id === merchantId && c.name.toLowerCase() === lower) {
        return structuredClone(c);
      }
    }
    return null;
  }

  public async createOrUpdateCustomer(
    data: Partial<Customer> & { name: string; merchant_id?: string }
  ): Promise<Customer> {
    const merchantId = data.merchant_id || DEFAULT_MERCHANT_ID;
    let existing = await this.getCustomerByName(data.name, merchantId);

    if (existing) {
      const updated: Customer = {
        ...existing,
        ...data,
        id: existing.id,
        merchant_id: merchantId,
      };
      this.customers.set(updated.id, structuredClone(updated));
      this.notify('CUSTOMER_UPDATED', updated);
      return structuredClone(updated);
    }

    const newId = `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newCustomer: Customer = {
      phone: '+919830000000',
      current_balance: 0,
      trust_score: 75,
      trust_badge: 'SILVER',
      credit_limit: 5000,
      total_transactions_count: 1,
      last_transaction_at: new Date().toISOString(),
      ...data,
      id: newId,
      merchant_id: merchantId,
      name: data.name,
    };

    this.customers.set(newId, structuredClone(newCustomer));
    this.notify('CUSTOMER_CREATED', newCustomer);
    return structuredClone(newCustomer);
  }

  // --- Inventory ---
  public async getInventory(merchantId: string = DEFAULT_MERCHANT_ID): Promise<InventoryItem[]> {
    const results = Array.from(this.inventory.values()).filter(
      (i) => i.merchant_id === merchantId
    );
    return structuredClone(results);
  }

  public async getInventoryItemById(id: string): Promise<InventoryItem | null> {
    const item = this.inventory.get(id);
    return item ? structuredClone(item) : null;
  }

  public async updateInventoryStock(itemId: string, delta: number): Promise<InventoryItem> {
    const item = this.inventory.get(itemId);
    if (!item) {
      throw new Error(`Inventory item not found: ${itemId}`);
    }
    item.current_stock += delta;
    this.inventory.set(itemId, structuredClone(item));
    this.notify('INVENTORY_UPDATED', item);
    return structuredClone(item);
  }

  // --- Ledger ---
  public async getLedgerEntries(
    merchantId: string = DEFAULT_MERCHANT_ID,
    limit: number = 50
  ): Promise<LedgerEntry[]> {
    const filtered = this.ledgerEntries
      .filter((e) => e.merchant_id === merchantId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
    return structuredClone(filtered);
  }

  public async addLedgerEntry(entry: Omit<LedgerEntry, 'id' | 'created_at'>): Promise<LedgerEntry> {
    const newEntry: LedgerEntry = {
      ...entry,
      id: `ledger-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
    };
    this.ledgerEntries.unshift(structuredClone(newEntry));
    this.notify('LEDGER_CREATED', newEntry);
    return structuredClone(newEntry);
  }

  // --- Atomic Dual-Sync ---
  public async executeDualSync(payload: DualSyncPayload): Promise<DualSyncResponse> {
    const merchantId = payload.merchant_id || DEFAULT_MERCHANT_ID;
    const warnings: string[] = [];
    const updatedInventoryList: InventoryItem[] = [];

    // 1. Resolve Customer if present
    let customer: Customer | null = null;
    if (payload.customer_name) {
      customer = await this.getCustomerByName(payload.customer_name, merchantId);
      if (!customer) {
        customer = await this.createOrUpdateCustomer({
          name: payload.customer_name,
          phone: payload.customer_phone || '+919830000000',
          merchant_id: merchantId,
          current_balance: 0,
          trust_score: 75,
          trust_badge: 'SILVER',
        });
      }

      // Update Balance
      if (payload.transaction_type === 'udhaar_sale') {
        customer.current_balance += payload.amount;
      } else if (payload.transaction_type === 'payment_received') {
        customer.current_balance = Math.max(0, customer.current_balance - payload.amount);
      }

      customer.total_transactions_count += 1;
      customer.last_transaction_at = new Date().toISOString();

      // Dynamic Trust Score Calibration
      if (customer.current_balance > 3000) {
        customer.trust_score = 45;
        customer.trust_badge = 'BRONZE';
      } else if (customer.current_balance > 1500) {
        customer.trust_score = 68;
        customer.trust_badge = 'SILVER';
      } else {
        customer.trust_score = 88;
        customer.trust_badge = 'GOLD';
      }

      this.customers.set(customer.id, structuredClone(customer));
    }

    // 2. Adjust Inventory (with non-blocking negative inventory override)
    if (payload.items && payload.items.length > 0) {
      for (const itemPayload of payload.items) {
        let matchedItem: InventoryItem | undefined;

        if (itemPayload.item_id) {
          matchedItem = this.inventory.get(itemPayload.item_id);
        }

        if (!matchedItem && itemPayload.name) {
          const lowerName = itemPayload.name.toLowerCase();
          for (const inv of this.inventory.values()) {
            if (
              inv.merchant_id === merchantId &&
              inv.name.toLowerCase().includes(lowerName)
            ) {
              matchedItem = inv;
              break;
            }
          }
        }

        if (matchedItem) {
          const delta =
            payload.transaction_type === 'restock'
              ? itemPayload.quantity
              : -itemPayload.quantity;

          matchedItem.current_stock += delta;
          this.inventory.set(matchedItem.id, structuredClone(matchedItem));
          updatedInventoryList.push(structuredClone(matchedItem));

          if (matchedItem.current_stock < 0) {
            warnings.push(
              `Warning: ${matchedItem.name} is now at ${matchedItem.current_stock} ${matchedItem.unit}. Please restock.`
            );
          } else if (matchedItem.current_stock <= matchedItem.low_stock_threshold) {
            warnings.push(
              `Low Stock: ${matchedItem.name} has only ${matchedItem.current_stock} ${matchedItem.unit} remaining.`
            );
          }
        }
      }
    }

    // 3. Record Ledger Entry
    const ledgerEntry = await this.addLedgerEntry({
      merchant_id: merchantId,
      customer_id: customer?.id,
      customer_name: customer?.name || payload.customer_name,
      transaction_type: payload.transaction_type,
      amount: payload.amount,
      items_summary: payload.items.map((i) => ({
        item_id: i.item_id,
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        price: i.unit_price,
      })),
      raw_transcript: payload.raw_transcript,
      language: payload.language,
    });

    const response: DualSyncResponse = {
      success: true,
      ledger_entry_id: ledgerEntry.id,
      customer: customer ? structuredClone(customer) : null,
      updated_inventory: updatedInventoryList,
      warnings: warnings.length > 0 ? warnings : undefined,
    };

    this.notify('DUAL_SYNC_COMPLETED', response);
    return response;
  }
}

// Global Singleton Instance
export const localStore = new LocalFallbackStore();
