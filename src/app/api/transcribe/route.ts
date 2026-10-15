import { NextRequest } from 'next/server';
import { transcribeAudio } from '@/lib/speech/speech-adapter';
import { handleOptions, jsonWithCors } from '../_helpers/cors';
import type { Language } from '@/types/domain';

// Maximum audio base64 payload size: 5MB binary (~6.8MB base64)
const MAX_PAYLOAD_BYTES = 5 * 1024 * 1024;
const MAX_BASE64_LENGTH = Math.ceil(MAX_PAYLOAD_BYTES * 1.37);

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Early Content-Length check to prevent memory exhaustion from oversized payloads
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BASE64_LENGTH + 1024) {
      return jsonWithCors(
        {
          success: false,
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: 'Audio payload exceeds maximum allowed size of 5MB',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 413 }
      );
    }

    let body: {
      audioBlobBase64?: string;
      audioBase64?: string;
      presetId?: string;
      language?: Language;
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

    const { presetId, language = 'bn' } = body;
    const audioData = body.audioBlobBase64 || body.audioBase64;

    // Validate payload size for base64 audio string
    if (audioData && audioData.length > MAX_BASE64_LENGTH) {
      return jsonWithCors(
        {
          success: false,
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: 'Audio payload exceeds maximum allowed size of 5MB',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 413 }
      );
    }

    // Must provide either presetId or audio base64
    if (!presetId && !audioData) {
      return jsonWithCors(
        {
          success: false,
          error: {
            code: 'MISSING_AUDIO_INPUT',
            message: 'Either presetId or audioBlobBase64 / audioBase64 must be provided',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Call unified speech adapter with fallback cascade
    const result = await transcribeAudio({
      audioBase64: audioData,
      presetId,
      language,
    });

    const elapsedMs = Date.now() - startTime;
    const duration = result.durationMs || elapsedMs;

    // Return dual-envelope response: satisfies both Ticket KV-08 contract and API design specification
    return jsonWithCors(
      {
        success: true,
        // Ticket KV-08 direct fields
        transcript: result.transcript,
        confidence: result.confidence,
        source: result.source,
        durationMs: duration,
        // Standard API envelope
        data: {
          transcript: result.transcript,
          language: result.language,
          engine: result.source,
          durationMs: duration,
          confidence: result.confidence,
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        timingMs: elapsedMs,
        timingName: 'transcribe',
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown transcription error';
    console.error('[API /api/transcribe Error]:', message);

    return jsonWithCors(
      {
        success: false,
        error: {
          code: 'TRANSCRIPTION_ERROR',
          message,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
