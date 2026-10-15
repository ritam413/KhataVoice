'use client';

import React from 'react';
import { Sparkles, Play, ArrowRight } from 'lucide-react';
import { AudioPreset, Language } from '@/types/speech';
import { audioPresets, getPresetsByLanguage } from '@/lib/speech/audio-presets';
import { Badge } from '@/components/ui/badge';

interface PresetSelectorProps {
  language: Language;
  onSelectPreset: (preset: AudioPreset) => void;
  disabled?: boolean;
}

export function PresetSelector({
  language,
  onSelectPreset,
  disabled = false,
}: PresetSelectorProps) {
  // Show presets matching current language first, then other available presets
  const langPresets = getPresetsByLanguage(language);
  const displayPresets = langPresets.length > 0 ? langPresets : audioPresets.slice(0, 3);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="size-3 text-primary" />
          <span>1-Click Test Presets</span>
        </span>
        <span className="text-[10px] text-muted-foreground">Demo / Zero-Mic</span>
      </div>

      <div className="flex flex-col gap-2">
        {displayPresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPreset(preset)}
            className="group w-full text-left p-2.5 rounded-xl border border-border/80 bg-card hover:bg-secondary/40 hover:border-primary/40 active:scale-[0.98] transition-all duration-150 flex items-center justify-between gap-3 disabled:opacity-50 disabled:pointer-events-none"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Play className="size-3.5 fill-current ml-0.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  {preset.expectedEntities.customerName || 'Store Restock'}
                </p>
                <p className="text-[11px] text-muted-foreground truncate font-sans">
                  &ldquo;{preset.transcript}&rdquo;
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {preset.expectedEntities.amount ? (
                <span className="text-xs font-black text-primary tabular-nums">
                  ₹{preset.expectedEntities.amount}
                </span>
              ) : (
                <Badge variant="outline" className="text-[10px] py-0">
                  Stock
                </Badge>
              )}
              <ArrowRight className="size-3.5 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
