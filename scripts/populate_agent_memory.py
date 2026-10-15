"""
Populate AgentMemory with KhataVoice Domain Invariants, Architectural Specifications,
Database Schemas, API Specs, Unit Economics, and Implemented UI/DB Milestones.
"""

from agentmemory import create_memory, wipe_category

# Categories to populate
categories = [
    "domain_invariants",
    "architectural_decisions",
    "database_schemas",
    "api_specifications",
    "unit_economics",
    "rules_and_constraints",
    "personas_and_journeys",
    "implemented_milestones"
]

for cat in categories:
    try:
        wipe_category(cat)
    except Exception as e:
        print(f"Notice on wiping {cat}: {e}")

memories = [
    # ==========================================
    # 1. DOMAIN INVARIANTS
    # ==========================================
    {
        "category": "domain_invariants",
        "text": "KhataVoice is a voice-first, multilingual AI credit ledger and inventory management platform for India's 13-15M Kirana stores. It solves the typing barrier by enabling spoken entries in Bengali, Hindi, Hinglish, and English, executing an atomic dual-sync of credit ledger and stock count within 1.2s.",
        "metadata": {"source": "prd.md", "domain": "core_value_prop"}
    },
    {
        "category": "domain_invariants",
        "text": "The Credit Trust Score is a dynamic algorithmic metric from 0 to 100 calculated as: Trust Score = round(0.40 * Velocity + 0.30 * (100 - Overdue_Ratio) + 0.15 * Frequency + 0.15 * Dispute_History). Badges: Gold (85-100, prompt tab up to ₹3,500), Silver (65-84, standard regular up to ₹1,500), Bronze/At-Risk (<65, default risk capped at ₹250).",
        "metadata": {"source": "rules.md", "domain": "credit_trust_score"}
    },
    {
        "category": "domain_invariants",
        "text": "WhatsApp Debt Recovery uses native browser URI intent schemes: https://wa.me/{phone}?text={encoded_message} with embedded UPI deep links (upi://pay?pa={upi_id}&pn={store_name}&am={amount}&cu=INR). This incurs ₹0.00 Meta Cloud API fees and bypasses business approval hurdles.",
        "metadata": {"source": "techspec.md", "domain": "whatsapp_recovery"}
    },
    {
        "category": "domain_invariants",
        "text": "Design system is 'Bharat Modern' Fintech: Deep slate background (#090D16), container obsidian (#121826), Bharat Saffron (#FF7700), Emerald Green (#10B981), Amber (#F59E0B), Crimson (#EF4444). Enforces minimum 48px touch targets, 80px voiceHero mic, WCAG 2.1 AAA contrast on saffron (dark text #0B0F19 for 7.20:1 contrast).",
        "metadata": {"source": "design.md", "domain": "design_system"}
    },

    # ==========================================
    # 2. ARCHITECTURAL DECISIONS
    # ==========================================
    {
        "category": "architectural_decisions",
        "text": "Primary database is Supabase (PostgreSQL) featuring Row-Level Security (RLS) for multi-tenant isolation, Supabase Realtime channels on ledger_entries, customers, and inventory_items, and IDatabaseAdapter abstraction with zero-crash in-memory local fallback store (localStore) for instant offline execution without API keys.",
        "metadata": {"source": "backend.md", "domain": "database_choice"}
    },
    {
        "category": "architectural_decisions",
        "text": "Frontend stack is Next.js 14 App Router + TypeScript strict + Tailwind CSS v3.4 + Radix UI headless primitives + CVA + Sonner + Lucide React. Strict Zero-Pill geometry: 10px button/input radius, 16px card radius, 20px dialog radius with backdrop blur.",
        "metadata": {"source": "frontend.md", "domain": "frontend_stack"}
    },
    {
        "category": "architectural_decisions",
        "text": "Speech-to-Text uses a Tri-Tier Speech Adapter: Tier 1 Client-Side Web Speech API (zero latency, zero API keys), Tier 2 Server-Side Bhashini Dhruva ASR Pipeline compute endpoint (16kHz WAV mono, Bengali bn, Hindi hi, English en), Tier 3 1-Click Kirana Audio Sample Presets for 100% fail-safe hackathon video recording takes.",
        "metadata": {"source": "techspec.md", "domain": "speech_architecture"}
    },
    {
        "category": "architectural_decisions",
        "text": "NLP Entity Extraction uses a Hybrid Architecture: Primary parser calls Ollama local LLM or Cloud Gemini/Groq in JSON mode with store catalog context. If LLM times out (>1.2s) or fails, it transparently falls back to a built-in deterministic phonetic regex engine executing in <15ms with zero API keys.",
        "metadata": {"source": "backend.md", "domain": "nlp_hybrid"}
    },

    # ==========================================
    # 3. DATABASE SCHEMAS & MODELS
    # ==========================================
    {
        "category": "database_schemas",
        "text": "Supabase Relational Tables: merchants, customers, inventory_items, ledger_entries, stock_movements, reminder_logs. Seeded with authentic Kolkata Kirana data: Ramesh Babu ('Maa Tara Variety Stores', Shyambazar), 6 customers (Shyam Sundar Das, Rohit Gupta, Sunita Devi, Amit Das, Rajesh Mondal, Priya Sen), 10 inventory items, and 4 initial ledger records.",
        "metadata": {"source": "database_schema.md", "domain": "relational_tables"}
    },
    {
        "category": "database_schemas",
        "text": "Atomic PostgreSQL Stored Procedure: execute_spoken_dual_sync finds/creates customer, inserts ledger_entry, adjusts balance, recalculates Trust Score, updates item stock, and records stock_movements within a single ACID transaction block with non-blocking negative inventory override.",
        "metadata": {"source": "database_schema.md", "domain": "atomic_rpc"}
    },

    # ==========================================
    # 4. API SPECIFICATIONS
    # ==========================================
    {
        "category": "api_specifications",
        "text": "KhataVoice REST API Route Handlers: 1) POST /api/transcribe (audioBase64, language bn/hi/en), 2) POST /api/parse-transaction (transcript, language -> customer_name, amount, type, items), 3) POST /api/dual-sync (atomic ledger + inventory write), 4) GET /api/ledger, 5) GET /api/inventory, 6) POST /api/reminders/generate, 7) GET /api/business-metrics.",
        "metadata": {"source": "api_design.md", "domain": "route_handlers"}
    },

    # ==========================================
    # 5. UNIT ECONOMICS & BUSINESS MODEL
    # ==========================================
    {
        "category": "unit_economics",
        "text": "Unit Economics Model: Cost per spoken entry is ₹0.10 (ASR ₹0.04 + LLM ₹0.04 + Serverless DB ₹0.02; WhatsApp is ₹0.00). Pro Kirana SaaS subscription is ₹199/month (or ₹1,999/year). At 80 voice entries/day (2,400/mo = ₹240 API cost), gross margin is 78.4%. Average store recovers ₹2,160/month in previously lost working capital, generating a 10.8x payback ROI.",
        "metadata": {"source": "prd.md", "domain": "unit_economics"}
    },
    {
        "category": "unit_economics",
        "text": "Market Opportunity: India has 13.5M Kirana stores; 50% customers buy on udhaar; ₹10,000-₹50,000 working capital locked per store; ₹20 Lakh Crore ($240B) informal credit gap. Next Founders Hackathon Judge: Ekansh Jain (LUMA Youth Co-Founder), evaluates Viable Business (25%), Technical Execution (25%), Innovation (25%), Communication (25%).",
        "metadata": {"source": "context.md", "domain": "market_and_judge"}
    },

    # ==========================================
    # 6. RULES & CONSTRAINTS
    # ==========================================
    {
        "category": "rules_and_constraints",
        "text": "WhatsApp Rate Limiting & Anti-Spam: Max 1 reminder every 4 days per customer. Zero auto-blasting; merchant must explicitly review and tap send. Tone policy: Gold customers never receive Firm copy; Bronze defaulters (>30 days overdue) default to Firm copy. Every reminder must include valid upi://pay link.",
        "metadata": {"source": "rules.md", "domain": "anti_spam"}
    },
    {
        "category": "rules_and_constraints",
        "text": "Dual-Sync Inventory Integrity: Negative stock does not block transaction during counter rush, but sounds alert and marks item as CRIMSON: DEPLETED / OVER-SOLD. 5-second undo grace window allows merchant to rollback entry via toast. Code-mixed speech (e.g. 'Fortune oil 2 packet dao') parsed without failure.",
        "metadata": {"source": "rules.md", "domain": "inventory_rules"}
    },

    # ==========================================
    # 7. IMPLEMENTED MILESTONES (EPIC 1 COMPLETE)
    # ==========================================
    {
        "category": "implemented_milestones",
        "text": "KV-01 Complete: Full-stack Next.js 14.2 App Router scaffolded with strict TypeScript, Tailwind CSS v3.4, components.json, domain types in src/types/domain.ts, and Zero-Crash Boot Guarantee.",
        "metadata": {"ticket": "KV-01", "status": "VERIFIED"}
    },
    {
        "category": "implemented_milestones",
        "text": "KV-02 Complete: Supabase PostgreSQL DDL migration, Database TypeScript interfaces, Kolkata Kirana seed dataset, thread-safe LocalFallbackStore, and IDatabaseAdapter dispatcher with transparent zero-config failover.",
        "metadata": {"ticket": "KV-02", "status": "VERIFIED"}
    },
    {
        "category": "implemented_milestones",
        "text": "KV-03 Complete: Bharat Modern design token module (src/styles/tokens.module.css), CSS reset, Plus Jakarta Sans + Noto Sans Bengali/Devanagari variable fonts, tabular nums, and WCAG 2.1 AAA contrast invariant (7.20:1 dark text on Saffron).",
        "metadata": {"ticket": "KV-03", "status": "VERIFIED"}
    },
    {
        "category": "implemented_milestones",
        "text": "KV-04 Complete: 8 atomic UI primitives in src/components/ui/ (Button, Badge, TrustBadge, Card, Dialog, Progress, Input, Sonner Toaster). 48px touch targets, deterministic TrustBadge score-to-tier mapping, 23/23 automated verification tests passed, 97.5kB JS production build verified.",
        "metadata": {"ticket": "KV-04", "status": "VERIFIED"}
    },
    {
        "category": "implemented_milestones",
        "text": "KV-05 Complete: Tri-Tier Speech Recognition Adapter in src/lib/speech/ (audio-presets.ts, web-speech.ts, speech-adapter.ts, src/types/speech.ts). Features 6 authentic Kirana audio presets, pure stdlib 16-bit mono PCM WAV base64 sound synthesizer, Web Speech API controller with bn-IN/hi-IN/en-IN locales and hardware microphone track cleanup (stopMediaStream), Bhashini Dhruva ASR proxy caller with 4s timeout, <50ms preset SLA (measured 1ms), and 44/44 automated verification tests passed.",
        "metadata": {"ticket": "KV-05", "status": "VERIFIED"}
    }
]

for mem in memories:
    m_id = create_memory(
        category=mem["category"],
        text=mem["text"],
        metadata=mem["metadata"]
    )
    print(f"Stored [{mem['category']}] -> {m_id}")

print(f"\nSuccessfully populated {len(memories)} persistent memories across {len(categories)} categories!")
