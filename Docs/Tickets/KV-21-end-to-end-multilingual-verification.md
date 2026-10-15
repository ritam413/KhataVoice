# KV-21: End-to-End Multilingual Verification Suite (Bengali, Hindi, Hinglish, English)

- **Epic:** Epic 5: Judge Suite, Testing & Launch
- **Priority:** P0 (Blocker)
- **Story Points:** 4 SP
- **Upstream Dependencies:** KV-18, KV-19, KV-20
- **Downstream Blockers:** KV-22
- **Target Files:**
  - `tests/e2e/multilingual-flow.test.ts`
  - `tests/unit/trust-score.test.ts`
  - `tests/unit/nlp-parser.test.ts`
  - `scripts/verify-all.ts`

---

## 1. Architectural Role & Objective
Build the comprehensive automated testing and verification suite for KhataVoice. Validates that the entire multilingual flow—from spoken vernacular utterance (Bengali, Hindi, Hinglish, English) to NLP entity extraction, atomic dual-sync balance and stock mutations, Trust Score recalculation, and WhatsApp URL generation—executes flawlessly and deterministically.

---

## 2. Input Contract & Pre-Conditions
- Test runner: Vitest / Jest or lightweight Node.js test runner (`node:test`).
- Full test fixtures covering the 4 supported language dialects and 4 transaction categories (`udhaar_sale`, `cash_sale`, `payment_received`, `restock`).

---

## 3. State Invariants & Hardening Guards
- **100% Benchmark Accuracy:** The heuristic regex parser must score $100\%$ accuracy on the 10 benchmark Kirana phrases without requiring any network access.
- **ACID Invariant Verification:** A test case must verify that simulating a failure during dual-sync does not leave a phantom decrement on inventory or an unrecorded balance shift.
- **URI Encoding Check:** Ensure all generated WhatsApp and UPI URLs parse cleanly without throwing `URIError: URI malformed`.

---

## 4. Implementation Details

### 4.1 Benchmark Test Cases (`tests/unit/nlp-parser.test.ts`)
1. **Bengali Udhaar:** `"শ্যামবাবু ২ কেজি চাল আর ১ লিটার সর্ষের তেল বাকি লিখুন"` $\implies$ Name: Shyam, Udhaar: ₹260.
2. **Hindi Udhaar:** `"रोहित जी के खाते में 5 किलो आशीर्वाद आटा और 2 पैकेट मैगी उधार लिख दो"` $\implies$ Name: Rohit, Udhaar: ₹240.
3. **English Payment:** `"Sunita Devi paid 300 rupees cash today"` $\implies$ Name: Sunita, Payment: ₹300.
4. **Hinglish Restock:** `"10 packet Parle-G stock arrived"` $\implies$ Restock: Parle-G, Qty: 10.

### 4.2 Automated Master Verification Script (`scripts/verify-all.ts`)
Runs sequentially:
1. Domain model type integrity check.
2. Local store seed data sanity check.
3. Trust score algorithm boundaries ($0 \le \text{score} \le 100$).
4. WhatsApp template parameter validation.
5. Dual-sync atomic mutation test.

---

## 5. Behavior-Driven Specification (Given / When / Then)

### Scenario 1: Automated Verification Pass
- **Given:** Codebase is fully compiled.
- **When:** Engineer executes `npm test` or `npx tsx scripts/verify-all.ts`.
- **Then:** All tests pass with 0 failures, outputting a green confirmation badge.

---

## 6. Automated Verification Gates
```bash
# Run complete test verification suite
npm test # or npx tsx scripts/verify-all.ts
```
