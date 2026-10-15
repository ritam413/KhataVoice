# KV-16: Screens 3 & 4: Udhaar Credit Ledger & Real-Time Inventory Stock Views

- **Epic:** Epic 4: Dual-Mode Screens & UI Workflows
- **Priority:** P0 (Blocker)
- **Story Points:** 4 SP
- **Upstream Dependencies:** KV-11, KV-13
- **Downstream Blockers:** KV-18
- **Target Files:**
  - `src/components/views/LedgerScreen.tsx`
  - `src/components/views/InventoryScreen.tsx`
  - `src/components/views/views.module.css`

---

## 1. Architectural Role & Objective
Implement Screen 3 (Udhaar Credit Ledger View) and Screen 4 (Inventory Stock Management View). Screen 3 lists all customer credit accounts with their dynamic Kirana Trust Badges (Gold/Silver/Bronze), total outstanding balance, days overdue, and a 1-tap **"Send WhatsApp Reminder"** button. Screen 4 displays product stock levels, unit prices, low-stock warning tags, and quick +1/+5 restock buttons.

---

## 2. Input Contract & Pre-Conditions
- Customers and inventory items provided by the unified store or `GET /api/ledger` and `GET /api/inventory`.
- Action handlers to trigger WhatsApp reminder modal and stock increment.

---

## 3. State Invariants & Hardening Guards
- **Instant Search Filtering:** Customer list and inventory table must support instant client-side text search without network latency.
- **Negative Stock Visual Handling:** If an item's stock is $\le 0$, render an amber alert badge (`"⚠️ Low Stock: -1 pkg"`) and provide an immediate 1-tap `[+10 Restock]` CTA button.

---

## 4. Implementation Details

### 4.1 Screen 3: Udhaar Credit Ledger
- **Header:** Total Outstanding (₹3,010), Search Bar (*"Search customer name or phone"*).
- **Customer Cards / Rows:**
  - Customer Name: Shyam Sundar Das.
  - Trust Badge: Gold (88/100).
  - Current Debt: ₹420 (High-contrast red/amber).
  - Last Transaction: "2 hours ago".
  - Action Button: Green WhatsApp icon button (*"Send Reminder"*).

### 4.2 Screen 4: Store Inventory Management
- **Category Tabs:** All Items, Low Stock Alerts, Grains & Dal, Edible Oils, Snacks.
- **Item Row Components:**
  - Name: Fortune Mustard Oil (1L).
  - Stock Counter: `12 tins remaining` (or `0 tins - CRITICAL`).
  - Unit Price: ₹145.
  - Quick Restock Buttons: `[+5]` and `[+10]`.

---

## 5. Behavior-Driven Specification (Given / When / Then)

### Scenario 1: Trigger Reminder from Ledger
- **Given:** Shopkeeper views customer Shyam Sundar Das in Ledger.
- **When:** Shopkeeper taps "Send Reminder".
- **Then:** Selected customer is stored in state and Screen 5 (WhatsApp Modal) opens with pre-filled debt details.

### Scenario 2: Quick Restock Interaction
- **Given:** Salt has 2 packets remaining.
- **When:** Shopkeeper taps `[+10]`.
- **Then:** Stock count increments immediately to 12 packets and persists to DB.

---

## 6. Automated Verification Gates
```bash
# Typecheck Ledger and Inventory views
npx tsc --noEmit src/components/views/LedgerScreen.tsx src/components/views/InventoryScreen.tsx
```
