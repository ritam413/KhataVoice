# KV-07: Hybrid NLP Transaction Parser (Ollama / Gemini + Zero-Key Regex Fallback)

- **Epic:** Epic 2: Multilingual Speech & NLP Engine
- **Priority:** P0 (Blocker)
- **Story Points:** 5 SP
- **Upstream Dependencies:** KV-01
- **Downstream Blockers:** KV-08
- **Target Files:**
  - `src/lib/nlp/parser-engine.ts`
  - `src/lib/nlp/regex-parser.ts`
  - `src/lib/nlp/llm-parser.ts`
  - `src/lib/nlp/dictionary.ts`
  - `src/types/nlp.ts`

---

## 1. Architectural Role & Objective
Build the hybrid multilingual NLP transaction parsing engine. Takes raw vernacular transcripts (Bengali, Hindi, Hinglish, English) and extracts structured financial entities: customer name, transaction type (`udhaar_sale`, `cash_sale`, `restock`, `payment_received`), total monetary amount, item details (name, quantity, unit, price), and confidence score. Combines an LLM-based structured JSON prompt (local Ollama or Cloud Gemini) with a built-in deterministic heuristic regex parser that operates with 100% accuracy on standard Kirana phrases without requiring any network or API keys.

---

## 2. Input Contract & Pre-Conditions
- Input: `{ transcript: string; language: 'bn' | 'hi' | 'en'; catalogContext?: InventoryItem[] }`
- Output Schema:
```typescript
export interface ParsedTransaction {
  customer_name?: string;
  transaction_type: 'udhaar_sale' | 'cash_sale' | 'restock' | 'payment_received';
  amount: number;
  items: Array<{
    item_id?: string;
    name: string;
    quantity: number;
    unit: string;
    estimated_price?: number;
  }>;
  confidence: number;
  engine: 'ollama' | 'gemini' | 'regex_heuristic';
  raw_transcript: string;
}
```

---

## 3. State Invariants & Hardening Guards
- **Zero-Key Offline Guarantee:** If Ollama or Gemini fail, timeout ($> 3000\text{ms}$), or are unconfigured, `regex-parser.ts` automatically parses the phrase. The route must **never** return a 500 error solely because an AI endpoint was unreachable.
- **Vernacular Entity Disambiguation:**
  - Bengali keywords: `বাকি` / `baki` $\implies$ `udhaar_sale`; `জমা` / `joma` $\implies$ `payment_received`; `নগদ` / `nogod` $\implies$ `cash_sale`; `স্টক` / `stock` $\implies$ `restock`.
  - Hindi keywords: `उधार` / `udhaar` $\implies$ `udhaar_sale`; `जमा` / `jama` $\implies$ `payment_received`; `नकद` / `nakad` $\implies$ `cash_sale`.
- **Amount & Catalog Cross-Check:** If an amount is explicitly spoken (e.g. "260 taka"), use it as the definitive transaction amount. If omitted, calculate amount by summing item quantities $\times$ catalog unit prices.

---

## 4. Implementation Details

### 4.1 Heuristic Regex Engine (`src/lib/nlp/regex-parser.ts`)
Must parse:
1. "শ্যামবাবু ২ কেজি চাল আর ১ লিটার সর্ষের তেল বাকি লিখুন" $\implies$ Shyam Sundar Das, udhaar_sale, ₹260.
2. "रोहित जी के खाते में 5 किलो आटा उधार लिख दो" $\implies$ Rohit Gupta, udhaar_sale, ₹190.
3. "Sunita Devi gave 300 rupees cash today" $\implies$ Sunita Devi, payment_received, ₹300.
4. "Amit babu 1 packet Parle-G cash sale" $\implies$ Amit Das, cash_sale, ₹10.

### 4.2 LLM Parser with Few-Shot Prompts (`src/lib/nlp/llm-parser.ts`)
- Configurable endpoints: Ollama (`http://localhost:11434/api/generate`) with model `llama3:8b` or `qwen2.5:7b`, or Google Gemini API.
- Prompt enforces strict JSON schema output with `response_format: { type: "json_object" }`.

---

## 5. Behavior-Driven Specification (Given / When / Then)

### Scenario 1: Deterministic Offline Parsing
- **Given:** Network is disconnected and no LLM is running.
- **When:** `parseTransaction("Shyam babu 260 taka baki likhun", "bn")` is called.
- **Then:** Engine returns `regex_heuristic`, `customer_name: "Shyam"`, `amount: 260`, and `transaction_type: "udhaar_sale"` within $15\text{ms}$.

---

## 6. Automated Verification Gates
```bash
# Run unit test on Kirana benchmark phrases
node -e "const { parseTransactionRegex } = require('./src/lib/nlp/regex-parser.ts'); const res = parseTransactionRegex('Rohit ji 500 udhaar'); console.assert(res.amount === 500 && res.transaction_type === 'udhaar_sale', 'Parser failed');"
```
