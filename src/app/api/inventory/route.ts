import { NextRequest, NextResponse } from 'next/server';
import { handleOptions, jsonWithCors } from '../_helpers/cors';
import { getDbAdapter } from '@/lib/db/supabase';
import { DEFAULT_MERCHANT_ID } from '@/lib/db/seed-data';
import { InventoryItem } from '@/types/domain';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get('merchantId') || req.headers.get('x-merchant-id') || DEFAULT_MERCHANT_ID;
    const lowStockOnly = searchParams.get('lowStockOnly') === 'true';
    const search = searchParams.get('search')?.toLowerCase().trim();

    const db = getDbAdapter();
    let items: InventoryItem[] = await db.getInventory(merchantId);

    // Compute metrics
    const totalSkus = items.length;
    let lowStockCount = 0;
    let totalStockUnits = 0;
    let totalInventoryValue = 0;

    const enrichedItems = items.map((item) => {
      const isLowStock = item.current_stock <= item.low_stock_threshold;
      if (isLowStock) lowStockCount++;
      totalStockUnits += item.current_stock;
      totalInventoryValue += item.current_stock * item.cost_price;

      return {
        ...item,
        is_low_stock: isLowStock,
      };
    });

    let filtered = enrichedItems;
    if (lowStockOnly) {
      filtered = filtered.filter((i) => i.is_low_stock);
    }
    if (search) {
      filtered = filtered.filter((i) => i.name.toLowerCase().includes(search));
    }

    return jsonWithCors(
      {
        success: true,
        data: filtered,
        metrics: {
          total_skus: totalSkus,
          filtered_count: filtered.length,
          low_stock_count: lowStockCount,
          total_stock_units: totalStockUnits,
          total_inventory_value: Math.round(totalInventoryValue),
        },
      },
      {
        status: 200,
        timingMs: Date.now() - startTime,
        timingName: 'get_inventory',
        extraHeaders: { 'x-storage-mode': db.mode },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch inventory';
    return jsonWithCors({ success: false, error: message }, { status: 500 });
  }
}
