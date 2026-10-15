import { NextRequest, NextResponse } from 'next/server';
import { handleOptions, jsonWithCors } from '../../_helpers/cors';
import { generateReminderDraft } from '@/lib/whatsapp/reminder-engine';
import { ReminderApiResponse, ReminderDraftParams } from '@/types/whatsapp';
import { SEED_MERCHANT } from '@/lib/db/seed-data';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(req: NextRequest): Promise<NextResponse<ReminderApiResponse>> {
  const startTime = Date.now();

  try {
    const body: Partial<ReminderDraftParams> = await req.json();

    if (!body.customerName || typeof body.customerName !== 'string') {
      return jsonWithCors(
        { success: false, error: 'Customer name is required' },
        { status: 400 }
      );
    }

    const balance = Number(body.balance);
    if (isNaN(balance) || balance <= 0) {
      return jsonWithCors(
        { success: false, error: 'Balance must be a positive number greater than 0' },
        { status: 400 }
      );
    }

    const params: ReminderDraftParams = {
      customerName: body.customerName.trim(),
      customerPhone: (body.customerPhone || '9876543210').trim(),
      balance,
      tone: body.tone || 'polite',
      language: body.language || 'bn',
      merchantStoreName: body.merchantStoreName?.trim() || SEED_MERCHANT.business_name,
      merchantUpiVpa: body.merchantUpiVpa?.trim() || SEED_MERCHANT.upi_id,
      lastPurchaseDate: body.lastPurchaseDate,
      daysOverdue: body.daysOverdue,
    };

    const draft = generateReminderDraft(params);

    return jsonWithCors(
      {
        success: true,
        draft,
      },
      {
        status: 200,
        timingMs: Date.now() - startTime,
        timingName: 'reminder_generate',
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate reminder draft';
    return jsonWithCors(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
