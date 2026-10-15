# KV-14: Dual-Mode Viewport Simulator (Mobile Handset vs. Desktop Command Center)

- **Epic:** Epic 4: Dual-Mode Screens & UI Workflows
- **Priority:** P0 (Blocker)
- **Story Points:** 3 SP
- **Upstream Dependencies:** KV-04
- **Downstream Blockers:** KV-18
- **Target Files:**
  - `src/components/layout/ViewportSimulator.tsx`
  - `src/components/layout/TopBar.tsx`
  - `src/components/layout/simulator.module.css`
  - `src/lib/store/useAppStore.ts`

---

## 1. Architectural Role & Objective
Implement the top-level dual-mode viewport simulator and unified state store. Allows hackathon judges to toggle between:
1. **"📱 Kirana Mobile Handset" Mode:** Simulates an authentic Android smartphone frame ($390\text{px} \times 844\text{px}$) with status bar, bottom navigation, and oversized touch targets tailored for shopkeepers.
2. **"💻 Desktop Command Center" Mode:** Expands into a widescreen multi-column merchant operations dashboard featuring real-time event logs, inventory analytics, and customer debt ledgers.
A shared reactive state store ensures zero desync when switching viewports.

---

## 2. Input Contract & Pre-Conditions
- Viewport toggle options: `'mobile'` | `'desktop'`.
- Shared state attributes:
  - `activeMerchant: Merchant`
  - `customers: Customer[]`
  - `inventory: InventoryItem[]`
  - `ledgerEntries: LedgerEntry[]`
  - `currentLanguage: 'bn' | 'hi' | 'en'`
  - `activeScreen: 'home' | 'voice' | 'ledger' | 'inventory' | 'whatsapp' | 'judge'`

---

## 3. State Invariants & Hardening Guards
- **Zero State Drift:** State mutations executed in mobile view (e.g. spoken voice entry or stock update) must reflect instantly when switching to desktop view, and vice versa.
- **Responsive Chassis Scaling:** On small screens (actual physical mobile phones), the simulated chassis must gracefully adapt to $100\%$ viewport width rather than clipping or overflowing horizontally.

---

## 4. Implementation Details

### 4.1 State Store (`src/lib/store/useAppStore.ts`)
Standardized on **Zustand v5** (`zustand@^5.0.15`):
```typescript
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { Customer, InventoryItem, LedgerEntry } from '@/types/database';

export interface AppState {
  // UI & Viewport Slice
  viewportMode: 'mobile' | 'desktop';
  language: 'bn' | 'hi' | 'en';
  activeScreen: 'home' | 'voice' | 'ledger' | 'inventory' | 'whatsapp' | 'judge';
  isVoiceModalOpen: boolean;
  selectedCustomerForReminder: Customer | null;
  
  // Data Slice
  customers: Customer[];
  inventory: InventoryItem[];
  ledger: LedgerEntry[];
  
  // Actions
  setViewportMode: (mode: 'mobile' | 'desktop') => void;
  setLanguage: (lang: 'bn' | 'hi' | 'en') => void;
  setActiveScreen: (screen: 'home' | 'voice' | 'ledger' | 'inventory' | 'whatsapp' | 'judge') => void;
  setVoiceModalOpen: (open: boolean) => void;
  setSelectedCustomerForReminder: (customer: Customer | null) => void;
  setCustomers: (customers: Customer[]) => void;
  setInventory: (inventory: InventoryItem[]) => void;
  setLedger: (ledger: LedgerEntry[]) => void;
  addTransaction: (entry: LedgerEntry, updatedCustomer: Customer, updatedItems: InventoryItem[]) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  viewportMode: 'mobile',
  language: 'bn',
  activeScreen: 'home',
  isVoiceModalOpen: false,
  selectedCustomerForReminder: null,
  customers: [],
  inventory: [],
  ledger: [],
  setViewportMode: (viewportMode) => set({ viewportMode }),
  setLanguage: (language) => set({ language }),
  setActiveScreen: (activeScreen) => set({ activeScreen }),
  setVoiceModalOpen: (isVoiceModalOpen) => set({ isVoiceModalOpen }),
  setSelectedCustomerForReminder: (selectedCustomerForReminder) => set({ selectedCustomerForReminder }),
  setCustomers: (customers) => set({ customers }),
  setInventory: (inventory) => set({ inventory }),
  setLedger: (ledger) => set({ ledger }),
  addTransaction: (entry, updatedCustomer, updatedItems) =>
    set((state) => ({
      ledger: [entry, ...state.ledger],
      customers: state.customers.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)),
      inventory: state.inventory.map((item) => {
        const match = updatedItems.find((u) => u.id === item.id);
        return match ? match : item;
      }),
    })),
}));

export { useShallow };
```


### 4.2 Chassis Shell (`src/components/layout/ViewportSimulator.tsx`)
- Renders top navigation bar with:
  - Brand Logo & Vernacular Tagline (*"KhataVoice: মুখে বলুন, খাতা আপডেট"*).
  - Mode Switcher Pill (`[📱 Mobile View] | [💻 Desktop Command Center]`).
  - Language Dropdown (`বাংলা | हिन्दी | English`).
  - Quick Link to *"⚖️ Judge Economics Tour"*.
- In Mobile Mode: Wraps content inside a sleek phone chassis with glassmorphic borders and realistic status notch.
- In Desktop Mode: Renders responsive full-bleed grid layout.

---

## 5. Behavior-Driven Specification (Given / When / Then)

### Scenario 1: Toggle Viewport Mode
- **Given:** User is recording an entry in Mobile View.
- **When:** User clicks "[💻 Desktop Command Center]".
- **Then:** Viewport smoothly transitions into the desktop layout, preserving all loaded data and state.

---

## 6. Automated Verification Gates
```bash
# Typecheck ViewportSimulator and store
npx tsc --noEmit src/components/layout/ViewportSimulator.tsx src/lib/store/useAppStore.ts
```
