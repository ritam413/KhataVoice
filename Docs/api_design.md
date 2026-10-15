# KhataVoice: RESTful API Design Specification

This document defines the complete API contracts, request/response schemas, error structures, and validation rules for **KhataVoice** built using Next.js 14/15 Route Handlers.

---

## 1. Global Standards & Conventions

- **Base URL:** `/api`
- **Content Type:** `application/json` (except audio upload which accepts `multipart/form-data` or JSON with base64 audio)
- **Authentication:** Local session / Merchant ID header (`x-merchant-id: "merchant_01"`)
- **Standard Success Response Envelope:**
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-10-12T21:40:00.000Z"
}
```
- **Standard Error Response Envelope:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human readable error description",
    "details": null
  },
  "timestamp": "2026-10-12T21:40:00.000Z"
}
```

---

## 2. Speech & NLP Endpoints

### 2.1 Transcribe Audio
Transcribes spoken audio into vernacular text using the multi-tier speech adapter (Bhashini Dhruva ASR / Whisper / Presets).

- **Route:** `POST /api/transcribe`
- **Request Headers:**
  - `Content-Type: application/json`
- **Request Body:**
```json
{
  "audioBase64": "UklGRiQAAABXQVZFZm10IBAAAAABAAEA...",
  "audioFormat": "wav",
  "samplingRate": 16000,
  "language": "bn", // "bn" | "hi" | "en"
  "serviceId": "ai4bharat/conformer-multilingual--gpu" // optional
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transcript": "শ্যাম কাকুকে ২ প্যাকেট সরিষার তেল আর ১ কেজি চিনি ২৬০ টাকা ধার দিলাম",
    "language": "bn",
    "engine": "bhashini_dhruva", // "bhashini_dhruva" | "web_speech" | "audio_preset"
    "durationMs": 420,
    "confidence": 0.94
  }
}
```
- **Error Codes:**
  - `400 INVALID_AUDIO_PAYLOAD`: Missing or corrupted base64 audio.
  - `504 SPEECH_API_TIMEOUT`: External speech server timed out (>3.5s).

---

### 2.2 Parse Transaction
Parses unstructured vernacular text into structured financial and stock entities.

- **Route:** `POST /api/parse-transaction`
- **Request Headers:**
  - `Content-Type: application/json`
- **Request Body:**
```json
{
  "transcript": "Shyam kaku ke 2 packet mustard oil ar 1kg chini 260 taka udhaar dilam",
  "language": "bn",
  "merchantId": "merchant_01"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "customer_name": "Shyam Kaku",
    "amount": 260,
    "transaction_type": "UDHAAR_SALE",
    "items": [
      {
        "item_name": "Fortune Mustard Oil",
        "matched_sku": "SKU_OIL_01",
        "quantity": 2,
        "unit": "packet",
        "unit_price": 110
      },
      {
        "item_name": "Loose Sugar",
        "matched_sku": "SKU_SUG_01",
        "quantity": 1,
        "unit": "kg",
        "unit_price": 40
      }
    ],
    "notes": "Spoken credit sale via Bengali voice entry",
    "confidence": 0.96,
    "parser_used": "ollama_llama3" // "ollama_llama3" | "gemini_flash" | "regex_heuristic"
  }
}
```

---

## 3. Atomic Dual-Sync Endpoint

### 3.1 Execute Dual-Sync Transaction
Atomically commits a transaction across the customer ledger, store inventory, and credit trust score engine.

- **Route:** `POST /api/dual-sync`
- **Request Headers:**
  - `Content-Type: application/json`
- **Request Body:**
```json
{
  "merchantId": "merchant_01",
  "customer_name": "Shyam Kaku",
  "amount": 260,
  "transaction_type": "UDHAAR_SALE",
  "items": [
    {
      "item_name": "Fortune Mustard Oil",
      "quantity": 2,
      "unit": "packet"
    },
    {
      "item_name": "Loose Sugar",
      "quantity": 1,
      "unit": "kg"
    }
  ],
  "raw_transcript": "Shyam kaku ke 2 packet mustard oil ar 1kg chini 260 taka udhaar dilam"
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "ledger_entry": {
      "id": "entry_99812",
      "timestamp": "2026-10-12T21:41:00.000Z",
      "customer_name": "Shyam Kaku",
      "amount": 260,
      "type": "UDHAAR_SALE",
      "items": [...]
    },
    "customer_snapshot": {
      "customer_name": "Shyam Kaku",
      "new_outstanding_balance": 1420,
      "credit_trust_score": 86,
      "trust_tier": "GOLD"
    },
    "inventory_updates": [
      { "item_name": "Fortune Mustard Oil", "new_stock_count": 18, "status": "IN_STOCK" },
      { "item_name": "Loose Sugar", "new_stock_count": 34, "status": "IN_STOCK" }
    ]
  }
}
```

---

## 4. Ledger & Inventory Management Endpoints

### 4.1 Get Ledger Entries
- **Route:** `GET /api/ledger`
- **Query Parameters:**
  - `customer`: (Optional) Filter by customer name.
  - `type`: (Optional) `UDHAAR_SALE` | `CASH_SALE` | `PAYMENT_RECEIVED` | `RESTOCK_PURCHASE`.
  - `limit`: (Optional, default: 50).
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "entry_99812",
        "customer_name": "Shyam Kaku",
        "amount": 260,
        "type": "UDHAAR_SALE",
        "timestamp": "2026-10-12T21:41:00.000Z",
        "items": [...]
      }
    ],
    "summary": {
      "total_udhaar_today": 1240,
      "total_cash_today": 3480,
      "payments_collected_today": 1850
    }
  }
}
```

---

### 4.2 Get Inventory Catalog
- **Route:** `GET /api/inventory`
- **Query Parameters:**
  - `status`: (Optional) `ALL` | `LOW_STOCK` | `DEPLETED`.
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "item_01",
        "name": "Fortune Mustard Oil 1L",
        "category": "Edible Oils",
        "current_stock": 4,
        "unit": "bottle",
        "reorder_threshold": 5,
        "cost_price": 115,
        "selling_price": 130,
        "status": "LOW_STOCK"
      }
    ],
    "total_skus": 24,
    "low_stock_count": 3,
    "total_valuation": 48250
  }
}
```

---

## 5. Debt Recovery & WhatsApp Endpoints

### 5.1 Generate Cultural WhatsApp Reminder
Generates culturally polite reminder copy and formats the deep link URL with embedded UPI payment schemes.

- **Route:** `POST /api/reminders/generate`
- **Request Body:**
```json
{
  "customer_name": "Sunita Devi",
  "phone_number": "9830012345",
  "amount_due": 1850,
  "language": "bn", // "bn" | "hi" | "en"
  "tone": "POLITE_GENTLE", // "POLITE_GENTLE" | "FRIENDLY_FOLLOWUP" | "FIRM_OVERDUE"
  "merchantUpiId": "maatarastore@okaxis",
  "storeName": "Maa Tara General Store"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "customer_name": "Sunita Devi",
    "message_text": "নমস্কার Sunita Devi কাকীমা, Maa Tara General Store এ আপনার ₹1850 টাকার হিসাব বাকি আছে। সময় মতো PhonePe বা GPay এর মাধ্যমে নিচে দেওয়া লিঙ্ক এ ক্লিক করে পরিশোধ করে দেবেন। ধন্যবাদ: upi://pay?pa=maatarastore@okaxis&pn=Maa%20Tara%20General%20Store&am=1850&cu=INR",
    "whatsapp_url": "https://wa.me/919830012345?text=%E0%A6%A8%E0%A6%AE%E0%A6%B8%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%B0...",
    "upi_deep_link": "upi://pay?pa=maatarastore@okaxis&pn=Maa%20Tara%20General%20Store&am=1850&cu=INR",
    "trust_score": 88,
    "trust_tier": "GOLD"
  }
}
```

---

## 6. Business & Judge Metrics Endpoints

### 6.1 Get Business Metrics & Unit Economics
- **Route:** `GET /api/business-metrics`
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_active_merchants": 1,
    "total_customers_tracked": 18,
    "total_working_capital_locked": 38450,
    "total_recovered_this_month": 16200,
    "cost_per_voice_entry_inr": 0.10,
    "pro_subscription_price_inr": 199,
    "gross_margin_percentage": 78.4,
    "average_kirana_monthly_roi_multiplier": 10.8
  }
}
```
