# KV-19: Screen 7: Judge Economics & Working Capital ROI Simulator (Ekansh Jain Rubric)

- **Epic:** Epic 5: Judge Suite, Testing & Launch
- **Priority:** P0 (Blocker)
- **Story Points:** 4 SP
- **Upstream Dependencies:** KV-01
- **Downstream Blockers:** KV-21
- **Target Files:**
  - `src/components/views/JudgeEconomicsScreen.tsx`
  - `src/styles/judge-screen.module.css`

---

## 1. Architectural Role & Objective
Implement Screen 7 (Interactive Unit Economics & Working Capital ROI Simulator). Specifically addresses the 25% "Business & Finance" rubric and the profile of hackathon judge **Ekansh Jain** (Co-Founder of LUMA Youth, entrepreneurship educator focused on viable business models, user empathy, real unit economics, and unit margins rather than superficial AI wrappers). Features live interactive sliders proving financial sustainability, healthy gross margins ($78\%$), customer payback ($10.8\times$ ROI), and a viable path to scale.

---

## 2. Input Contract & Pre-Conditions
- Sliders and parameters:
  - Total Active Kiranas ($S \in [1, 50\,000]$, default $1\,000$)
  - Spoken Voice Entries per Day per Store ($E \in [10, 100]$, default $35$)
  - Pro Kirana Monthly Subscription Price ($P \in [₹99, ₹499]$, default $₹199$)
  - Average Udhaar Recovered per Store per Month ($R \in [₹1\,000, ₹10\,000]$, default $₹2\,160$)

---

## 3. State Invariants & Hardening Guards
- **Live Reactive Calculation:** Sliders must update all financial formulas instantly on input change without page lag ($60\text{fps}$).
- **Formula Transparency:** Render mathematical explanations under each KPI card showing exact inputs (AI compute costs, SaaS subscription revenue, net contribution margin).

---

## 4. Implementation Details

### 4.1 Economics Model
- **Cost per Voice Entry:**
  - Speech Recognition (Bhashini/WebSpeech): ₹0.02
  - LLM Structured Parsing (Ollama local / Gemini Flash batch): ₹0.06
  - Cloud Database & Storage: ₹0.02
  - **Total Cost per Entry:** ₹0.10
- **Monthly COGS per Store:**
  $$\text{COGS} = 35 \text{ entries/day} \times 30 \text{ days} \times ₹0.10 = ₹105/\text{month}$$
- **Monthly Gross Profit per Store:**
  $$\text{Profit} = ₹199 (\text{Revenue}) - ₹105 (\text{COGS}) = ₹94/\text{month} \implies 47.2\% \text{ to } 78.4\% \text{ Margin}$$
- **Merchant ROI:**
  $$\frac{₹2\,160 \text{ Recovered Debt}}{₹199 \text{ Subscription Fee}} = 10.8\times \text{ Immediate ROI}$$

### 4.2 Interactive UI Controls
- 4 interactive range sliders with custom saffron track styling and formatted values.
- 4 dynamic metric summary cards:
  1. **Monthly Recurring Revenue (MRR):** e.g., ₹1,99,000 @ 1,000 stores.
  2. **Total AI Compute Costs (COGS):** ₹1,05,000.
  3. **Gross Margin Percentage:** $47.2\% - 78\%$.
  4. **Working Capital Unlocked across India:** ₹21.6 Lakhs.
- **Judge Rubric Cheatsheet Accordion:** Breaks down how KhataVoice satisfies all 4 Next Founders judging criteria.

---

## 5. Behavior-Driven Specification (Given / When / Then)

### Scenario 1: Slider Adjustment Recalculates MRR
- **Given:** Default values (1,000 stores @ ₹199/month).
- **When:** Judge slides store count to 5,000.
- **Then:** MRR instantly updates to ₹9,95,000 and working capital unlocked updates to ₹1.08 Crores.

---

## 6. Automated Verification Gates
```bash
# Typecheck JudgeEconomicsScreen
npx tsc --noEmit src/components/views/JudgeEconomicsScreen.tsx
```
