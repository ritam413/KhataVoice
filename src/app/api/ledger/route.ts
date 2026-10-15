import { NextRequest, NextResponse } from 'next/server';
import { handleOptions, jsonWithCors } from '../_helpers/cors';
import { getDbAdapter } from '@/lib/db/supabase';
import { DEFAULT_MERCHANT_ID } from '@/lib/db/seed-data';
import { LedgerEntry } from '@/types/domain';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get('merchantId') || req.headers.get('x-merchant-id') || DEFAULT_MERCHANT_ID;
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50));
    const search = searchParams.get('search')?.toLowerCase().trim();

    const db = getDbAdapter();
    let entries: LedgerEntry[] = await db.getLedgerEntries(merchantId, limit);

    if (search) {
      entries = entries.filter((e) =>
        (e.customer_name?.toLowerCase().includes(search)) ||
        (e.raw_transcript?.toLowerCase().includes(search)) ||
        e.items_summary.some((i) => i.name.toLowerCase().includes(search))
      );
    }

    // Compute aggregates
    let totalUdhaarSales = 0;
    let totalCashSales = 0;
    let totalPaymentsReceived = 0;

    for (const e of entries) {
      if (e.transaction_type === 'udhaar_sale') {
        totalUdhaarSales += e.amount;
      } else if (e.transaction_type === 'cash_sale') {
        totalCashSales += e.amount;
      } else if (e.transaction_type === 'payment_received') {
        totalPaymentsReceived += e.amount;
      }
    }

    return jsonWithCors(
      {
        success: true,
        data: entries,
        metrics: {
          total_entries: entries.length,
          total_udhaar_sales: totalUdhaarSales,
          total_cash_sales: totalCashSales,
          total_payments_received: totalPaymentsReceived,
        },
      },
      {
        status: 200,
        timingMs: Date.now() - startTime,
        timingName: 'get_ledger',
        extraHeaders: { 'x-storage-mode': db.mode },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch ledger';
    return jsonWithCors({ success: false, error: message }, { status: 500 });
  }
}
