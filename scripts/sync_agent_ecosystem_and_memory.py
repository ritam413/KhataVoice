"""
Sync agent ecosystem and update AgentMemory for parallel multi-agent execution.
"""
import os
import shutil
from agentmemory import create_memory, search_memory

# 1. Scaffolding .agents/rules/session-init.md for 5-mode intent router
os.makedirs(".agents/rules", exist_ok=True)
os.makedirs(".agents/skills", exist_ok=True)

session_init_content = """# Multi-Agent Session Init & 5-Mode Intent Router

This repository operates under strict Multi-Agent parallel delegation rules.

## 5 Intent Archetypes & Skill Chains
1. **Fast Fix / Trivial**: Direct edit, /ponytail lite (<1 file modified)
2. **Feature Implementation**: /tdd -> /ponytail -> /10x-dev -> Gravitas verification
3. **Diagnostic & Hard Bug**: /diagnosing-bugs -> codegraph -> /tdd
4. **Architectural / Epic**: /council-review -> beads contract decomposition -> wayfinder
5. **UI Craft & Polish**: /awesome-design -> /taste -> /impeccable -> /animate -> /emil-design-eng

## Parallel Worker Partitions
- **Worker 1 (Architecture & UI)**: Owns `src/components/views/ArchitectureInspector.tsx`, `src/styles/architecture-inspector.module.css`.
- **Worker 2 (QA & Verification)**: Owns `tests/`, `scripts/verify-all.ts`, `tests/e2e/multilingual-flow.test.ts`.
- **Worker 3 (DevOps & Submission)**: Owns `vercel.json`, `Docs/pitch_video_script.md`, `Docs/demo_rehearsal_checklist.md`, `README.md`.
"""

with open(".agents/rules/session-init.md", "w", encoding="utf-8") as f:
    f.write(session_init_content)

print("Created .agents/rules/session-init.md")

# 2. Populate AgentMemory with latest state and parallel ticket contracts
memories_to_add = [
    {
        "category": "parallel_agent_contracts",
        "text": "Worker 1 (Architecture & UI) Contract: Implements KV-20 (Architecture & Scalability Inspector tab). Files owned: src/components/views/ArchitectureInspector.tsx, src/styles/architecture-inspector.module.css, TopBar tab integration. Must display live system health badges, SVG pipeline topology, Supabase RLS isolation notes, and pitch walkthrough checklist.",
        "metadata": {"ticket": "KV-20", "worker": "Worker-1", "phase": "Epic-5"}
    },
    {
        "category": "parallel_agent_contracts",
        "text": "Worker 2 (QA & Verification) Contract: Implements KV-21 (End-to-End Multilingual Verification Suite). Files owned: tests/unit/nlp-parser.test.ts, tests/unit/trust-score.test.ts, tests/e2e/multilingual-flow.test.ts, scripts/verify-all.ts. Must test all 4 dialects (Bengali, Hindi, Hinglish, English), ACID dual-sync rollback, and RFC 3986 UPI URL encoding.",
        "metadata": {"ticket": "KV-21", "worker": "Worker-2", "phase": "Epic-5"}
    },
    {
        "category": "parallel_agent_contracts",
        "text": "Worker 3 (DevOps & Pitch Assets) Contract: Implements KV-22 (Production Vercel Deployment & Pitch Assets). Files owned: vercel.json, Docs/pitch_video_script.md, Docs/demo_rehearsal_checklist.md, README.md. Must guarantee zero-crash public deployment, 5-minute timed script aligned with Ekansh Jain 4 judging criteria, and rehearsal checklist.",
        "metadata": {"ticket": "KV-22", "worker": "Worker-3", "phase": "Epic-5"}
    },
    {
        "category": "domain_invariants",
        "text": "Current State: KV-01 through KV-19 are 100% COMPLETE and PASSING all automated gates. The Next.js 14 App Router project builds cleanly (npm run build) with 11 pre-rendered dynamic routes, dual viewport simulator, Soundbox Web Audio harmonic bell, and live Supabase Realtime sync.",
        "metadata": {"source": "tracker.md", "status": "sprint_day_4"}
    }
]

for mem in memories_to_add:
    try:
        create_memory(
            category=mem["category"],
            text=mem["text"],
            metadata=mem["metadata"]
        )
        print(f"Memory recorded: {mem['text'][:60]}...")
    except Exception as e:
        print(f"Error recording memory: {e}")

from agentmemory import create_memory, get_memories

# Verify query
results = get_memories(category="parallel_agent_contracts")
print(f"Verified recall for parallel_agent_contracts: Retrieved {len(results)} memories.")
