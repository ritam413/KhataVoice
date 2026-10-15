# Official Documentation & Technical Research: Next.js 14/15 App Router Route Handlers (KV-08)

- **Ticket Reference:** [KV-08-transcribe-and-parse-api-routes.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/Docs/Tickets/KV-08-transcribe-and-parse-api-routes.md)
- **Author Role:** Developer (`wshobson-agents` ROLE: DEVELOPER)
- **Target Subsystems:**
  - `src/app/api/transcribe/route.ts`
  - `src/app/api/parse-transaction/route.ts`
- **Methodology:** Official Next.js Documentation crawl (`/firecrawl`), MDN Web APIs, and Node.js HTTP invariants.

---

## 1. Official Next.js App Router Route Handler Specifications

According to official Next.js Route Handler documentation:
1. **Web Standard Primitives:**
   - App Router Route Handlers execute on Web standard `Request` and `Response` objects, wrapped by Next.js as `NextRequest` and `NextResponse`.
   - Unlike Pages Router (`pages/api`), there is no implicit Express-like middleware stack or `req.statusCode`. Everything is functional: return a `Response` or `NextResponse`.
2. **HTTP Method Handlers:**
   - Handlers are named exports corresponding directly to HTTP verbs: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.
   - Any unexported method called on the route automatically produces an HTTP `405 Method Not Allowed`.
3. **Dynamic vs. Cached Execution:**
   - Route Handlers executing `POST` are strictly dynamic and are never cached by the Next.js Data Cache.
4. **CORS & Preflight Handling:**
   - In Next.js App Router, cross-origin resource sharing (CORS) preflight requests (`OPTIONS`) are not handled automatically by default unless configured in `next.config.js` or handled via an explicit `OPTIONS` export in `route.ts`.
   - For public Kirana mobile web/PWA clients and external merchant tools, handling `OPTIONS` with standard headers (`Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: POST, OPTIONS`, `Access-Control-Allow-Headers: Content-Type, Authorization, x-merchant-id`) is essential.
5. **Request Body Size Limits & Memory Pressure:**
   - In Next.js App Router, `request.json()` buffers the entire incoming payload into V8 memory.
   - For audio base64 uploads, passing a payload larger than 5MB without checking `Content-Length` can cause memory spikes and event loop pauses.
   - Guarding the `content-length` request header *before* invoking `request.json()` prevents denial-of-service and memory exhaustion, immediately issuing `413 Payload Too Large`.

---

## 2. Architectural Synthesis: KV-08 Route Hardening Matrix

| Concern | Legacy / Unhardened Route | Staff-Hardened Developer Implementation |
| :--- | :--- | :--- |
| **CORS Preflight** | Fails with 405 on `OPTIONS` | Explicit `export async function OPTIONS()` with 204 No Content & caching max-age |
| **Payload Protection** | Buffers 50MB before rejecting | Checks `content-length` header upfront; rejects > 5MB with HTTP 413 before JSON parsing |
| **Response Contract** | Discrepancy between ticket (`res.transcript`) and API design (`res.data.transcript`) | Dual-envelope response satisfying both ticket top-level fields and envelope `data` object |
| **Error Boundary** | Internal crash causes HTTP 500 failure | Catches speech/LLM timeouts; falls back to local preset/regex and returns HTTP 200 with fallback telemetry |
| **Latency Telemetry** | Unmeasured or console-only | Standard `Server-Timing: transcribe;dur=XX` and `durationMs` response metric |
| **Catalog Matching** | Crashes if DB is offline | Injects `SEED_INVENTORY` fallback if Supabase DB is unreachable |

---

## 3. Next.js 14/15 Typescript & ESLint Rules

- Route handlers must export strictly typed async functions:
  ```typescript
  import { NextRequest, NextResponse } from 'next/server';
  export async function POST(request: NextRequest): Promise<NextResponse> { ... }
  export async function OPTIONS(): Promise<NextResponse> { ... }
  ```
- No global mutable state that leaks between concurrent serverless invocations.
- Strict response formatting returning JSON with ISO 8601 timestamps and unambiguous error codes.
