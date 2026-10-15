import type { Language, InventoryItem } from '@/types/domain';
import type { ParsedTransaction } from '@/types/nlp';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function buildKiranaSystemPrompt(language: Language, catalogSummary: string): string {
  return `You are KhataVoice, an AI Kirana transaction parser for Indian neighborhood store owners.
Your job is to extract structured financial and inventory data from vernacular spoken text (Bengali, Hindi, Hinglish, English).
Known Catalog: ${catalogSummary}

Return STRICT JSON matching this schema:
{
  "customer_name": string or null,
  "transaction_type": "udhaar_sale" | "cash_sale" | "restock" | "payment_received",
  "amount": number,
  "items": [
    {
      "name": string,
      "quantity": number,
      "unit": string,
      "estimated_price": number
    }
  ],
  "confidence": number
}

Rules:
1. "baki" / "udhaar" / "বাকি" / "उधार" => "udhaar_sale".
2. "jama" / "paid" / "জমা" / "শোধ" / "चुका दिया" => "payment_received".
3. "nagad" / "cash" / "নগদ" / "नकद" => "cash_sale".
4. "stock" / "elo" / "স্টক" / "स्टॉक" => "restock".
5. If amount is spoken (e.g. 260 taka), use that as "amount".
6. Return only valid JSON.`;
}

/**
 * Call local Ollama instance with JSON schema enforcement.
 */
export async function parseWithOllama(
  transcript: string,
  language: Language,
  catalogContext?: InventoryItem[]
): Promise<ParsedTransaction | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second safety timeout

  const catalogSummary = (catalogContext || [])
    .map((i) => `${i.name} (₹${i.unit_price}/${i.unit})`)
    .slice(0, 10)
    .join(', ');

  const systemPrompt = buildKiranaSystemPrompt(language, catalogSummary);

  try {
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: `${systemPrompt}\n\nSpoken phrase: "${transcript}"`,
        format: 'json',
        stream: false,
        options: {
          temperature: 0.0,
          num_predict: 256
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = (await response.json()) as { response?: string };
    if (!data.response) return null;

    const parsed = JSON.parse(data.response);
    return {
      customer_name: parsed.customer_name || undefined,
      transaction_type: parsed.transaction_type || 'udhaar_sale',
      amount: Number(parsed.amount) || 0,
      items: Array.isArray(parsed.items) ? parsed.items : [],
      confidence: Number(parsed.confidence) || 0.9,
      engine: 'ollama',
      raw_transcript: transcript,
      notes: `Ollama (${OLLAMA_MODEL})`
    };
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

/**
 * Call Google Gemini API with JSON mode.
 */
export async function parseWithGemini(
  transcript: string,
  language: Language,
  catalogContext?: InventoryItem[]
): Promise<ParsedTransaction | null> {
  if (!GEMINI_API_KEY) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  const catalogSummary = (catalogContext || [])
    .map((i) => `${i.name} (₹${i.unit_price}/${i.unit})`)
    .slice(0, 10)
    .join(', ');

  const systemPrompt = buildKiranaSystemPrompt(language, catalogSummary);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\nSpoken Kirana utterance: "${transcript}"` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    interface GeminiResponse {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    }

    const data = (await response.json()) as GeminiResponse;
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText);
    return {
      customer_name: parsed.customer_name || undefined,
      transaction_type: parsed.transaction_type || 'udhaar_sale',
      amount: Number(parsed.amount) || 0,
      items: Array.isArray(parsed.items) ? parsed.items : [],
      confidence: Number(parsed.confidence) || 0.94,
      engine: 'gemini',
      raw_transcript: transcript,
      notes: 'Gemini 1.5 Flash'
    };
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}
