# KV-10: Kirana Credit Trust Score Engine (0-100) & Strict RFC UPI Parameter Validator

- **Epic:** Epic 3: Atomic Dual-Sync & Business Logic
- **Priority:** P0 (Blocker)
- **Story Points:** 3 SP
- **Upstream Dependencies:** KV-02
- **Downstream Blockers:** KV-11, KV-12
- **Target Files:**
  - `src/lib/trust/trust-engine.ts`
  - `src/lib/trust/upi-validator.ts`
  - `src/types/trust.ts`

---

## 1. Architectural Role & Objective
Implement the deterministic mathematical engine calculating the **Kirana Customer Credit Trust Score ($0\text{--}100$)** and the strict RFC 3986 validator for Indian Unified Payments Interface (UPI) deep links. Replaces arbitrary merchant guesswork with an objective credit rating that updates upon every transaction or repayment, and secures UPI link generation against URI injection.

---

## 2. Input Contract & Pre-Conditions
- Credit Score Formula Inputs:
  - Average repayment days ($V$)
  - Overdue ratio ($R = \frac{\text{overdue balance}}{\text{total credit extended}}$)
  - Lifetime transaction count ($F$)
  - Unresolved disputes count ($D$)
- UPI Validator Inputs:
  - UPI VPA ID (e.g. `ramesh.kirana@okicici`)
  - Payee Name (e.g. `Ramesh Babu`)
  - Amount in INR
  - Transaction note

---

## 3. State Invariants & Hardening Guards
- **Division-by-Zero & Cold-Start Defense:** For brand new customers ($F < 2$), assign a provisional baseline score of $70$ (`SILVER`). For pure cash customers with zero credit history, default to $95$ (`GOLD`). The score must be clamped strictly within $[0, 100]$.
- **Adversarial Review Hardening (Strict RFC 3986 UPI Encoding):**
  - UPI VPA must match standard NPCI regex: `^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$`.
  - All query parameters in `upi://pay?pa=...&pn=...&am=...&cu=INR` must be strictly escaped with `encodeURIComponent()`. If store or customer name contains ampersands (`&`), spaces, or Bengali/Hindi characters, they must not corrupt the URI query string.

---

## 4. Implementation Details

### 4.1 Algorithmic Formula (`src/lib/trust/trust-engine.ts`)
$$\text{Score} = \text{round}\left( 40 \times \max(0, 1 - \frac{V}{30}) + 30 \times (1 - R) + 20 \times \min(1, \frac{F}{10}) - 10 \times D \right)$$
Clamped between $0$ and $100$.

- **Tier Mapping:**
  - $85 \le \text{Score} \le 100 \implies$ `GOLD` (Extends up to ₹5,000 credit)
  - $65 \le \text{Score} \le 84 \implies$ `SILVER` (Extends up to ₹1,500 credit)
  - $0 \le \text{Score} \le 64 \implies$ `BRONZE` (Warning: Restrict credit, prioritize recovery)

### 4.2 UPI Link Generator (`src/lib/trust/upi-validator.ts`)
```typescript
export function generateValidUpiUrl(params: {
  vpa: string;
  payeeName: string;
  amount: number;
  note?: string;
}): string {
  const vpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  if (!vpaRegex.test(params.vpa)) {
    throw new Error(`Invalid UPI VPA format: ${params.vpa}`);
  }

  const encodedVpa = encodeURIComponent(params.vpa);
  const encodedName = encodeURIComponent(params.payeeName);
  const encodedAmount = params.amount.toFixed(2);
  const encodedNote = encodeURIComponent(params.note || 'KhataVoice Udhaar Repayment');

  return `upi://pay?pa=${encodedVpa}&pn=${encodedName}&am=${encodedAmount}&cu=INR&tn=${encodedNote}`;
}
```

---

## 5. Behavior-Driven Specification (Given / When / Then)

### Scenario 1: Trust Score Calculation
- **Given:** Customer pays within 5 days ($V=5$), overdue ratio $0\%$ ($R=0$), has 15 transactions ($F=15$), 0 disputes.
- **When:** `calculateTrustScore({ avgRepaymentDays: 5, overdueRatio: 0, transactionCount: 15, disputes: 0 })` runs.
- **Then:** Returns score $= 83\text{--}93$ and tier `'GOLD'`.

### Scenario 2: Special Characters in UPI Name
- **Given:** Payee name is `"Maa Tara & Sons (Ramesh)"`.
- **When:** `generateValidUpiUrl()` builds the URI.
- **Then:** URI contains `pn=Maa%20Tara%20%26%20Sons%20(Ramesh)` without unescaped ampersands breaking parsing.

---

## 6. Automated Verification Gates
```bash
# Run trust engine tests
node -e "const { calculateTrustScore } = require('./src/lib/trust/trust-engine.ts'); console.assert(calculateTrustScore({ avgDays: 5, overdueRatio: 0, count: 12 }) >= 85, 'Math error');"
```
