'use client';

import React from 'react';
import { Mic, BookOpen, Package } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';

export function BottomNav() {
  const { activeScreen, setActiveScreen, customers, inventory } = useAppStore();

  const debtorsCount = customers.filter((c) => c.current_balance > 0).length || customers.length;
  const lowStockCount = inventory.filter((i) => i.current_stock <= i.low_stock_threshold).length;

  return (
    <nav
      className="absolute bottom-0 left-0 right-0 h-16 bg-card/90 backdrop-blur-md border-t border-border/80 grid grid-cols-3 px-2 z-30 select-none"
      aria-label="Kirana Handset Navigation"
    >
      {/* 1. Voice Home Tab */}
      <button
        onClick={() => setActiveScreen('home')}
        className={`flex flex-col items-center justify-center gap-1 transition-transform active:scale-95 ${
          activeScreen === 'home'
            ? 'text-primary font-bold'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="Spoken Voice Home"
      >
        <Mic className={`size-5 transition-transform ${activeScreen === 'home' ? 'scale-110' : ''}`} />
        <span className="text-[11px]">Home</span>
      </button>

      {/* 2. Udhaar Ledger Tab */}
      <button
        onClick={() => setActiveScreen('ledger')}
        className={`flex flex-col items-center justify-center gap-1 relative transition-transform active:scale-95 ${
          activeScreen === 'ledger'
            ? 'text-primary font-bold'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="Udhaar Credit Ledger"
      >
        <BookOpen className={`size-5 transition-transform ${activeScreen === 'ledger' ? 'scale-110' : ''}`} />
        <span className="text-[11px]">Ledger</span>
        {debtorsCount > 0 && (
          <span className="absolute top-2.5 right-6 size-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-sm shadow-rose-500/50">
            {debtorsCount}
          </span>
        )}
      </button>

      {/* 3. Stock Inventory Tab */}
      <button
        onClick={() => setActiveScreen('inventory')}
        className={`flex flex-col items-center justify-center gap-1 relative transition-transform active:scale-95 ${
          activeScreen === 'inventory'
            ? 'text-primary font-bold'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="Store Stock Inventory"
      >
        <Package className={`size-5 transition-transform ${activeScreen === 'inventory' ? 'scale-110' : ''}`} />
        <span className="text-[11px]">Stock</span>
        {lowStockCount > 0 && (
          <span className="absolute top-2.5 right-6 size-4 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center shadow-sm shadow-amber-500/50">
            {lowStockCount}
          </span>
        )}
      </button>
    </nav>
  );
}
