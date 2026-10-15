# KhataVoice: Business, Engineering & Product Rules (rules.md)

This document establishes the authoritative operational, mathematical, linguistic, and engineering rules governing **KhataVoice**.

---

## 1. Credit Trust Score Algorithm & Mathematical Rules

The Kirana Credit Trust Score ($S \in [0, 100]$) provides an objective measure of customer creditworthiness. The score is recomputed dynamically upon every debt issuance and repayment event.

### 1.1 Formula Specification
$$S = \text{round}\left(0.40 \cdot V + 0.30 \cdot (100 - R) + 0.15 \cdot F + 0.15 \cdot H\right)$$

Where:
1. **$V$ (Payment Velocity Metric, Max 40 pts):**
   - Measures average days taken to settle credit against a standard 30-day baseline:
     $$V = \max\left(0, \min\left(100, 100 - \left(\frac{D_{\text{avg}} - 3}{27}\right) \times 100\right)\right)$$
   - *Rule:* If $D_{\text{avg}} \le 3$ days, $V = 100$. If $D_{\text{avg}} \ge 30$ days, $V = 0$.
2. **$R$ (Overdue Exposure Ratio, Max 30 pts):**
   - Measures current outstanding debt relative to total lifetime settled purchases:
     $$R = \min\left(100, \left(\frac{\text{Current Balance}}{\max(1, \text{Lifetime Credit Repaid})}\right) \times 100\right)$$
   - *Rule:* A customer with ₹2,000 pending who previously repaid ₹20,000 has $R = 10\%$, preserving a high score.
3. **$F$ (Store Consistency Frequency, Max 15 pts):**
   - Points assigned based on total transaction count:
     - $\ge 15$ transactions: 100 pts
     - $8 - 14$ transactions: 75 pts
     - $3 - 7$ transactions: 50 pts
     - $< 3$ transactions: 30 pts (Provisional)
4. **$H$ (Dispute & Delay Penalty, Max 15 pts):**
   - Starts at 100 pts. Decremented by 25 pts for every debt exceeding 45 days.

### 1.2 Tier Classification & Credit Cap Rules
- **Gold Badge ($85 \le S \le 100$):** High Reliability. System permits credit extensions up to ₹3,500. Recommended reminder tone: **Polite Gentle**.
- **Silver Badge ($65 \le S \le 84$):** Standard Customer. Credit capped at ₹1,500. Recommended reminder tone: **Friendly Follow-up**.
- **Bronze / At-Risk Badge ($S < 65$):** Default Risk. Credit capped at ₹250. System displays amber warning card to merchant when voice entry attempts to extend additional credit. Recommended reminder tone: **Firm Overdue**.

---

## 2. Dual-Sync Inventory & Ledger Integrity Rules

To preserve financial and inventory integrity during busy counter operations:

1. **ACID Transaction Boundary:** No ledger entry may be committed without updating the corresponding inventory counts, and no inventory count may change without an audit record in `stock_movements`.
2. **Negative Stock Handling:** If a voice sale exceeds current in-stock count:
   - The transaction is **not blocked** (to prevent stalling counter trade during peak hours).
   - An audible alert chime sounds, and the item's status pill immediately turns **CRIMSON: DEPLETED / OVER-SOLD**.
   - An automatic restock draft prompt appears on the merchant's screen.
3. **Reverse / Undo Grace Window:** Merchants have a **5-second undo grace period** via a snackbar toast after speaking an entry. If tapped, the dual-sync transaction is rolled back completely.

---

## 3. WhatsApp Debt Recovery & Anti-Spam Policy

To protect community relations and eliminate WhatsApp account banning:

1. **Anti-Harassment Rate Limiting:** A merchant cannot send more than **one WhatsApp reminder every 4 days** to the same customer.
2. **Zero Auto-Blasting:** Messages are never sent in the background without explicit merchant approval. The merchant must explicitly tap "Send on WhatsApp", launching their native WhatsApp client (`wa.me`) for human review.
3. **Mandatory UPI Deep Link Inclusion:** Every reminder must include a valid UPI payment URL (`upi://pay?pa=...`) with the exact pending amount pre-populated.
4. **Tone Matching Rule:**
   - Gold tier customers must never receive "Firm Overdue" copy.
   - Bronze tier customers with debts aging >30 days automatically default to "Firm Overdue" copy.

---

## 4. Vernacular Speech & NLP Processing Rules

1. **Code-Mixing Grace:** Spoken inputs frequently mix English brand names with vernacular grammar (*"Fortune oil 2 packet dao"*). The NLP parser must handle phonetic variations without failing.
2. **Zero-API-Key Fallback Mandate:** If external speech (Bhashini) or LLM endpoints are unreachable, the system must transparently fall back to the built-in deterministic phonetic regex parser within 50ms without crashing or surfacing cryptic error screens.
3. **Currency Inference Rule:** If an amount is spoken without currency terms (e.g., *"Shyam kaku mustard oil 130"*), the parser automatically infers numeric values $>10$ as Indian Rupees (₹).

---

## 5. Hackathon Video Presentation Guardrails

For the official 5-minute video presentation submitted to judge Ekansh Jain:
1. **The 4-Part Structure:** Exactly 5 minutes total:
   - Min 0:00–1:00: Problem & Indian Kirana macro statistics.
   - Min 1:00–2:30: Live product demo with dual-sync and audio visualizer.
   - Min 2:30–3:45: Credit Trust Score & 1-tap WhatsApp recovery.
   - Min 3:45–5:00: Unit economics calculator, SaaS pricing, and architecture.
2. **Fail-Safe Video Mode:** The application must maintain 1-click audio preset buttons in the header so the presenter can demonstrate complex Bengali and Hindi entries without recording microphone artifacts or background fan noise.
