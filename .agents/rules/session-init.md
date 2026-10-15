# Multi-Agent Session Init & 5-Mode Intent Router

This repository operates under strict Multi-Agent parallel delegation rules with `/ponytail` and `/wshobson-agents` (ROLE: DEVELOPER) discipline.

## Core Developer Directives (/ponytail + /wshobson-agents)
1. **The Ponytail Ladder**: Speculative code skipped (YAGNI). Reuse existing helpers (`cn`, `tokens.module.css`, `useAppStore`, `dbAdapter`). Standard library and native platform primitives first.
2. **Zero Function Duplication**: Do not author duplicate formatters, badges, or math functions. Reuse what exists.
3. **Modular Componentization**: Break UI views into focused, reusable sub-components.
4. **Shortest Working Diff**: Write clean, robust, zero-bloat code with runnable checks.

## 5 Intent Archetypes & Skill Chains
1. **Fast Fix / Trivial**: Direct edit, /ponytail lite (<1 file modified)
2. **Feature Implementation**: /wshobson-agents (ROLE: DEVELOPER) -> /ponytail -> /10x-dev -> Gravitas verification
3. **Diagnostic & Hard Bug**: /diagnosing-bugs -> codegraph -> /tdd
4. **Architectural / Epic**: /council-review -> beads contract decomposition -> wayfinder
5. **UI Craft & Polish**: /awesome-design -> /taste -> /impeccable -> /animate -> /emil-design-eng

## Parallel Worker Partitions
- **Worker 1 (Architecture & UI)**: Owns `src/components/views/ArchitectureInspector.tsx`, `src/styles/architecture-inspector.module.css`.
- **Worker 2 (QA & Verification)**: Owns `tests/`, `scripts/verify-all.ts`, `tests/e2e/multilingual-flow.test.ts`.
- **Worker 3 (DevOps & Submission)**: Owns `vercel.json`, `Docs/pitch_video_script.md`, `Docs/demo_rehearsal_checklist.md`, `README.md`.
