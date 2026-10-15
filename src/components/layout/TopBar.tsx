'use client';

import React from 'react';
import { Smartphone, Monitor, Scale, Globe, Layers } from 'lucide-react';
import { useAppStore, useShallow } from '@/lib/store/useAppStore';
import { Language } from '@/types/domain';
import styles from './simulator.module.css';

const TAGLINES: Record<Language, string> = {
  bn: 'মুখে বলুন, খাতা আপডেট',
  hi: 'बोलकर लिखें, तुरंत बहीखाता',
  en: 'Voice-First Kirana Ledger & Credit Recovery',
};

export function TopBar() {
  const {
    viewportMode,
    setViewportMode,
    language,
    setLanguage,
    activeScreen,
    setActiveScreen,
  } = useAppStore(
    useShallow((s) => ({
      viewportMode: s.viewportMode,
      setViewportMode: s.setViewportMode,
      language: s.language,
      setLanguage: s.setLanguage,
      activeScreen: s.activeScreen,
      setActiveScreen: s.setActiveScreen,
    }))
  );

  return (
    <header className={styles.topBar}>
      {/* Brand Identity */}
      <div className={styles.brandGroup}>
        <div className={styles.brandLogo} aria-hidden="true">
          KV
        </div>
        <div className={styles.brandText}>
          <div className="flex items-center gap-2">
            <span className={styles.brandTitle}>KhataVoice</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
              PRO
            </span>
          </div>
          <span className={styles.brandTagline}>{TAGLINES[language]}</span>
        </div>
      </div>

      {/* Mode Switcher Pill */}
      <div className={styles.modeSwitcher} role="group" aria-label="Viewport Switcher">
        <button
          type="button"
          className={`${styles.modeButton} ${viewportMode === 'mobile' ? styles.modeButtonActive : ''}`}
          onClick={() => setViewportMode('mobile')}
          aria-pressed={viewportMode === 'mobile'}
        >
          <Smartphone className="size-3.5" />
          <span>Kirana Mobile</span>
        </button>
        <button
          type="button"
          className={`${styles.modeButton} ${viewportMode === 'desktop' ? styles.modeButtonActive : ''}`}
          onClick={() => setViewportMode('desktop')}
          aria-pressed={viewportMode === 'desktop'}
        >
          <Monitor className="size-3.5" />
          <span>Desktop Command</span>
        </button>
      </div>

      {/* Action Controls: Language & Judge Tour */}
      <div className={styles.actionsGroup}>
        <div className="flex items-center gap-1.5">
          <Globe className="size-3.5 text-muted-foreground hidden sm:inline-block" />
          <select
            className={styles.langSelect}
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            aria-label="Select Application Language"
          >
            <option value="bn">বাংলা (Bengali)</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="en">English</option>
          </select>
        </div>

        <button
          type="button"
          className={`${styles.judgeButton} ${activeScreen === 'architecture' ? styles.judgeButtonActive : ''}`}
          onClick={() => setActiveScreen(activeScreen === 'architecture' ? 'home' : 'architecture')}
          title="Open Architecture & Scalability Inspector"
          aria-pressed={activeScreen === 'architecture'}
        >
          <Layers className="size-3.5" />
          <span className="hidden sm:inline">Arch Inspector</span>
        </button>

        <button
          type="button"
          className={`${styles.judgeButton} ${activeScreen === 'judge' ? styles.judgeButtonActive : ''}`}
          onClick={() => setActiveScreen(activeScreen === 'judge' ? 'home' : 'judge')}
          title="Open Judge Tour & Unit Economics Simulator"
          aria-pressed={activeScreen === 'judge'}
        >
          <Scale className="size-3.5" />
          <span className="hidden sm:inline">Judge Tour</span>
        </button>
      </div>
    </header>
  );
}
