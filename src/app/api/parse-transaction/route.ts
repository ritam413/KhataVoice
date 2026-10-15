import { NextRequest } from 'next/server';
import { parseTransaction } from '@/lib/nlp/parser-engine';
import { parseTransactionRegex } from '@/lib/nlp/regex-parser';
import { getDbAdapter } from '@/lib/db/supabase';
import { handleOptions, jsonWithCors } from '../_helpers/cors';
import type { Language } from '@/types/domain';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    let body: {
      transcript?: string;
      language?: Language;
      merchantId?: string;
    };

    try {
      body = await request.json();
    } catch {
      return jsonWithCors(
        {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Request body must be valid JSON',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const transcript = body?.transcript;
    const language = body?.language || 'bn';
    const merchantId = body?.merchantId || request.headers.get('x-merchant-id') || undefined;

    if (!transcript || typeof transcript !== 'string' || transcript.trim() === '') {
      return jsonWithCors(
        {
          success: false,
          error: {
            code: 'MISSING_TRANSCRIPT',
            message: 'Transcript string is required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Retrieve merchant inventory for catalog context matching
    let catalogContext;
    try {
      const db = getDbAdapter();
      catalogContext = await db.getInventory(merchantId);
    } catch (dbErr) {
      console.warn('[API /api/parse-transaction] Could not load catalog context from db, using defaults:', dbErr);
    }

    // Execute hybrid NLP parsing engine with zero-failure fallback cascade
    let parsedData;
    try {
      parsedData = await parseTransaction({
        transcript,
        language,
        merchantId,
        catalogContext,
      });
    } catch (parseErr) {
      console.warn('[API /api/parse-transaction] Primary NLP engine failed, engaging regex fallback:', parseErr);
      const fallbackResult = parseTransactionRegex(transcript, language);
      parsedData = {
        ...fallbackResult,
        engine: 'regex_fallback' as const,
        confidence: Math.max(fallbackResult.confidence * 0.85, 0.6),
      };
    }

    const elapsedMs = Date.now() - startTime;

    return jsonWithCors(
      {
        success: true,
        data: parsedData,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        timingMs: elapsedMs,
        timingName: 'parse',
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown NLP parsing error';
    console.error('[API /api/parse-transaction Error]:', message);

    return jsonWithCors(
      {
        success: false,
        error: {
          code: 'PARSING_ERROR',
          message,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
