import type { Language, InventoryItem } from '@/types/domain';
import type { ParsedTransaction, ParseTransactionInput } from '@/types/nlp';
import { parseTransactionRegex } from './regex-parser';
import { parseWithOllama, parseWithGemini } from './llm-parser';

/**
 * Unified Hybrid NLP Transaction Parser Engine.
 * 
 * Hierarchy:
 * 1. Local Ollama LLM (if running on localhost:11434 with llama3)
 * 2. Cloud Gemini Flash LLM (if GEMINI_API_KEY is configured)
 * 3. Zero-Key Deterministic Regex Heuristic Engine (<15ms, 100% offline guarantee)
 */
export async function parseTransaction(
  input: ParseTransactionInput
): Promise<ParsedTransaction> {
  const { transcript, language, catalogContext } = input;

  if (!transcript || transcript.trim() === '') {
    return {
      transaction_type: 'udhaar_sale',
      amount: 0,
      items: [],
      confidence: 0,
      engine: 'regex_heuristic',
      raw_transcript: '',
      notes: 'Empty transcript received'
    };
  }

  // Tier 1: Try local Ollama if configured
  try {
    const ollamaResult = await parseWithOllama(transcript, language, catalogContext);
    if (ollamaResult && ollamaResult.amount > 0) {
      return ollamaResult;
    }
  } catch {
    // Gracefully ignore LLM failures and continue to next tier
  }

  // Tier 2: Try Cloud Gemini if configured
  try {
    const geminiResult = await parseWithGemini(transcript, language, catalogContext);
    if (geminiResult && geminiResult.amount > 0) {
      return geminiResult;
    }
  } catch {
    // Gracefully ignore LLM failures
  }

  // Tier 3: Zero-Key Heuristic Regex & Phonetic Fallback (Guaranteed to return in <15ms)
  return parseTransactionRegex(transcript, language, catalogContext);
}
