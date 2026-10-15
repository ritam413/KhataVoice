import { NextResponse } from 'next/server';

export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-merchant-id',
  'Access-Control-Max-Age': '86400',
};

/**
 * Standard OPTIONS handler for CORS preflight requests
 */
export function handleOptions(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * Wraps a NextResponse with standard CORS headers and optional Server-Timing
 */
export function jsonWithCors<T>(
  data: T,
  init?: {
    status?: number;
    timingMs?: number;
    timingName?: string;
    extraHeaders?: Record<string, string>;
  }
): NextResponse<T> {
  const headers: Record<string, string> = {
    ...CORS_HEADERS,
    ...(init?.extraHeaders || {}),
  };

  if (init?.timingMs !== undefined && init?.timingName) {
    headers['Server-Timing'] = `${init.timingName};dur=${init.timingMs}`;
  }

  return NextResponse.json(data, {
    status: init?.status ?? 200,
    headers,
  });
}
