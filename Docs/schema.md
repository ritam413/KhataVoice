# KhataVoice: TypeScript Interfaces & Zod Validation Schemas (schema.md)

This document defines the production TypeScript definitions, Zod validation contracts, and JSON-LD structured data schemas for **KhataVoice**.

---

## 1. Domain TypeScript Interfaces

```typescript
// ==========================================
// 1. Transaction & Item Core Types
// ==========================================

export type TransactionType = 
  | 'UDHAAR_SALE'        // Spoken credit given to customer
  | 'CASH_SALE'          // Immediate cash received for goods
  | 'PAYMENT_RECEIVED'   // Customer settling outstanding credit
  | 'RESTOCK_PURCHASE';  // Merchant restocking store inventory

export type TrustTier = 'GOLD' | 'SILVER' | 'BRONZE';

export type ReminderTone = 'POLITE_GENTLE' | 'FRIENDLY_FOLLOWUP' | 'FIRM_OVERDUE';

export type SupportedLanguage = 'bn' | 'hi' | 'en';

export interface LineItem {
  item_name: string;
  matched_sku?: string;
  quantity: number;
  unit: 'packet' | 'kg' | 'litre' | 'bottle' | 'bag' | 'unit';
  unit_price?: number;
}

export interface ParsedTransaction {
  customer_name: string;
  amount: number;
  transaction_type: TransactionType;
  items: LineItem[];
  confidence: number;
  raw_transcript: string;
  language: SupportedLanguage;
  notes?: string;
}

// ==========================================
// 2. Customer & Credit Entities
// ==========================================

export interface Customer {
  id: string;
  merchant_id: string;
  name: string;
  phone_number: string;
  current_balance: number;
  credit_trust_score: number; // 0 to 100
  trust_tier: TrustTier;
  last_payment_date?: string;
  lifetime_credit_repaid: number;
  created_at: string;
}

export interface TrustScoreBreakdown {
  score: number;
  tier: TrustTier;
  velocity_points: number;     // max 40
  overdue_ratio_points: number; // max 30
  frequency_points: number;    // max 15
  history_points: number;      // max 15
  turnaround_days_avg: number;
  recommendation: string;
}

// ==========================================
// 3. Inventory Entities
// ==========================================

export interface InventoryItem {
  id: string;
  merchant_id: string;
  sku: string;
  name_english: string;
  name_vernacular: string;
  category: string;
  current_stock: number;
  unit: string;
  reorder_threshold: number;
  cost_price: number;
  selling_price: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'DEPLETED';
  updated_at: string;
}

// ==========================================
// 4. Ledger & Recovery Entities
// ==========================================

export interface LedgerEntry {
  id: string;
  merchant_id: string;
  customer_id?: string;
  customer_name: string;
  amount: number;
  type: TransactionType;
  items: LineItem[];
  raw_audio_transcript?: string;
  created_at: string;
}

export interface WhatsAppReminderPayload {
  customer_name: string;
  phone_number: string;
  amount_due: number;
  language: SupportedLanguage;
  tone: ReminderTone;
  message_text: string;
  whatsapp_url: string;
  upi_deep_link: string;
}
```

---

## 2. Zod Validation Schemas

```typescript
import { z } from 'zod';

// ==========================================
// Zod: Speech Transcription Request
// ==========================================
export const TranscribeRequestSchema = z.object({
  audioBase64: z.string().min(1, 'Audio base64 string is required'),
  audioFormat: z.enum(['wav', 'webm', 'ogg']).default('wav'),
  samplingRate: z.number().int().positive().default(16000),
  language: z.enum(['bn', 'hi', 'en']).default('bn'),
  serviceId: z.string().optional()
});

// ==========================================
// Zod: NLP Parsing Request
// ==========================================
export const ParseTransactionRequestSchema = z.object({
  transcript: z.string().min(2, 'Transcript string cannot be empty'),
  language: z.enum(['bn', 'hi', 'en']).default('bn'),
  merchantId: z.string().default('merchant_01')
});

// ==========================================
// Zod: Atomic Dual-Sync Request
// ==========================================
export const DualSyncTransactionSchema = z.object({
  merchantId: z.string().default('merchant_01'),
  customer_name: z.string().min(2, 'Customer name is required'),
  amount: z.number().positive('Transaction amount must be greater than 0'),
  transaction_type: z.enum(['UDHAAR_SALE', 'CASH_SALE', 'PAYMENT_RECEIVED', 'RESTOCK_PURCHASE']),
  items: z.array(
    z.object({
      item_name: z.string().min(1),
      quantity: z.number().positive(),
      unit: z.enum(['packet', 'kg', 'litre', 'bottle', 'bag', 'unit']).default('unit'),
      unit_price: z.number().optional()
    })
  ).default([]),
  raw_transcript: z.string().optional()
});

// ==========================================
// Zod: WhatsApp Reminder Generator Request
// ==========================================
export const GenerateReminderSchema = z.object({
  customer_name: z.string().min(1),
  phone_number: z.string().regex(/^[0-9]{10,12}$/, 'Valid 10-12 digit phone number required'),
  amount_due: z.number().positive(),
  language: z.enum(['bn', 'hi', 'en']).default('bn'),
  tone: z.enum(['POLITE_GENTLE', 'FRIENDLY_FOLLOWUP', 'FIRM_OVERDUE']).default('POLITE_GENTLE'),
  merchantUpiId: z.string().min(5),
  storeName: z.string().min(1)
});
```

---

## 3. JSON-LD Structured Data Schema (SEO)

To comply with high-ranking web application standards, the application injects the following JSON-LD microdata:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "KhataVoice",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "All (Web, Mobile Responsive)",
  "offers": {
    "@type": "Offer",
    "price": "199.00",
    "priceCurrency": "INR"
  },
  "description": "AI-powered, multilingual voice ledger, inventory manager, and credit recovery platform for India's 13 million Kirana shopkeepers.",
  "featureList": [
    "Voice-to-Ledger Transcription in Bengali, Hindi, and English",
    "Real-time Atomic Inventory Dual-Sync",
    "0-100 Customer Credit Trust Scoring",
    "1-Tap WhatsApp Recovery Reminders with UPI Deep Links"
  ],
  "creator": {
    "@type": "Organization",
    "name": "Next Founders Hackathon Team"
  }
}
</script>
```
