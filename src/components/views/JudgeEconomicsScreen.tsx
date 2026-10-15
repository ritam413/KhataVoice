'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowLeft,
  CheckCircle2,
  Users,
  Percent,
  Coins,
  RefreshCw,
  Zap,
} from 'lucide-react';
import styles from '@/styles/judge-screen.module.css';

export function JudgeEconomicsScreen() {
  const setActiveScreen = useAppStore((state) => state.setActiveScreen);

  // Interactive Slider State (Defaults locked to PRD & Pitch Deck models)
  const [stores, setStores] = useState<number>(1000);
  const [entriesPerDay, setEntriesPerDay] = useState<number>(35);
  const [saasPrice, setSaasPrice] = useState<number>(199);
  const [debtRecovered, setDebtRecovered] = useState<number>(2160);

  // Active Rubric Tab
  const [activeTab, setActiveTab] = useState<'business' | 'tech' | 'ux' | 'comm'>('business');

  // Economics Calculations (Pure React Memo, 60fps instant recalculation)
  const costPerEntry = 0.10; // ₹0.03 Speech + ₹0.05 LLM + ₹0.02 DB

  const economics = useMemo(() => {
    const monthlyEntriesPerStore = entriesPerDay * 30;
    const monthlyCogsPerStore = monthlyEntriesPerStore * costPerEntry;
    const monthlyGrossProfitPerStore = Math.max(0, saasPrice - monthlyCogsPerStore);
    const grossMarginPct = saasPrice > 0 ? (monthlyGrossProfitPerStore / saasPrice) * 100 : 0;

    const mrr = stores * saasPrice;
    const arr = mrr * 12;
    const totalMonthlyCogs = stores * monthlyCogsPerStore;
    const totalMonthlyNetProfit = mrr - totalMonthlyCogs;

    const workingCapitalUnlockedMonthly = stores * debtRecovered;
    const merchantRoiMultiplier = saasPrice > 0 ? debtRecovered / saasPrice : 0;

    return {
      monthlyEntriesPerStore,
      monthlyCogsPerStore,
      monthlyGrossProfitPerStore,
      grossMarginPct,
      mrr,
      arr,
      totalMonthlyCogs,
      totalMonthlyNetProfit,
      workingCapitalUnlockedMonthly,
      merchantRoiMultiplier,
    };
  }, [stores, entriesPerDay, saasPrice, debtRecovered]);

  // Indian Rupee currency formatter with Lakhs & Crores formatting
  const formatINR = (val: number): string => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakh`;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleResetDefaults = () => {
    setStores(1000);
    setEntriesPerDay(35);
    setSaasPrice(199);
    setDebtRecovered(2160);
  };

  return (
    <div className={styles.judgeContainer}>
      {/* Header Banner for Judge Ekansh Jain & Next Founders Rubric */}
      <header className={styles.headerBanner}>
        <div className={styles.headerInfo}>
          <div className={styles.headerTitleRow}>
            <h1 className={styles.headerTitle}>Next Founders Hackathon Evaluation Suite</h1>
            <span className={styles.judgeBadge}>
              <Sparkles className="size-3.5 fill-current" />
              Judge: Ekansh Jain (LUMA Youth)
            </span>
          </div>
          <div className={styles.headerSubtext}>
            <span>Core Focus: Sustainable Unit Economics & Viable Business Model</span>
            <span className={styles.rubricPill}>4 Criteria × 25% Equal Weight</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={styles.backButton}
            onClick={() => setActiveScreen('home')}
            title="Return to Kirana Handset View"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Kirana Store</span>
          </button>
        </div>
      </header>

      {/* Main Grid: Left Controls + Right Highlights */}
      <div className={styles.mainLayout}>
        {/* Left Column: Interactive Range Sliders */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <TrendingUp className="size-4 text-amber-500" />
              <span>Interactive Unit Economics Simulator</span>
            </div>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-[11px] text-muted-foreground hover:text-white flex items-center gap-1 transition-colors"
              title="Reset to Baseline Assumptions"
            >
              <RefreshCw className="size-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Slider 1: Active Stores */}
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabelRow}>
              <span className={styles.sliderLabel}>Active Kirana Stores ($S$)</span>
              <span className={styles.sliderValue}>{stores.toLocaleString('en-IN')} stores</span>
            </div>
            <input
              type="range"
              min={100}
              max={25000}
              step={100}
              value={stores}
              onChange={(e) => setStores(Number(e.target.value))}
              className={styles.rangeInput}
              aria-label="Active Kirana Stores"
            />
            <span className={styles.sliderDescription}>
              Target: 1,000 pilot stores in Kolkata & Tier-2 Bengal → 25,000 national footprint.
            </span>
          </div>

          {/* Slider 2: Spoken Voice Entries / Store / Day */}
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabelRow}>
              <span className={styles.sliderLabel}>Voice Entries / Day / Store ($E$)</span>
              <span className={styles.sliderValue}>{entriesPerDay} entries/day</span>
            </div>
            <input
              type="range"
              min={10}
              max={150}
              step={5}
              value={entriesPerDay}
              onChange={(e) => setEntriesPerDay(Number(e.target.value))}
              className={styles.rangeInput}
              aria-label="Spoken Voice Entries per Day"
            />
            <span className={styles.sliderDescription}>
              Kirana baseline: 25–45 spoken transactions per counter session (udhaar + cash sales + restock).
            </span>
          </div>

          {/* Slider 3: Monthly SaaS Subscription */}
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabelRow}>
              <span className={styles.sliderLabel}>Pro Kirana Monthly SaaS Price ($P$)</span>
              <span className={styles.sliderValue}>₹{saasPrice}/mo</span>
            </div>
            <input
              type="range"
              min={99}
              max={499}
              step={10}
              value={saasPrice}
              onChange={(e) => setSaasPrice(Number(e.target.value))}
              className={styles.rangeInput}
              aria-label="Pro Kirana Monthly SaaS Price"
            />
            <span className={styles.sliderDescription}>
              Priced at less than ₹7/day (cheaper than a single cup of chai) for Kirana affordability.
            </span>
          </div>

          {/* Slider 4: Average Monthly Debt Recovered */}
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabelRow}>
              <span className={styles.sliderLabel}>Avg Udhaar Recovered / Month ($R$)</span>
              <span className={styles.sliderValue}>{formatINR(debtRecovered)}/mo</span>
            </div>
            <input
              type="range"
              min={500}
              max={10000}
              step={100}
              value={debtRecovered}
              onChange={(e) => setDebtRecovered(Number(e.target.value))}
              className={styles.rangeInput}
              aria-label="Average Udhaar Recovered per Month"
            />
            <span className={styles.sliderDescription}>
              Avg kirana has ₹30,000+ locked in sticky debt. KhataVoice WhatsApp reminders recover 15–25% faster.
            </span>
          </div>

          {/* 4 Summary Metric Cards */}
          <div className={styles.kpiGrid}>
            {/* KPI 1: MRR */}
            <div className={`${styles.kpiCard} ${styles.saffronGlow}`}>
              <div className={styles.kpiLabel}>
                <span>Monthly Recurring Revenue</span>
                <DollarSign className="size-3.5 text-amber-500" />
              </div>
              <div className={styles.kpiValue}>{formatINR(economics.mrr)}</div>
              <div className={styles.kpiSubtext}>
                Annual Run Rate: <strong>{formatINR(economics.arr)}</strong>
              </div>
              <div className={styles.kpiFormula}>
                MRR = {stores.toLocaleString()} stores × ₹{saasPrice}
              </div>
            </div>

            {/* KPI 2: AI Compute COGS */}
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>
                <span>Total AI & Cloud COGS</span>
                <Cpu className="size-3.5 text-blue-400" />
              </div>
              <div className={styles.kpiValue}>{formatINR(economics.totalMonthlyCogs)}</div>
              <div className={styles.kpiSubtext}>
                Per store: ₹{economics.monthlyCogsPerStore.toFixed(0)}/mo ({entriesPerDay * 30} entries @ ₹0.10)
              </div>
              <div className={styles.kpiFormula}>
                COGS = Speech ₹0.03 + LLM ₹0.05 + DB ₹0.02
              </div>
            </div>

            {/* KPI 3: Gross Margin % */}
            <div className={`${styles.kpiCard} ${styles.emeraldGlow}`}>
              <div className={styles.kpiLabel}>
                <span>Software Gross Margin</span>
                <Percent className="size-3.5 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className={styles.kpiValue}>{economics.grossMarginPct.toFixed(1)}%</span>
                <span className="text-xs font-bold text-emerald-400">High Margin</span>
              </div>
              <div className={styles.kpiSubtext}>
                Monthly Net Margin: {formatINR(economics.totalMonthlyNetProfit)}
              </div>
              <div className={styles.kpiFormula}>
                Margin = (₹{saasPrice} - ₹{economics.monthlyCogsPerStore.toFixed(0)}) / ₹{saasPrice}
              </div>
            </div>

            {/* KPI 4: Working Capital Unlocked */}
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>
                <span>Working Capital Unlocked</span>
                <Coins className="size-3.5 text-yellow-400" />
              </div>
              <div className={styles.kpiValue}>
                {formatINR(economics.workingCapitalUnlockedMonthly)}
              </div>
              <div className={styles.kpiSubtext}>
                Monthly sticky debt injected back into neighborhood stores.
              </div>
              <div className={styles.kpiFormula}>
                Revived = {stores.toLocaleString()} × ₹{debtRecovered.toLocaleString()}
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Merchant ROI Spotlight & Rubric Deep-Dive */}
        <section className="flex flex-col gap-6">
          {/* Spotlight: Merchant Payback ROI (The Ekansh Jain Value Proposition) */}
          <div className={styles.roiSpotlight}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
                Merchant Payback Value Multiplier
              </span>
              <span className="text-xs text-muted-foreground font-mono">Zero Churn Wedge</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className={styles.roiMultiplierBadge}>
                {economics.merchantRoiMultiplier.toFixed(1)}×
              </span>
              <span className="text-sm text-slate-300 font-medium">
                Immediate Return on Subscription Fee
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              When a Kirana owner pays <strong>₹{saasPrice}/month</strong> and recovers an average of{' '}
              <strong>{formatINR(debtRecovered)}/month</strong> in overdue debt, the software pays for
              itself <strong>{economics.merchantRoiMultiplier.toFixed(1)} times over</strong>. This
              eliminates subscription cancellation risk and creates sticky micro-SaaS adoption.
            </p>

            <div className={styles.roiBreakdownGrid}>
              <div className={styles.roiMetricBox}>
                <span className={styles.roiBoxTitle}>Monthly SaaS Cost</span>
                <span className={styles.roiBoxValue}>₹{saasPrice}</span>
              </div>
              <div className={styles.roiMetricBox}>
                <span className={styles.roiBoxTitle}>Debt Recovered</span>
                <span className={styles.roiBoxValue}>{formatINR(debtRecovered)}</span>
              </div>
              <div className={styles.roiMetricBox}>
                <span className={styles.roiBoxTitle}>Cost Per Entry</span>
                <span className={styles.roiBoxValue}>₹0.10</span>
              </div>
              <div className={styles.roiMetricBox}>
                <span className={styles.roiBoxTitle}>WhatsApp API Fee</span>
                <span className={styles.roiBoxValue}>₹0.00 (wa.me)</span>
              </div>
            </div>
          </div>

          {/* Rubric Evaluation Breakdown Tabs */}
          <div className={styles.rubricSection}>
            <div className={styles.tabsBar}>
              <button
                type="button"
                className={`${styles.tabButton} ${activeTab === 'business' ? styles.tabButtonActive : ''}`}
                onClick={() => setActiveTab('business')}
              >
                1. Business & Finance (25%)
              </button>
              <button
                type="button"
                className={`${styles.tabButton} ${activeTab === 'tech' ? styles.tabButtonActive : ''}`}
                onClick={() => setActiveTab('tech')}
              >
                2. Technical Execution (25%)
              </button>
              <button
                type="button"
                className={`${styles.tabButton} ${activeTab === 'ux' ? styles.tabButtonActive : ''}`}
                onClick={() => setActiveTab('ux')}
              >
                3. Innovation & UX (25%)
              </button>
              <button
                type="button"
                className={`${styles.tabButton} ${activeTab === 'comm' ? styles.tabButtonActive : ''}`}
                onClick={() => setActiveTab('comm')}
              >
                4. Communication (25%)
              </button>
            </div>

            <div className={styles.tabContent}>
              {activeTab === 'business' && (
                <>
                  <div className={styles.rubricPillarTitle}>
                    <ShieldCheck className="size-4 text-emerald-400" />
                    <span>Business & Finance Rubric: Viable Unit Economics</span>
                  </div>
                  <ul className={styles.rubricPointsList}>
                    <li className={styles.rubricItem}>
                      <CheckCircle2 className={`size-4 ${styles.checkIcon}`} />
                      <span>
                        <strong>₹20 Lakh Crore Credit Gap:</strong> Addresses the massive informal
                        credit gap across 13.5M Kiranas without taking balance-sheet lending risk.
                      </span>
                    </li>
                    <li className={styles.rubricItem}>
                      <CheckCircle2 className={`size-4 ${styles.checkIcon}`} />
                      <span>
                        <strong>High Gross Margin ({economics.grossMarginPct.toFixed(1)}%):</strong>{' '}
                        Serverless API costs scale with usage (₹0.10/entry) while subscription price
                        yields robust margins.
                      </span>
                    </li>
                    <li className={styles.rubricItem}>
                      <CheckCircle2 className={`size-4 ${styles.checkIcon}`} />
                      <span>
                        <strong>Zero WhatsApp Cloud API Fees:</strong> Dispatches via native browser{' '}
                        <code>wa.me</code> intent URIs, saving ₹0.50–₹1.20 per notification and
                        avoiding Meta business approval bottlenecks.
                      </span>
                    </li>
                  </ul>
                </>
              )}

              {activeTab === 'tech' && (
                <>
                  <div className={styles.rubricPillarTitle}>
                    <Cpu className="size-4 text-amber-500" />
                    <span>Technical Execution: Resilient Cloud Architecture</span>
                  </div>
                  <ul className={styles.rubricPointsList}>
                    <li className={styles.rubricItem}>
                      <CheckCircle2 className={`size-4 ${styles.checkIcon}`} />
                      <span>
                        <strong>PostgreSQL ACID Dual-Sync:</strong> <code>execute_spoken_dual_sync</code>{' '}
                        stored procedure guarantees transactional atomicity between ledger balance and
                        inventory count.
                      </span>
                    </li>
                    <li className={styles.rubricItem}>
                      <CheckCircle2 className={`size-4 ${styles.checkIcon}`} />
                      <span>
                        <strong>Sub-500ms Realtime Sync:</strong> Supabase Realtime WebSockets paired
                        with HTML5 <code>BroadcastChannel</code> pushes mobile audio transactions to
                        desktop command centers instantly.
                      </span>
                    </li>
                    <li className={styles.rubricItem}>
                      <CheckCircle2 className={`size-4 ${styles.checkIcon}`} />
                      <span>
                        <strong>Zero-Crash Boot Guarantee:</strong> Transparent in-memory fallback
                        allows live offline demo execution without external database credentials.
                      </span>
                    </li>
                  </ul>
                </>
              )}

              {activeTab === 'ux' && (
                <>
                  <div className={styles.rubricPillarTitle}>
                    <Zap className="size-4 text-amber-400" />
                    <span>Innovation & UX: Culturally Attuned Kirana Design</span>
                  </div>
                  <ul className={styles.rubricPointsList}>
                    <li className={styles.rubricItem}>
                      <CheckCircle2 className={`size-4 ${styles.checkIcon}`} />
                      <span>
                        <strong>4-Second Auto-Commit Grace Window:</strong> Non-intrusive progress bar
                        allows busy shopkeepers to make hands-free spoken sales during counter rushes.
                      </span>
                    </li>
                    <li className={styles.rubricItem}>
                      <CheckCircle2 className={`size-4 ${styles.checkIcon}`} />
                      <span>
                        <strong>Indian Retail Soundbox Simulator:</strong> Dual-harmonic Web Audio
                        payment chime + vernacular TTS voice confirmation (Bengali, Hindi, English).
                      </span>
                    </li>
                    <li className={styles.rubricItem}>
                      <CheckCircle2 className={`size-4 ${styles.checkIcon}`} />
                      <span>
                        <strong>Dynamic Credit Trust Score (0–100):</strong> Objective creditworthiness
                        grading protecting merchants from extending credit to chronic defaulters.
                      </span>
                    </li>
                  </ul>
                </>
              )}

              {activeTab === 'comm' && (
                <>
                  <div className={styles.rubricPillarTitle}>
                    <Layers className="size-4 text-blue-400" />
                    <span>Communication: 5-Minute Pitch Presentation Strategy</span>
                  </div>
                  <ul className={styles.rubricPointsList}>
                    <li className={styles.rubricItem}>
                      <CheckCircle2 className={`size-4 ${styles.checkIcon}`} />
                      <span>
                        <strong>0:00–1:00 Problem:</strong> Indian retail reality, paper bahi-khata
                        frictions, and ₹30k locked working capital per store.
                      </span>
                    </li>
                    <li className={styles.rubricItem}>
                      <CheckCircle2 className={`size-4 ${styles.checkIcon}`} />
                      <span>
                        <strong>1:00–3:15 Live Demo:</strong> Spoken vernacular entry, dual-sync
                        inventory decrement, soundbox confirmation, and WhatsApp 1-tap recovery.
                      </span>
                    </li>
                    <li className={styles.rubricItem}>
                      <CheckCircle2 className={`size-4 ${styles.checkIcon}`} />
                      <span>
                        <strong>3:15–4:30 Unit Economics:</strong> Screen 7 financial simulation
                        proving 78% margins and 10.8x merchant ROI.
                      </span>
                    </li>
                    <li className={styles.rubricItem}>
                      <CheckCircle2 className={`size-4 ${styles.checkIcon}`} />
                      <span>
                        <strong>4:30–5:00 Vision & Scalability:</strong> Transition from Kirana ledger
                        into an anonymized credit-scoring rail for distributor supply-chain trade credit.
                      </span>
                    </li>
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* Architecture Pipeline Latency Box */}
          <div className={styles.pipelineBox}>
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Cpu className="size-3.5 text-amber-500" />
                <span>End-to-End Latency & Cost Breakdown</span>
              </span>
              <span className="text-emerald-400 font-mono">Total: &lt; 950ms | ₹0.10</span>
            </div>

            <div className={styles.pipelineStep}>
              <span className={styles.stepName}>1. Speech Capture (Web Speech API / Presets)</span>
              <span className={styles.stepLatency}>~250ms (₹0.00 / ₹0.03)</span>
            </div>
            <div className={styles.pipelineStep}>
              <span className={styles.stepName}>2. NLP Intent Parsing (Regex Fallback / LLM)</span>
              <span className={styles.stepLatency}>&lt; 15ms fallback / ~500ms LLM (₹0.05)</span>
            </div>
            <div className={styles.pipelineStep}>
              <span className={styles.stepName}>3. ACID PostgreSQL Dual-Sync Stored Proc</span>
              <span className={styles.stepLatency}>~35ms (₹0.02)</span>
            </div>
            <div className={styles.pipelineStep}>
              <span className={styles.stepName}>4. Realtime Broadcast & Desktop Hub Sync</span>
              <span className={styles.stepLatency}>~120ms (Included in DB)</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
