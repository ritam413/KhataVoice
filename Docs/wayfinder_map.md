# Wayfinder Map: KhataVoice Hackathon Sprint

**Label:** `wayfinder:map`  
**Tracker:** Local Markdown Tracker  
**Effort:** KhataVoice Next Founders Hackathon Build Sprint (Deadline: Oct 16, 2026 @ 2:30 AM IST)

---

## Destination

Deliver a fully-functional, live-deployed **KhataVoice** MVP (multilingual voice-first Kirana ledger, atomic inventory dual-sync, 0–100 Credit Trust Score, and zero-cost cultural WhatsApp debt recovery via `wa.me`) with resilient cloud Supabase and zero-key local fallback modes, fully verified for the 5-minute Next Founders hackathon pitch video.

---

## Notes

- **Domain:** Indian Retail Kirana Fintech, Multilingual Voice Interfaces (Bengali, Hindi, Hinglish, English), Bhashini ASR, Supabase PostgreSQL, Next.js 14/15 App Router.
- **Skills to Consult:** `/claude-code-route`, `/beads`, `/multica`, `/wayfinder`, `/tdd`, `/10x-dev`.
- **Standing Preferences:**
  - Zero-config local execution: judges must be able to run the app out-of-the-box without mandatory external API keys.
  - Fail-safe video takes: 1-click audio presets guarantee zero microphone or network failures during video recording.
  - Refer to tickets by **name**, never bare numbers or IDs.

---

## Decisions So Far

- [Decision: Adopt Supabase PostgreSQL as Primary Database with Zero-Key Local Fallback](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/Docs/database_schema.md): Supabase PostgreSQL with RLS and Realtime is the primary store; an in-memory/JSON fallback automatically activates if credentials are unconfigured.
- [Decision: Tri-Tier Speech Adapter with 1-Click Audio Presets](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/Docs/techspec.md#2-speech-to-text-asr-pipeline-architecture): Tier 1 Web Speech API (zero latency), Tier 2 Bhashini Dhruva ASR proxy (vernacular accuracy), Tier 3 1-Click Audio Sample Presets (fail-safe pitch demo takes).
- [Decision: Hybrid NLP Entity Parser with Offline Regex Engine](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/Docs/backend.md): Structured JSON extraction via local Ollama/Cloud LLM paired with deterministic regex fallback covering 100% of benchmark Kirana phrases offline.
- [Decision: 4-Second Auto-Commit Grace Window](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/Docs/appflow.md): Spoken entries display an animated 4s countdown on confirm CTA with instant confirm and cancel/edit override to prevent accidental writes.
- [Decision: Credit Trust Score Division-by-Zero Defense](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/Docs/rules.md): Assign provisional Silver (70) for new borrowers ($N < 2$) and default Gold (95) for pure cash buyers.
- [Decision: Zero-Cost Cultural WhatsApp Debt Recovery via Native `wa.me` + UPI](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/Docs/api_design.md#51-generate-cultural-whatsapp-reminder): Eliminates Meta Cloud API fees using URL-encoded `wa.me` links across 3 cultural tones with embedded RFC-compliant `upi://pay` deep links.
- [Decision: Unified Reactive State Store for Dual-Mode Viewports](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/Docs/screens.md): Shared React state store ensures zero desync when toggling between Mobile Handset and Desktop Command Center.

---

## Decision Tickets & Blocking Relationships

Below is the graph of decision tickets structuring the work into explicit blocking edges before execution begins.

### Frontier (Unblocked — Ready for Claim)

These tickets have **zero open blocking dependencies** and represent the active edge of the known:

1. **[Ticket: Scaffold Foundation & In-Memory Fallback Adapter]**
   - **Type:** `wayfinder:task` (AFK)
   - **File Targets:** `package.json`, `src/lib/db/supabase.ts`, `src/lib/db/local-fallback.ts`
   - **Blocks:** 
     - *[Ticket: Implement Design System Primitives]*
     - *[Ticket: Implement Tri-Tier Speech Adapter & Audio Presets]*
     - *[Ticket: Implement Hybrid NLP Transaction Parser]*
     - *[Ticket: Implement ACID Dual-Sync Stored Procedure & Client Bridge]*
     - *[Ticket: Build Hackathon Judge Unit Economics & Scalability Suite]*

2. **[Ticket: Define "Bharat Modern" Design Tokens & CSS Reset]**
   - **Type:** `wayfinder:task` (AFK)
   - **File Targets:** `src/app/globals.css`, `src/styles/tokens.module.css`
   - **Blocks:**
     - *[Ticket: Implement Design System Primitives]*

---

### Blocked Decision Tickets (Awaiting Frontier Resolution)

#### Blocked by Foundation & Tokens:
3. **[Ticket: Implement Design System Primitives]**
   - **Type:** `wayfinder:task` (AFK)
   - **Blocked by:** *[Ticket: Scaffold Foundation & In-Memory Fallback Adapter]*, *[Ticket: Define "Bharat Modern" Design Tokens & CSS Reset]*
   - **Blocks:**
     - *[Ticket: Build Canvas Audio Waveform Visualizer]*
     - *[Ticket: Build Dual-Mode Viewport Simulator Chassis]*

4. **[Ticket: Implement Tri-Tier Speech Adapter & Audio Presets]**
   - **Type:** `wayfinder:task` (AFK)
   - **Blocked by:** *[Ticket: Scaffold Foundation & In-Memory Fallback Adapter]*
   - **Blocks:**
     - *[Ticket: Implement Speech & NLP API Route Handlers]*
     - *[Ticket: Build Mobile Home & Voice Entry Active Modal]*

5. **[Ticket: Implement Hybrid NLP Transaction Parser]**
   - **Type:** `wayfinder:task` (AFK)
   - **Blocked by:** *[Ticket: Scaffold Foundation & In-Memory Fallback Adapter]*
   - **Blocks:**
     - *[Ticket: Implement Speech & NLP API Route Handlers]*

6. **[Ticket: Implement ACID Dual-Sync Stored Procedure & Client Bridge]**
   - **Type:** `wayfinder:task` (AFK)
   - **Blocked by:** *[Ticket: Scaffold Foundation & In-Memory Fallback Adapter]*
   - **Blocks:**
     - *[Ticket: Implement Dual-Sync API Route Handler]*
     - *[Ticket: Implement Ledger & Inventory Management API Routes]*

7. **[Ticket: Implement Kirana Credit Trust Score Engine & Division-by-Zero Defense]**
   - **Type:** `wayfinder:task` (AFK)
   - **Blocked by:** *[Ticket: Scaffold Foundation & In-Memory Fallback Adapter]*
   - **Blocks:**
     - *[Ticket: Implement Dual-Sync API Route Handler]*
     - *[Ticket: Implement Cultural WhatsApp Reminder Engine]*

---

#### Blocked by Engines & Adapters:
8. **[Ticket: Implement Speech & NLP API Route Handlers]**
   - **Type:** `wayfinder:task` (AFK)
   - **Blocked by:** *[Ticket: Implement Tri-Tier Speech Adapter & Audio Presets]*, *[Ticket: Implement Hybrid NLP Transaction Parser]*
   - **Blocks:**
     - *[Ticket: Build Mobile Home & Voice Entry Active Modal]*

9. **[Ticket: Implement Dual-Sync API Route Handler]**
   - **Type:** `wayfinder:task` (AFK)
   - **Blocked by:** *[Ticket: Implement ACID Dual-Sync Stored Procedure & Client Bridge]*, *[Ticket: Implement Kirana Credit Trust Score Engine & Division-by-Zero Defense]*
   - **Blocks:**
     - *[Ticket: Build Mobile Home & Voice Entry Active Modal]*
     - *[Ticket: Build Customer Ledger & Store Inventory Screens]*

10. **[Ticket: Implement Cultural WhatsApp Reminder Engine]**
    - **Type:** `wayfinder:task` (AFK)
    - **Blocked by:** *[Ticket: Implement Kirana Credit Trust Score Engine & Division-by-Zero Defense]*
    - **Blocks:**
      - *[Ticket: Build WhatsApp Debt Recovery & Tone Selector Modal]*

11. **[Ticket: Implement Ledger & Inventory Management API Routes]**
    - **Type:** `wayfinder:task` (AFK)
    - **Blocked by:** *[Ticket: Implement ACID Dual-Sync Stored Procedure & Client Bridge]*
    - **Blocks:**
      - *[Ticket: Build Customer Ledger & Store Inventory Screens]*
      - *[Ticket: Build Desktop Merchant Command Center]*

12. **[Ticket: Build Canvas Audio Waveform Visualizer]**
    - **Type:** `wayfinder:prototype` (HITL)
    - **Blocked by:** *[Ticket: Implement Design System Primitives]*
    - **Blocks:**
      - *[Ticket: Build Mobile Home & Voice Entry Active Modal]*

13. **[Ticket: Build Dual-Mode Viewport Simulator Chassis]**
    - **Type:** `wayfinder:prototype` (HITL)
    - **Blocked by:** *[Ticket: Implement Design System Primitives]*
    - **Blocks:**
      - *[Ticket: Build Desktop Merchant Command Center]*

---

#### Blocked by UI Components & Routes:
14. **[Ticket: Build Mobile Home & Voice Entry Active Modal]**
    - **Type:** `wayfinder:prototype` (HITL)
    - **Blocked by:** *[Ticket: Build Canvas Audio Waveform Visualizer]*, *[Ticket: Implement Speech & NLP API Route Handlers]*, *[Ticket: Implement Dual-Sync API Route Handler]*
    - **Blocks:**
      - *[Ticket: Build Desktop Merchant Command Center]*
      - *[Ticket: End-to-End Multilingual Sprint Verification]*

15. **[Ticket: Build Customer Ledger & Store Inventory Screens]**
    - **Type:** `wayfinder:task` (AFK)
    - **Blocked by:** *[Ticket: Implement Dual-Sync API Route Handler]*, *[Ticket: Implement Ledger & Inventory Management API Routes]*
    - **Blocks:**
      - *[Ticket: Build Desktop Merchant Command Center]*

16. **[Ticket: Build WhatsApp Debt Recovery & Tone Selector Modal]**
    - **Type:** `wayfinder:prototype` (HITL)
    - **Blocked by:** *[Ticket: Implement Cultural WhatsApp Reminder Engine]*
    - **Blocks:**
      - *[Ticket: Build Desktop Merchant Command Center]*

17. **[Ticket: Build Desktop Merchant Command Center]**
    - **Type:** `wayfinder:prototype` (HITL)
    - **Blocked by:** *[Ticket: Build Dual-Mode Viewport Simulator Chassis]*, *[Ticket: Build Mobile Home & Voice Entry Active Modal]*, *[Ticket: Build Customer Ledger & Store Inventory Screens]*, *[Ticket: Build WhatsApp Debt Recovery & Tone Selector Modal]*
    - **Blocks:**
      - *[Ticket: End-to-End Multilingual Sprint Verification]*

---

#### Blocked by Core App Completion:
18. **[Ticket: Build Hackathon Judge Unit Economics & Scalability Suite]**
    - **Type:** `wayfinder:task` (AFK)
    - **Blocked by:** *[Ticket: Scaffold Foundation & In-Memory Fallback Adapter]*
    - **Blocks:**
      - *[Ticket: End-to-End Multilingual Sprint Verification]*

19. **[Ticket: End-to-End Multilingual Sprint Verification]**
    - **Type:** `wayfinder:task` (AFK)
    - **Blocked by:** *[Ticket: Build Desktop Merchant Command Center]*, *[Ticket: Build Hackathon Judge Unit Economics & Scalability Suite]*
    - **Blocks:**
      - *[Ticket: Production Deployment & 5-Minute Video Pitch Assets]*

20. **[Ticket: Production Deployment & 5-Minute Video Pitch Assets]**
    - **Type:** `wayfinder:task` (HITL)
    - **Blocked by:** *[Ticket: End-to-End Multilingual Sprint Verification]*
    - **Blocks:** *(Destination Reached)*

---

## Not Yet Specified (Fog of War)

These represent valid future roadmap capabilities that cannot yet be precisely ticketed until post-hackathon pilot feedback arrives:

- **Vernacular Audio Feedback via TTS**: Soundbox voice confirmation of committed transactions in Bengali and Hindi.
- **Offline PWA Service Worker & Background Sync**: Full local IndexedDB queueing with automatic conflict resolution upon reconnection.
- **Wholesale Distributor Restock Intent**: Automated WhatsApp draft orders to distributors when aggregate stock is depleted.

---

## Out of Scope

Explicitly ruled beyond the destination for this 4-day hackathon sprint:

- **Meta WhatsApp Business Cloud API Integration**: Excluded due to business verification friction and ₹0.80/conversation charges; replaced with zero-cost `wa.me` links.
- **Hardware Barcode Camera Scanner**: Excluded because spoken voice entity parsing completely removes barcode necessity for loose commodities.
- **Commercial Payment Gateway (Razorpay/Stripe)**: Excluded due to merchant KYC overhead and 2% MDR; replaced with zero-fee direct P2P UPI links (`upi://pay`).
- **Multi-Branch Enterprise Franchise Sync**: Excluded to keep focus strictly on single-outlet neighborhood Kiranas.
