'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { Customer, InventoryItem, LedgerEntry } from '@/types/domain';
import { HomeScreen } from '@/components/views/HomeScreen';
import { LedgerScreen } from '@/components/views/LedgerScreen';
import { InventoryScreen } from '@/components/views/InventoryScreen';
import { JudgeEconomicsScreen } from '@/components/views/JudgeEconomicsScreen';
import { ArchitectureInspector } from '@/components/views/ArchitectureInspector';
import { VoiceEntryModal } from '@/components/views/VoiceEntryModal';
import { WhatsAppModal } from '@/components/views/WhatsAppModal';
import { BottomNav } from '@/components/layout/BottomNav';

interface MainClientViewProps {
  initialCustomers: Customer[];
  initialInventory: InventoryItem[];
  initialLedger: LedgerEntry[];
  merchantId?: string;
}

export function MainClientView({
  initialCustomers,
  initialInventory,
  initialLedger,
  merchantId = 'm_kolkata_kirana_001',
}: MainClientViewProps) {
  const activeScreen = useAppStore((state) => state.activeScreen);

  useEffect(() => {
    const store = useAppStore.getState();
    if (store.customers.length === 0 && initialCustomers.length > 0) {
      store.setCustomers(initialCustomers);
    }
    if (store.inventory.length === 0 && initialInventory.length > 0) {
      store.setInventory(initialInventory);
    }
    if (store.ledger.length === 0 && initialLedger.length > 0) {
      store.setLedger(initialLedger);
    }
  }, [initialCustomers, initialInventory, initialLedger]);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      {/* Screen Routing */}
      <div className="flex-1 w-full overflow-hidden">
        {activeScreen === 'ledger' && <LedgerScreen />}
        {activeScreen === 'inventory' && <InventoryScreen />}
        {activeScreen === 'judge' && <JudgeEconomicsScreen />}
        {activeScreen === 'architecture' && <ArchitectureInspector />}
        {activeScreen !== 'ledger' &&
          activeScreen !== 'inventory' &&
          activeScreen !== 'judge' &&
          activeScreen !== 'architecture' && <HomeScreen />}
      </div>

      {/* Sticky Bottom Navigation (hidden during Judge / Architecture tours) */}
      {activeScreen !== 'judge' && activeScreen !== 'architecture' && <BottomNav />}

      {/* Voice Capture Modal Overlay */}
      <VoiceEntryModal merchantId={merchantId} />

      {/* Screen 5: Cultural WhatsApp Debt Recovery Modal Overlay */}
      <WhatsAppModal />
    </div>
  );
}
