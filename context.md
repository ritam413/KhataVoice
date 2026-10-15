# Project Context: KhataVoice (Next Founders Hackathon)

## Project Overview
**KhataVoice** is an AI-powered, multilingual voice-first ledger, inventory manager, and credit (udhaar) recovery platform designed for India's 13–15 million neighborhood Kirana shopkeepers. 

Instead of typing or maintaining paper *bahi-khata* notebooks, the shopkeeper simply speaks a transaction in their local language (Bengali, Hindi, Hinglish, or English). KhataVoice transcribes the audio, parses it into structured data, updates the credit ledger and store inventory simultaneously, calculates a dynamic **Customer Credit Trust Score (0–100)**, and drafts culturally polite repayment reminder messages ready to send via WhatsApp (`wa.me`).

## Core Value Proposition & Positioning
- **The Core Outcome:** We sell **repaid credit and unlocked working capital**, not just speech recognition.
- **The Wedge:** Spoken entry removes the data-entry barrier for busy shop owners; the credit trust score and 1-tap WhatsApp reminders solve the awkwardness and delay of chasing debts.
- **The Dual-Update Engine:** A single voice entry updates both the **Udhaar Ledger** and the **Store Inventory** in real time.

## Target Hackathon Context
- **Event:** Next Founders Hackathon ([Devpost](https://next-founders.devpost.com/))
- **Deadline:** October 16, 2026 @ 2:30 AM GMT+5:30 (~4 days build sprint)
- **Judge Profile:** Ekansh Jain (Co-Founder & Co-Executive Director of LUMA Youth, entrepreneurship nonprofit). Values viable business models, user empathy, real unit economics, and clean execution over toy AI wrappers.
- **Judging Rubric (25% each):**
  1. Technical Execution (working app, solid architecture, live public deployment)
  2. Innovation & UX (original dual-entry voice UX, multilingual cultural sensitivity)
  3. Business & Finance (clear unit economics, subscription tiers, CAC/LTV, credit gap)
  4. Communication (5-minute video answering Problem, Build, Demo, Scalability)

## Target Interface & UX Strategy
- **Dual-Mode Responsive Design:** Built mobile-first to emulate an authentic Kirana shopkeeper's smartphone experience (1-tap mic, oversized buttons, high-contrast vernacular typography), while gracefully scaling on tablets and laptops into an expansive Merchant Command Center with live inventory tables, customer credit ledger analytics, and financial reporting. Features an interactive "Phone View vs. Desktop Command Center" switcher.
- **Visual Design Identity:** "Bharat Modern" Fintech Aesthetic (deep sleek dark/light theme, energetic saffron (#FF7700 / #FF9933) and emerald (#10B981) accents, live audio wave visualizer, Gold/Silver/Bronze Trust Badges, Plus Jakarta Sans typography).
- **Full-Stack Implementation:** Built with Next.js 14/15 (App Router) + TypeScript + Tailwind CSS v3 + shadcn/ui (Radix UI primitives, CVA, Sonner, Lucide). Uses **Zustand v5** (`zustand@^5.0.15`) for high-performance slice-based global state management (`useAppStore`) with granular selector subscriptions, coordinating the dual viewport simulator, voice recording lifecycle, and real-time ledger/inventory feeds without re-render thrashing. Uses **Supabase (PostgreSQL)** with Row-Level Security (RLS) and Supabase Realtime for live multi-device store updates, paired with a resilient local fallback mode for zero-setup execution.

## Speech Recognition & NLP Processing Architecture
1. **Dual-Engine Auto-Adaptive Speech Adapter:**
   - Client-side: Native Web Speech API (instant transcription in Bengali, Hindi, English without API keys or latency).
   - Server-side: Bhashini Dhruva ASR Pipeline proxy (`https://dhruva-api.bhashini.gov.in/services/inference/pipeline`) with fallback to OpenAI Whisper / Sarvam AI.
   - 1-Click Audio Sample Presets: Pre-recorded realistic Kirana spoken entries for 100% reliable 5-minute hackathon video recording takes.
2. **Hybrid Transaction Parser:**
   - Primary Engine: Local Ollama (`http://localhost:11434`) / Cloud LLMs (Gemini, Groq, OpenAI) structured JSON parser with shop catalog matching.
   - Zero-Key Built-in Heuristic Fallback Engine: Fast regex and phonetic/token dictionary parser that extracts customer name, amount, items, quantity, and transaction type (Udhaar Sale, Cash Sale, Purchase/Restock, Debt Payment) completely offline without any API keys.

## Credit Recovery & Trust Engine
1. **Kirana Credit Trust Score (0–100):**
   - Algorithmic formula based on turnaround velocity (days to repay), overdue ratio, transaction frequency, and dispute history.
   - Tiered Trust Badges: Gold (85-100), Silver (65-84), Bronze/At-Risk (<65).
2. **Multilingual Cultural WhatsApp Reminders:**
   - 1-Click generation via `wa.me/<phone>?text=...` schemes (zero WhatsApp API cost).
   - 3 selectable cultural tones: Polite Gentle, Friendly Follow-up, Firm Overdue.
   - Available in Bengali, Hindi, and English with embedded UPI payment link (`upi://pay?pa=...`).
3. **Simultaneous Dual-Sync:** Spoken entries atomically update both customer credit balance and item inventory count.

## Embedded Judge Tour & Business Engine
- **Interactive Unit Economics & ROI Calculator:** Live sliders demonstrating ₹0.11 cost-per-entry, ₹199/month Pro Kirana subscription, 78% gross margin, and ₹15,000+ stuck capital unlocked per store.
- **Architecture & Scalability Inspector:** Visual tab explaining tenant separation, API adapters, and horizontally scalable cloud architecture for the 5-minute video walkthrough.

## Unit Economics & Business Model
- **Cost per Voice Entry:** ₹0.08 - ₹0.15 (ASR + LLM structured JSON generation).
- **Merchant Monetization:**
  - Free Tier: Basic voice ledger (up to 50 entries/month).
  - Pro Kirana Tier (₹149 - ₹299/month): Unlimited voice transactions, automated multilingual WhatsApp reminders, Credit Trust Score, inventory low-stock alerts.
  - Future B2B / Fintech: Anonymized credit scoring data for distributor trade credit & micro-working capital loans.

## Canonical Documentation & Blueprint Index
The comprehensive architectural, product, and engineering specifications are codified in the following repository files:
- [prd.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/prd.md): Product Requirements Document, executive summary, problem statement, OKRs, and economics.
- [features_moscow.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/features_moscow.md): MoSCoW feature prioritization and sprint execution plan.
- [persona.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/persona.md): Detailed user personas (Kirana owners, customers, and hackathon judge Ekansh Jain).
- [user_journey.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/user_journey.md): End-to-end user experience maps, emotional curves, and touchpoints.
- [information_architecture.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/information_architecture.md): Site map, navigation hierarchy, data flow, and visual weight.
- [techspec.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/techspec.md): Technical specification of speech pipelines, NLP parsing, dual-sync, and storage.
- [features_implemented.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/features_implemented.md): Current functionality status and implementation matrix.
- [appflow.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/appflow.md): State machines, transition tables, sequence flows, and error recovery paths.
- [api_design.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/api_design.md): RESTful route handler contracts, request/response schemas, and error codes.
- [database_schema.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/database_schema.md): Relational data model, ERD, tables, constraints, indices, and triggers.
- [schema.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/schema.md): TypeScript interfaces, Zod validation schemas, and JSON-LD SEO markup.
- [screens.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/screens.md): Layout blueprints and wireframes for all 7 primary screens.
- [components.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/components.md): Atomic design library (Atoms, Molecules, Organisms, Layouts).
- [design.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/design.md): "Bharat Modern" Fintech design system tokens, typography, and contrast standards.
- [rules.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/rules.md): Authoritative business rules, Trust Score algorithm, anti-spam policies, and video presentation rules.
- [frontend.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/frontend.md): Detailed frontend stack deep dive, framework concepts, comparative analysis, and tradeoffs.
- [backend.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/backend.md): Detailed backend stack deep dive, Route Handlers, speech adapters, fallback engines, and tradeoffs.
- [architecture_graph.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/Docs/architecture_graph.md): Visual architecture topologies, DAG execution graph, and state machines via Graphify.
- [wayfinder_map.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/Docs/wayfinder_map.md): Decision cartography, unblocked frontier, and blocking dependency relationships.
- [Docs/Tickets/README.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/Docs/Tickets/README.md): Master engineering backlog containing 22 contract-driven BEADS tickets across 5 Epics.
- [BRAND.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/BRAND.md): Authoritative brand identity, messaging framework, Bharat Modern visual guidelines, and anti-slop rules.


