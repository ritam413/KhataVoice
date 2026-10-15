import type { Language, TransactionType, InventoryItem, Customer } from '@/types/domain';
import type { ParsedTransaction, ParsedTransactionItem } from '@/types/nlp';
import {
  normalizeVernacularDigits,
  INTENT_KEYWORDS,
  UNIT_MAP,
  CATALOG_SYNONYMS,
  CatalogSynonym,
} from './dictionary';
import { SEED_CUSTOMERS, SEED_INVENTORY } from '@/lib/db/seed-data';

/**
 * Deterministic Heuristic Kirana NLP Parser (Zero-Key Offline Guarantee)
 * Resolves standard vernacular transactions in <15ms without any external APIs.
 */
export function parseTransactionRegex(
  transcript: string,
  language: Language = 'en',
  catalogContext?: InventoryItem[]
): ParsedTransaction {
  const normalized = normalizeVernacularDigits(transcript.trim());
  const lower = normalized.toLowerCase();

  // 1. Determine Transaction Type
  let detectedType: TransactionType = 'udhaar_sale'; // default fallback for Kirana
  let intentFound = false;

  // Check each intent keyword list
  for (const [typeKey, keywords] of Object.entries(INTENT_KEYWORDS)) {
    const type = typeKey as TransactionType;
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        detectedType = type;
        intentFound = true;
        break;
      }
    }
    if (intentFound) break;
  }

  // 2. Extract Customer Name & Match with Registered Customer Seed
  let customerName: string | undefined;
  let customerId: string | undefined;

  const candidateCustomers: { seed: Customer; aliases: string[] }[] = [
    { seed: SEED_CUSTOMERS[0], aliases: ['shyam', 'shyam sundar', 'shyam sundar das', 'শ্যাম', 'শ্যামবাবু', 'শ্যাম কাকু', 'श्याम'] },
    { seed: SEED_CUSTOMERS[1], aliases: ['rohit', 'rohit gupta', 'রোহিত', 'रोहित', 'रोहित जी', 'रोहितजी'] },
    { seed: SEED_CUSTOMERS[2], aliases: ['sunita', 'sunita devi', 'সুনীতা', 'सुनीता', 'सुनीता देवी'] },
    { seed: SEED_CUSTOMERS[3], aliases: ['amit', 'amit das', 'অমিত', 'অমিতবাবু', 'अमित', 'अमित दास'] },
    { seed: SEED_CUSTOMERS[4], aliases: ['rajesh', 'rajesh mondal', 'রাজেশ', 'রাজেশ মন্ডল', 'राजेश'] },
    { seed: SEED_CUSTOMERS[5], aliases: ['priya', 'priya sen', 'প্রিয়া', 'প্রিয়া', 'प्रिया'] },
  ];

  if (detectedType !== 'restock') {
    for (const candidate of candidateCustomers) {
      for (const alias of candidate.aliases) {
        if (lower.includes(alias.toLowerCase())) {
          customerName = candidate.seed.name;
          customerId = candidate.seed.id;
          break;
        }
      }
      if (customerName) break;
    }
  }

  // 3. Extract Explicit Spoken Monetary Amount
  let explicitAmount: number | undefined;

  // Currency marker regex: e.g. "260 taka", "₹500", "300 rupees", "150 रुपया", "500 udhaar"
  const amountPatterns = [
    /(?:₹|rs\.?|taka|rupees?|টাকা|রুপয়া|रुपया|रुपये)\s*(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:₹|rs\.?|taka|rupees?|টাকা|রুপয়া|रुपया|रुपये)/i,
    // Patterns like "500 udhaar", "500 baki", "300 cash", "500 jama"
    /(\d+(?:\.\d+)?)\s*(?:udhaar|baki|cash|jama|paid|বাকি|জমা|নগদ|उधार|नकद)/i,
    /(?:udhaar|baki|cash|jama|paid|বাকি|জমা|নগদ|उधार|नकद)\s*(\d+(?:\.\d+)?)/i,
  ];

  for (const pattern of amountPatterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      const val = parseFloat(match[1]);
      if (!isNaN(val) && val > 0) {
        explicitAmount = val;
        break;
      }
    }
  }

  // 4. Extract Items, Quantities, and Units
  const items: ParsedTransactionItem[] = [];
  const inventory = catalogContext && catalogContext.length > 0 ? catalogContext : SEED_INVENTORY;

  // Scan for catalog synonym matches
  for (const syn of CATALOG_SYNONYMS) {
    let matchedKw: string | null = null;
    for (const kw of syn.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        matchedKw = kw;
        break;
      }
    }

    if (matchedKw) {
      // Find quantity & unit preceding or near the item
      let quantity = 1;
      let unit = syn.defaultUnit;

      // Look for regex: (\d+)\s*(কেজি|লিটার|প্যাকেট|kg|liter|packet|etc)? ... [keyword]
      const unitKeys = Object.keys(UNIT_MAP).join('|');
      const itemRegex = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(${unitKeys})?\\s*(?:এর|का|of)?\\s*${matchedKw}`, 'i');
      const itemMatch = normalized.match(itemRegex);

      if (itemMatch) {
        quantity = parseFloat(itemMatch[1]) || 1;
        if (itemMatch[2] && UNIT_MAP[itemMatch[2].toLowerCase()]) {
          unit = UNIT_MAP[itemMatch[2].toLowerCase()];
        }
      } else {
        // Reverse order check: [keyword] ... (\d+)\s*(unit)
        const reverseRegex = new RegExp(`${matchedKw}\\s*(\\d+(?:\\.\\d+)?)\\s*(${unitKeys})?`, 'i');
        const revMatch = normalized.match(reverseRegex);
        if (revMatch) {
          quantity = parseFloat(revMatch[1]) || 1;
          if (revMatch[2] && UNIT_MAP[revMatch[2].toLowerCase()]) {
            unit = UNIT_MAP[revMatch[2].toLowerCase()];
          }
        }
      }

      // If item is a 5kg pack and user said 5 kg, normalize to 1 bag
      if (syn.canonicalName.includes('5kg') && quantity === 5) {
        quantity = 1;
        unit = 'bag';
      }

      // Reconcile with inventory item price and ID
      const matchedCatalogItem = inventory.find(
        (inv) => inv.name.toLowerCase().includes(syn.canonicalName.toLowerCase())
      );

      const unitPrice = matchedCatalogItem ? matchedCatalogItem.unit_price : syn.defaultUnitPrice;
      const estimatedPrice = Math.round(quantity * unitPrice);

      items.push({
        item_id: matchedCatalogItem?.id,
        name: syn.canonicalName,
        quantity,
        unit,
        estimated_price: estimatedPrice
      });
    }
  }

  // 5. Final Amount & Items Reconciliation
  // If payment received, it's a debt repayment - no inventory items purchased
  const finalItems = detectedType === 'payment_received' ? [] : items;

  let finalAmount = explicitAmount ?? 0;
  if (!finalAmount && finalItems.length > 0) {
    // If no explicit amount mentioned, calculate sum of item values
    finalAmount = finalItems.reduce((sum, item) => sum + (item.estimated_price || 0), 0);
  }

  // Fallback for standalone payment or udhaar where number wasn't caught by currency markers
  if (!finalAmount) {
    const fallbackNumberMatch = normalized.match(/\b(\d{2,6})\b/);
    if (fallbackNumberMatch) {
      finalAmount = parseFloat(fallbackNumberMatch[1]);
    }
  }

  return {
    customer_name: customerName,
    customer_id: customerId,
    transaction_type: detectedType,
    amount: finalAmount,
    items: finalItems,
    confidence: customerName || finalItems.length > 0 ? 0.95 : 0.85,
    engine: 'regex_heuristic',
    raw_transcript: transcript,
    notes: `Heuristic parsing in ${language.toUpperCase()}`
  };
}
