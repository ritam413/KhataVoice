import { NextRequest, NextResponse } from 'next/server';
import { handleOptions, jsonWithCors } from '../_helpers/cors';
import { getDbAdapter } from '@/lib/db/supabase';
import { DEFAULT_MERCHANT_ID } from '@/lib/db/seed-data';
import { DualSyncRequest, DualSyncApiResponse } from '@/types/api';
import { DualSyncPayload } from '@/types/domain';
import {
  checkTransactionLock,
  acquireTransactionLock,
  completeTransactionLock,
  releaseTransactionLock,
} from '@/lib/sync/mutex-lock';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(req: NextRequest): Promise<NextResponse<DualSyncApiResponse>> {
  const startTime = Date.now();

  try {
    const body: DualSyncRequest = await req.json();

    // 1. Validation
    const amount = Number(body.amount);
    if (isNaN(amount) || amount < 0) {
      return jsonWithCors(
        { success: false, error: 'Amount must be a non-negative number' },
        { status: 400 }
      );
    }

    const validTypes = ['udhaar_sale', 'cash_sale', 'restock', 'payment_received'];
    if (!validTypes.includes(body.transaction_type)) {
      return jsonWithCors(
        { success: false, error: `Invalid transaction_type: "${body.transaction_type}"` },
        { status: 400 }
      );
    }

    const merchantId = body.merchant_id || req.headers.get('x-merchant-id') || DEFAULT_MERCHANT_ID;

    // 2. Idempotency & Concurrency Mutex Lock
    const idempotencyKey =
      body.idempotency_key?.trim() ||
      `${merchantId}:${(body.customer_name || 'store').trim()}:${amount}:${body.transaction_type}:${body.raw_transcript?.slice(0, 30) || ''}`;

    const lockStatus = checkTransactionLock(idempotencyKey);
    if (lockStatus.isLocked) {
      if (lockStatus.status === 'completed' && lockStatus.cachedResult) {
        // Return previously committed response for deduplication
        return jsonWithCors(
          {
            success: true,
            data: lockStatus.cachedResult,
            is_duplicate: true,
          },
          {
            status: 200,
            timingMs: Date.now() - startTime,
            timingName: 'dual_sync_idempotent',
            extraHeaders: { 'x-idempotent-replay': 'true' },
          }
        );
      }

      // In-flight request currently processing
      return jsonWithCors(
        {
          success: false,
          error: 'Duplicate transaction is currently in progress. Please wait.',
        },
        { status: 409 }
      );
    }

    // Acquire lock
    if (!acquireTransactionLock(idempotencyKey)) {
      return jsonWithCors(
        {
          success: false,
          error: 'Failed to acquire concurrency lock.',
        },
        { status: 409 }
      );
    }

    try {
      // 3. Prepare DualSyncPayload
      const payload: DualSyncPayload = {
        merchant_id: merchantId,
        customer_name: body.customer_name?.trim(),
        customer_phone: body.customer_phone?.trim(),
        transaction_type: body.transaction_type,
        amount,
        items: (body.items || []).map((item) => ({
          item_id: item.item_id,
          name: item.name,
          quantity: Number(item.quantity) || 1,
          unit: item.unit || 'piece',
          unit_price: Number(item.unit_price ?? item.price ?? 0),
        })),
        raw_transcript: body.raw_transcript,
        language: body.language || 'bn',
      };

      // 4. Dispatch to Database Adapter (Supabase Cloud or Local Fallback)
      const db = getDbAdapter();
      const result = await db.executeDualSync(payload);

      // Cache result and complete lock
      completeTransactionLock(idempotencyKey, result);

      const durationMs = Date.now() - startTime;
      return jsonWithCors(
        {
          success: true,
          data: result,
        },
        {
          status: 200,
          timingMs: durationMs,
          timingName: 'dual_sync',
          extraHeaders: {
            'x-storage-mode': db.mode,
          },
        }
      );
    } catch (execError: unknown) {
      releaseTransactionLock(idempotencyKey);
      throw execError;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return jsonWithCors(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
