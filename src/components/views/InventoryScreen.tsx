'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  ArrowLeft,
  Package,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Boxes,
} from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { InventoryItem } from '@/types/domain';
import { toast } from 'sonner';
import styles from './views.module.css';

type InventoryCategory = 'all' | 'low_stock' | 'Edible Oils' | 'Grains & Dal' | 'Snacks' | 'Personal Care';

export function InventoryScreen() {
  const { inventory, restockItem, setActiveScreen } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<InventoryCategory>('all');

  // Aggregated Stock Metrics
  const lowStockCount = useMemo(() => {
    return inventory.filter((i) => i.current_stock <= i.low_stock_threshold).length;
  }, [inventory]);

  const totalCatalogValue = useMemo(() => {
    return inventory.reduce(
      (sum, i) => sum + Math.max(0, i.current_stock) * i.unit_price,
      0
    );
  }, [inventory]);

  // Client-Side Instant Filtering
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return inventory.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        item.unit.toLowerCase().includes(q);
      if (!matchesSearch) return false;

      if (activeCategory === 'all') return true;
      if (activeCategory === 'low_stock') {
        return item.current_stock <= item.low_stock_threshold;
      }

      // Keyword-based category categorization (adheres to ponytail minimal logic)
      const name = item.name.toLowerCase();
      if (activeCategory === 'Edible Oils') {
        return name.includes('oil') || name.includes('tel') || name.includes('ghee');
      }
      if (activeCategory === 'Grains & Dal') {
        return (
          name.includes('atta') ||
          name.includes('rice') ||
          name.includes('dal') ||
          name.includes('sugar') ||
          name.includes('salt')
        );
      }
      if (activeCategory === 'Snacks') {
        return (
          name.includes('biscuit') ||
          name.includes('parle') ||
          name.includes('noodle') ||
          name.includes('maggi')
        );
      }
      if (activeCategory === 'Personal Care') {
        return (
          name.includes('soap') ||
          name.includes('dettol') ||
          name.includes('milk') ||
          name.includes('shampoo')
        );
      }

      return true;
    });
  }, [inventory, searchQuery, activeCategory]);

  const handleQuickRestock = async (item: InventoryItem, qty: number) => {
    // 1. Optimistic UI update in Zustand store (instant response)
    restockItem(item.id, qty);
    const newStock = item.current_stock + qty;

    toast.success(`Restocked +${qty} ${item.name}!`, {
      description: `Stock level: ${newStock} ${item.unit} remaining.`,
    });

    // 2. Background persistence to database via /api/dual-sync
    try {
      await fetch('/api/dual-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_type: 'restock',
          amount: 0,
          items: [
            {
              item_id: item.id,
              name: item.name,
              quantity: qty,
              unit: item.unit,
              unit_price: item.unit_price,
            },
          ],
        }),
      });
    } catch {
      // Background non-fatal sync; local state already updated
    }
  };

  return (
    <div className={styles.viewsContainer}>
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-3">
        <button
          onClick={() => setActiveScreen('home')}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to Voice Home"
        >
          <ArrowLeft className="size-4" />
          <span>Home</span>
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Store Stock Inventory
        </span>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
          {inventory.length} SKUs
        </span>
      </div>

      {/* Hero Banner */}
      <div className={styles.heroBannerInventory}>
        <div className={styles.heroStatLabel} style={{ color: '#FCD34D' }}>
          <Boxes className="size-3.5" />
          <span>Catalog Inventory Value</span>
        </div>
        <div className={styles.heroStatAmount}>
          <span>₹{totalCatalogValue.toLocaleString()}</span>
          <span className="text-xs font-semibold text-amber-300/80">estimated stock</span>
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs">
          <div className="px-2 py-0.5 rounded-md bg-black/30 border border-border/40">
            <span className="text-muted-foreground">Active SKUs: </span>
            <strong className="text-foreground">{inventory.length}</strong>
          </div>
          <div className="px-2 py-0.5 rounded-md bg-black/30 border border-border/40">
            <span className="text-muted-foreground">Low Stock: </span>
            <strong className={lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'}>
              {lowStockCount} items
            </strong>
          </div>
        </div>
      </div>

      {/* Instant Search Bar */}
      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>
          <Search className="size-4" />
        </span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search product name or unit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className={styles.searchClearBtn}
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className={styles.chipsTray}>
        <button
          className={`${styles.chipBtn} ${activeCategory === 'all' ? styles.chipBtnActive : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All ({inventory.length})
        </button>
        <button
          className={`${styles.chipBtn} ${activeCategory === 'low_stock' ? styles.chipBtnActiveAlert : ''}`}
          onClick={() => setActiveCategory('low_stock')}
        >
          ⚠️ Low Stock ({lowStockCount})
        </button>
        <button
          className={`${styles.chipBtn} ${activeCategory === 'Edible Oils' ? styles.chipBtnActive : ''}`}
          onClick={() => setActiveCategory('Edible Oils')}
        >
          Edible Oils
        </button>
        <button
          className={`${styles.chipBtn} ${activeCategory === 'Grains & Dal' ? styles.chipBtnActive : ''}`}
          onClick={() => setActiveCategory('Grains & Dal')}
        >
          Grains &amp; Dal
        </button>
        <button
          className={`${styles.chipBtn} ${activeCategory === 'Snacks' ? styles.chipBtnActive : ''}`}
          onClick={() => setActiveCategory('Snacks')}
        >
          Snacks
        </button>
        <button
          className={`${styles.chipBtn} ${activeCategory === 'Personal Care' ? styles.chipBtnActive : ''}`}
          onClick={() => setActiveCategory('Personal Care')}
        >
          Personal Care
        </button>
      </div>

      {/* Inventory Item List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="size-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-bold text-foreground">No items found</p>
            <p className="text-xs mt-1">Try another category filter or search keyword.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isDepleted = item.current_stock <= 0;
            const isLow = item.current_stock <= item.low_stock_threshold && !isDepleted;

            return (
              <div
                key={item.id}
                className={`${styles.itemCard} ${isDepleted ? styles.itemCardCritical : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {isDepleted ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse flex items-center gap-1">
                          <AlertTriangle className="size-2.5" />
                          <span>DEPLETED ({item.current_stock})</span>
                        </span>
                      ) : isLow ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <AlertTriangle className="size-2.5" />
                          <span>LOW STOCK ({item.current_stock})</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="size-2.5" />
                          <span>IN STOCK</span>
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        Threshold: {item.low_stock_threshold} {item.unit}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-base font-black tabular-nums block ${
                        isDepleted
                          ? 'text-rose-400'
                          : isLow
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {item.current_stock} {item.unit}
                    </span>
                    <span className="text-[11px] font-bold text-muted-foreground">
                      ₹{item.unit_price} / {item.unit}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/40">
                  <div className="text-[11px] text-muted-foreground">
                    Cost: ₹{item.cost_price} • Margin:{' '}
                    <strong className="text-emerald-400 font-bold">
                      +₹{item.unit_price - item.cost_price}
                    </strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      className={styles.quickRestockBtn}
                      onClick={() => handleQuickRestock(item, 5)}
                      aria-label={`Restock +5 ${item.name}`}
                    >
                      <Plus className="size-3" />
                      <span>5</span>
                    </button>
                    <button
                      className={`${styles.quickRestockBtn} ${
                        isDepleted ? styles.quickRestockBtnLarge : ''
                      }`}
                      onClick={() => handleQuickRestock(item, 10)}
                      aria-label={`Restock +10 ${item.name}`}
                    >
                      <Plus className="size-3" />
                      <span>10 Restock</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
