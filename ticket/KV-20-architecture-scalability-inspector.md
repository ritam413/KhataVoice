# KV-20: Architecture & Scalability Inspector Tab with Topology Visualizer & Fallback Matrix

- **Epic:** Epic 5: Judge Suite, Testing & Launch
- **Priority:** P1
- **Story Points:** 3 SP
- **Upstream Dependencies:** KV-01
- **Downstream Blockers:** KV-21
- **Target Files:**
  - `src/components/views/ArchitectureInspector.tsx`
  - `src/styles/architecture-inspector.module.css`

---

## 1. Architectural Role & Objective
Implement the embedded Architecture & Scalability Inspector view. Directly addresses the 25% "Technical Execution" criteria and enables judges to inspect the internal plumbing, multi-tier fallback pathways, database tenancy models, and horizontal scalability guarantees directly inside the running app without having to dig through raw repository files.

---

## 2. Input Contract & Pre-Conditions
- Architectural specs from `techspec.md`, `architecture_graph.md`, and `database_schema.md`.
- Live system status metrics (Active DB adapter mode: Cloud Supabase vs. Local Fallback, Active Speech engine, Active NLP engine).

---

## 3. State Invariants & Hardening Guards
- **Live System Health Inspection:** Display real-time status badges showing whether Supabase, Web Speech, and Ollama/Gemini are active or operating in fallback mode.
- **Visual Diagram Clarity:** Render clear, responsive architecture topology schematics explaining client-server flow, ACID stored procedure boundary, and zero-cost WhatsApp routing.

---

## 4. Implementation Details

### 4.1 UI Sections
1. **Live Environment Status Banner:**
   - Database: `Cloud Supabase (PostgreSQL)` or `In-Memory Fallback (Pre-Seeded)`.
   - Speech Recognition: `Web Speech API (Ready) | Bhashini Proxy (Configured) | Presets (Active)`.
   - NLP Engine: `Ollama Local (Ready) | Heuristic Regex Fallback (Active)`.
2. **Interactive Topology Visualizer:**
   - Tabs: "End-to-End Pipeline", "Dual-Sync ACID Boundary", "Zero-Config Fallback Matrix".
   - Shows step-by-step latency breakdown ($1200\text{ms}$ voice to committed state).
3. **Multi-Tenant Scalability Explanation:**
   - Explains Supabase Row-Level Security (RLS) data isolation by `merchant_id`.
   - Explains connection pooling and read replicas for scaling to 50,000+ Kirana shops.
4. **5-Minute Pitch Presentation Guide:**
   - Embedded bullet points for recording the hackathon video (Problem, Solution, Tech Architecture, Unit Economics, Roadmap).

---

## 5. Behavior-Driven Specification (Given / When / Then)

### Scenario 1: Fallback Mode Indication
- **Given:** App is running without external API keys.
- **When:** Judge opens the Architecture Inspector tab.
- **Then:** Status card highlights "Zero-Config Fallback Engine Active (100% Operational)" with green checkmarks.

---

## 6. Automated Verification Gates
```bash
# Typecheck ArchitectureInspector
npx tsc --noEmit src/components/views/ArchitectureInspector.tsx
```
