"""
Append new episodic memory and domain invariants to AgentMemory for KhataVoice.
"""

from agentmemory import create_memory

memories = [
    {
        "category": "architectural_decisions",
        "text": "Frontend stack is Next.js 14.2.15 App Router + React 18.3.1 + TypeScript strict mode + Tailwind CSS v3 (v3.4) + shadcn/ui (Radix UI primitives). Uses /pick-ui-library recommendations: sonner for toasts, @number-flow/react for sliding currency counters, cmdk for ⌘K palette. First Load JS is 87.2kB (< 180kB budget).",
        "metadata": {"source": "RESEARCH-KV-01-SCAFFOLD-TAILWIND-SHADCN", "domain": "frontend_stack"}
    },
    {
        "category": "debugging_breakthroughs",
        "text": "Windows PowerShell npm execution issue resolved: In Windows PowerShell, calling 'npm' runs 'npm.ps1' which blocks/buffers non-interactive child process pipes. Must always invoke 'npm.cmd' directly. Additionally, .npmrc is configured with 'registry=https://registry.yarnpkg.com/' which provides Cloudflare edge CDN response times (750ms) compared to 10s+ latency on registry.npmjs.org.",
        "metadata": {"source": "tracker.md", "domain": "windows_toolchain"}
    },
    {
        "category": "domain_invariants",
        "text": "Zero-Crash Boot Guarantee: Application layout (src/app/layout.tsx) and page shell (src/app/page.tsx) must compile with 0 errors on 'npm.cmd run type-check' and 'npm.cmd run build' even with no environment variables or .env.local file present.",
        "metadata": {"source": "KV-01-scaffold-nextjs-app.md", "domain": "build_resilience"}
    },
    {
        "category": "domain_invariants",
        "text": "Core domain entities live in src/types/domain.ts: Customer (current_balance, trust_score 0-100, trust_badge GOLD/SILVER/BRONZE), InventoryItem (current_stock, unit, unit_price, cost_price), LedgerEntry, DualSyncPayload, DualSyncResponse.",
        "metadata": {"source": "src/types/domain.ts", "domain": "data_contracts"}
    },
    {
        "category": "beads_tickets",
        "text": "KV-01 (Scaffold Next.js App) is fully IMPLEMENTED and VERIFIED. Next unblocked frontier ticket is KV-02: Supabase DDL, RLS policies, isomorphic client, and in-memory local fallback store (src/lib/db/supabase.ts and src/lib/db/local-fallback.ts).",
        "metadata": {"source": "Docs/Tickets/README.md", "ticket": "KV-01", "status": "completed"}
    }
]

for mem in memories:
    try:
        create_memory(
            category=mem["category"],
            text=mem["text"],
            metadata=mem["metadata"]
        )
        print(f"Stored memory in {mem['category']}: {mem['text'][:60]}...")
    except Exception as e:
        print(f"Error storing memory: {e}")

print("AgentMemory update complete.")
