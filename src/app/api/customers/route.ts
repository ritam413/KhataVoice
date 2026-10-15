import { NextRequest, NextResponse } from 'next/server';
import { handleOptions, jsonWithCors } from '../_helpers/cors';
import { getDbAdapter } from '@/lib/db/supabase';
import { DEFAULT_MERCHANT_ID } from '@/lib/db/seed-data';
import { Customer } from '@/types/domain';
import { getTrustTier } from '@/lib/trust/trust-engine';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get('merchantId') || req.headers.get('x-merchant-id') || DEFAULT_MERCHANT_ID;
    const filter = searchParams.get('filter') || 'all'; // 'all' | 'overdue' | 'gold' | 'silver' | 'bronze'
    const search = searchParams.get('search')?.toLowerCase().trim();

    const db = getDbAdapter();
    const customers: Customer[] = await db.getCustomers(merchantId);

    // Compute aggregates across all customers
    const totalCustomers = customers.length;
    let debtorsCount = 0;
    let totalOutstanding = 0;
    let sumTrustScore = 0;

    const enriched = customers.map((c) => {
      if (c.current_balance > 0) {
        debtorsCount++;
        totalOutstanding += c.current_balance;
      }
      sumTrustScore += c.trust_score;

      return {
        ...c,
        trust_badge: getTrustTier(c.trust_score),
        is_overdue: c.current_balance > 0,
      };
    });

    let filtered = enriched;
    if (filter === 'overdue') {
      filtered = filtered.filter((c) => c.current_balance > 0);
    } else if (['gold', 'silver', 'bronze'].includes(filter)) {
      filtered = filtered.filter((c) => c.trust_badge.toLowerCase() === filter);
    }

    if (search) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(search) ||
        c.phone.includes(search)
      );
    }

    const avgTrustScore = totalCustomers > 0 ? Math.round(sumTrustScore / totalCustomers) : 70;

    return jsonWithCors(
      {
        success: true,
        data: filtered,
        metrics: {
          total_customers: totalCustomers,
          filtered_count: filtered.length,
          debtors_count: debtorsCount,
          total_outstanding_udhaar: Math.round(totalOutstanding),
          avg_trust_score: avgTrustScore,
        },
      },
      {
        status: 200,
        timingMs: Date.now() - startTime,
        timingName: 'get_customers',
        extraHeaders: { 'x-storage-mode': db.mode },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch customers';
    return jsonWithCors({ success: false, error: message }, { status: 500 });
  }
}
