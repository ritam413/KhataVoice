import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import {
  Customer,
  InventoryItem,
  LedgerEntry,
  Language,
} from '@/types/domain';
import { ParsedTransaction } from '@/types/nlp';

export type ViewportMode = 'mobile' | 'desktop';
export type ActiveScreen = 'home' | 'voice' | 'ledger' | 'inventory' | 'whatsapp' | 'judge' | 'architecture';
export type VoiceState =
  | 'idle'
  | 'listening'
  | 'transcribing'
  | 'parsed'
  | 'countdown'
  | 'committing'
  | 'confirmed'
  | 'error';

export interface AppState {
  // UI & Viewport Slice
  viewportMode: ViewportMode;
  language: Language;
  activeScreen: ActiveScreen;
  isVoiceModalOpen: boolean;
  selectedCustomerForReminder: Customer | null;

  // Voice Pipeline Slice
  voiceState: VoiceState;
  transcript: string;
  interimTranscript: string;
  parsedTransaction: ParsedTransaction | null;
  countdownSeconds: number;
  isSyncing: boolean;

  // Domain Data Slice
  customers: Customer[];
  inventory: InventoryItem[];
  ledger: LedgerEntry[];

  // Actions
  setViewportMode: (mode: ViewportMode) => void;
  setLanguage: (lang: Language) => void;
  setActiveScreen: (screen: ActiveScreen) => void;
  setVoiceModalOpen: (open: boolean) => void;
  setSelectedCustomerForReminder: (customer: Customer | null) => void;

  setVoiceState: (state: VoiceState) => void;
  setTranscript: (text: string, isInterim?: boolean) => void;
  setParsedTransaction: (parsed: ParsedTransaction | null) => void;
  setCountdownSeconds: (seconds: number) => void;
  setIsSyncing: (isSyncing: boolean) => void;
  resetVoiceState: () => void;

  setCustomers: (customers: Customer[]) => void;
  setInventory: (inventory: InventoryItem[]) => void;
  setLedger: (ledger: LedgerEntry[]) => void;
  addTransaction: (
    entry: LedgerEntry,
    updatedCustomer?: Customer,
    updatedItems?: InventoryItem[]
  ) => void;
  restockItem: (itemId: string, quantity: number) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  // Initial UI state
  viewportMode: 'mobile',
  language: 'bn',
  activeScreen: 'home',
  isVoiceModalOpen: false,
  selectedCustomerForReminder: null,

  // Initial Voice state
  voiceState: 'idle',
  transcript: '',
  interimTranscript: '',
  parsedTransaction: null,
  countdownSeconds: 4,
  isSyncing: false,

  // Initial Data state
  customers: [],
  inventory: [],
  ledger: [],

  // UI Actions
  setViewportMode: (viewportMode) => set({ viewportMode }),
  setLanguage: (language) => set({ language }),
  setActiveScreen: (activeScreen) => set({ activeScreen }),
  setVoiceModalOpen: (isVoiceModalOpen) => set({ isVoiceModalOpen }),
  setSelectedCustomerForReminder: (selectedCustomerForReminder) =>
    set({ selectedCustomerForReminder }),

  // Voice Actions
  setVoiceState: (voiceState) => set({ voiceState }),
  setTranscript: (text, isInterim = false) =>
    set(isInterim ? { interimTranscript: text } : { transcript: text, interimTranscript: '' }),
  setParsedTransaction: (parsedTransaction) => set({ parsedTransaction }),
  setCountdownSeconds: (countdownSeconds) => set({ countdownSeconds }),
  setIsSyncing: (isSyncing) => set({ isSyncing }),
  resetVoiceState: () =>
    set({
      voiceState: 'idle',
      transcript: '',
      interimTranscript: '',
      parsedTransaction: null,
      countdownSeconds: 4,
      isSyncing: false,
    }),

  // Data Actions
  setCustomers: (customers) => set({ customers }),
  setInventory: (inventory) => set({ inventory }),
  setLedger: (ledger) => set({ ledger }),
  addTransaction: (entry, updatedCustomer, updatedItems) =>
    set((state) => ({
      ledger: [entry, ...state.ledger],
      customers: updatedCustomer
        ? state.customers.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
        : state.customers,
      inventory: updatedItems && updatedItems.length > 0
        ? state.inventory.map((item) => {
            const match = updatedItems.find((u) => u.id === item.id);
            return match ? match : item;
          })
        : state.inventory,
    })),
  restockItem: (itemId, quantity) =>
    set((state) => ({
      inventory: state.inventory.map((item) =>
        item.id === itemId
          ? { ...item, current_stock: item.current_stock + quantity }
          : item
      ),
    })),
}));

export { useShallow };
