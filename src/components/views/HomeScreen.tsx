'use client';

import React from 'react';
import {
  Mic,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Users,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { useAppStore, useShallow } from '@/lib/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrustBadge } from '@/components/ui/trust-badge';
import { SEED_MERCHANT } from '@/lib/db/seed-data';
import { PresetSelector } from '@/components/audio/PresetSelector';
import { AudioPreset } from '@/types/speech';

interface HomeScreenProps {
  onOpenVoiceModal?: () => void;
  onSelectPreset?: (preset: AudioPreset) => void;
}

export function HomeScreen({ onOpenVoiceModal, onSelectPreset }: HomeScreenProps) {
  const {
    language,
    customers,
    inventory,
    ledger,
    setVoiceModalOpen,
    setVoiceState,
    setTranscript,
    setActiveScreen,
  } = useAppStore(
    useShallow((s) => ({
      language: s.language,
      customers: s.customers,
      inventory: s.inventory,
      ledger: s.ledger,
      setVoiceModalOpen: s.setVoiceModalOpen,
      setVoiceState: s.setVoiceState,
      setTranscript: s.setTranscript,
      setActiveScreen: s.setActiveScreen,
    }))
  );

  const totalUdhaar = customers.reduce(
    (sum, c) => sum + Math.max(0, c.current_balance),
    0
  );

  const avgTrustScore = customers.length > 0
    ? Math.round(customers.reduce((sum, c) => sum + c.trust_score, 0) / customers.length)
    : 82;

  const atRiskCount = customers.filter(
    (c) => c.trust_badge === 'BRONZE' || c.trust_score < 65
  ).length;

  const lowStockCount = inventory.filter(
    (i) => i.current_stock <= i.low_stock_threshold
  ).length;

  const handleMicTap = () => {
    if (onOpenVoiceModal) {
      onOpenVoiceModal();
    } else {
      setVoiceState('listening');
      setVoiceModalOpen(true);
    }
  };

  const handlePresetTap = (preset: AudioPreset) => {
    if (onSelectPreset) {
      onSelectPreset(preset);
    } else {
      setTranscript(preset.transcript);
      setVoiceState('listening');
      setVoiceModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col gap-3.5 pb-8">
      {/* Merchant Header Card */}
      <div className="flex items-center justify-between pb-3 border-b border-border/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-9 rounded-[10px] bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-primary-foreground font-black text-xs shadow-md shrink-0">
            মা
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-foreground leading-tight truncate">
              {SEED_MERCHANT.business_name}
            </h1>
            <p className="text-[11px] text-muted-foreground truncate">
              {SEED_MERCHANT.owner_name} • {SEED_MERCHANT.phone_number}
            </p>
          </div>
        </div>
        <Badge variant="emerald" className="gap-1 py-0.5 text-[10px] shrink-0">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active</span>
        </Badge>
      </div>

      {/* Hero Credit Health Card */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-secondary/30 p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Udhaar Balance
            </span>
            <div className="text-2xl font-black text-rose-500 tabular-nums leading-tight mt-0.5">
              ₹{totalUdhaar.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Store Rating
            </span>
            <TrustBadge score={avgTrustScore} size="sm" language="en" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-border/60">
          <div className="p-2 rounded-xl bg-secondary/30 border border-border/50">
            <span className="text-[10px] text-muted-foreground block">Recovered This Week</span>
            <span className="text-xs font-bold text-emerald-500 tabular-nums">+₹2,450</span>
          </div>
          <div className="p-2 rounded-xl bg-secondary/30 border border-border/50">
            <span className="text-[10px] text-muted-foreground block">At-Risk Accounts</span>
            <span className="text-xs font-bold text-rose-400 tabular-nums">
              {atRiskCount > 0 ? `${atRiskCount} Customers` : '0 At-Risk'}
            </span>
          </div>
        </div>
      </div>

      {/* Giant Saffron 1-Tap Microphone CTA */}
      <div
        onClick={handleMicTap}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleMicTap();
        }}
        className="group relative rounded-2xl border border-primary/40 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent p-4 text-center cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-lg hover:shadow-primary/10 active:scale-[0.98]"
      >
        <div className="flex justify-center mb-2.5">
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-primary/20 blur-md group-hover:bg-primary/30 transition-all animate-pulse" />
            <Button
              variant="default"
              size="voiceHero"
              aria-label="Tap to Record Spoken Transaction"
              className="relative shadow-xl shadow-primary/30 group-hover:scale-105 active:scale-95 transition-transform"
            >
              <Mic className="size-8" />
            </Button>
          </div>
        </div>

        <h2 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors">
          বোলিয়ে বা লিখুন (Tap Mic & Speak)
        </h2>

        <div className="mt-1 space-y-0.5">
          <p className="text-[11px] text-muted-foreground">
            &ldquo;শ্যামবাবু ২ কেজি মিনিকেট চাল বাকি লিখুন&rdquo;
          </p>
          <p className="text-[10px] text-muted-foreground/75">
            &ldquo;रोहित जी 150 रुपये उधार लिख लो&rdquo;
          </p>
        </div>
      </div>

      {/* Quick Action Badges */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setActiveScreen('ledger')}
          className="p-2.5 rounded-xl border border-border bg-card/60 hover:bg-card flex items-center justify-between text-left transition-transform active:scale-95 cursor-pointer"
          aria-label="Open Udhaar Ledger"
        >
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <PhoneCall className="size-3.5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-foreground">Reminders</p>
              <p className="text-[10px] text-muted-foreground">1-Tap WhatsApp</p>
            </div>
          </div>
          <ArrowRight className="size-3 text-muted-foreground/60" />
        </button>

        <button
          onClick={() => setActiveScreen('inventory')}
          className="p-2.5 rounded-xl border border-border bg-card/60 hover:bg-card flex items-center justify-between text-left transition-transform active:scale-95 cursor-pointer"
          aria-label="Open Stock Inventory"
        >
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Package className="size-3.5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-foreground">Low Stock</p>
              <p className="text-[10px] text-muted-foreground">
                {lowStockCount > 0 ? `${lowStockCount} items` : 'Stock OK'}
              </p>
            </div>
          </div>
          <ArrowRight className="size-3 text-muted-foreground/60" />
        </button>
      </div>

      {/* 1-Click Test Presets */}
      <div className="pt-1">
        <PresetSelector language={language} onSelectPreset={handlePresetTap} />
      </div>

      {/* Recent Activity Mini-Feed */}
      {ledger.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Recent Store Entries
          </span>
          <div className="space-y-1.5">
            {ledger.slice(0, 3).map((entry) => (
              <div
                key={entry.id}
                className="p-2 rounded-xl border border-border/60 bg-card/40 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-foreground">
                    {entry.customer_name || 'Walk-in'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {entry.transaction_type === 'udhaar_sale' ? 'Udhaar Sale' : 'Cash/Payment'}
                  </p>
                </div>
                <span
                  className={`font-black tabular-nums ${
                    entry.transaction_type === 'udhaar_sale' ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {entry.transaction_type === 'udhaar_sale' ? '+' : '-'}₹{entry.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
