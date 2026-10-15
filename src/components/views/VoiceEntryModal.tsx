'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Mic,
  MicOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Volume2,
  Package,
  User,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAppStore, useShallow } from '@/lib/store/useAppStore';
import { WaveformVisualizer } from '@/components/audio/WaveformVisualizer';
import { PresetSelector } from '@/components/audio/PresetSelector';
import { TrustBadge } from '@/components/ui/trust-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { triggerSoundboxSuccess } from '@/lib/audio/soundbox';
import { createWebSpeechRecognizer, stopMediaStream } from '@/lib/speech/web-speech';
import { AudioPreset } from '@/types/speech';
import { ParsedTransaction } from '@/types/nlp';
import { DualSyncRequest, DualSyncApiResponse } from '@/types/api';
import { Customer, InventoryItem, LedgerEntry } from '@/types/domain';
import styles from './voice-modal.module.css';

interface VoiceEntryModalProps {
  merchantId?: string;
}

export function VoiceEntryModal({ merchantId = 'm_kolkata_kirana_001' }: VoiceEntryModalProps) {
  const {
    isVoiceModalOpen,
    language,
    voiceState,
    transcript,
    interimTranscript,
    parsedTransaction,
    countdownSeconds,
    isSyncing,
    customers,
    setVoiceModalOpen,
    setVoiceState,
    setTranscript,
    setParsedTransaction,
    setCountdownSeconds,
    setIsSyncing,
    resetVoiceState,
    addTransaction,
  } = useAppStore(
    useShallow((s) => ({
      isVoiceModalOpen: s.isVoiceModalOpen,
      language: s.language,
      voiceState: s.voiceState,
      transcript: s.transcript,
      interimTranscript: s.interimTranscript,
      parsedTransaction: s.parsedTransaction,
      countdownSeconds: s.countdownSeconds,
      isSyncing: s.isSyncing,
      customers: s.customers,
      setVoiceModalOpen: s.setVoiceModalOpen,
      setVoiceState: s.setVoiceState,
      setTranscript: s.setTranscript,
      setParsedTransaction: s.setParsedTransaction,
      setCountdownSeconds: s.setCountdownSeconds,
      setIsSyncing: s.setIsSyncing,
      resetVoiceState: s.resetVoiceState,
      addTransaction: s.addTransaction,
    }))
  );

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [committedData, setCommittedData] = useState<{
    customerName: string;
    amount: number;
    transactionType: string;
    trustScore?: number;
  } | null>(null);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressFillRef = useRef<HTMLDivElement | null>(null);
  const webSpeechControllerRef = useRef<ReturnType<typeof createWebSpeechRecognizer> | null>(null);

  // Helper to clear countdown timer
  const stopCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  // Cleanup microphone track and speech recognition
  const cleanupHardware = useCallback(() => {
    stopCountdown();
    if (webSpeechControllerRef.current) {
      webSpeechControllerRef.current.abort();
      webSpeechControllerRef.current = null;
    }
    if (stream) {
      stopMediaStream(stream);
      setStream(null);
    }
  }, [stopCountdown, stream]);

  // Close modal with full reset
  const handleClose = useCallback(() => {
    cleanupHardware();
    resetVoiceState();
    setErrorMessage(null);
    setCommittedData(null);
    setVoiceModalOpen(false);
  }, [cleanupHardware, resetVoiceState, setVoiceModalOpen]);

  // Execute ACID Dual-Sync Commit
  const handleCommit = useCallback(async () => {
    stopCountdown();
    if (!parsedTransaction || isSyncing) return;

    setIsSyncing(true);
    setVoiceState('committing');

    const amount = parsedTransaction.amount;
    const customerName = parsedTransaction.customer_name || 'Walk-in Customer';
    const idempotencyKey = `${merchantId}:${customerName.trim()}:${amount}:${parsedTransaction.transaction_type}:${Date.now()}`;

    const payload: DualSyncRequest = {
      merchant_id: merchantId,
      customer_name: customerName,
      customer_phone: parsedTransaction.customer_id
        ? customers.find((c) => c.id === parsedTransaction.customer_id)?.phone
        : undefined,
      transaction_type: parsedTransaction.transaction_type,
      amount,
      items: parsedTransaction.items.map((i) => ({
        item_id: i.item_id,
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        price: i.estimated_price || Math.round(amount / (parsedTransaction.items.length || 1)),
      })),
      raw_transcript: parsedTransaction.raw_transcript,
      language,
      idempotency_key: idempotencyKey,
    };

    try {
      const response = await fetch('/api/dual-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result: DualSyncApiResponse = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || 'Dual-sync failed to commit');
      }

      const syncData = result.data;

      // Optimistically update store
      const itemsSummary = payload.items.map((i) => ({
        item_id: i.item_id,
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        price: i.price ?? 0,
      }));

      const newEntry: LedgerEntry = {
        id: syncData.ledger_entry_id,
        merchant_id: merchantId,
        customer_id: syncData.customer?.id,
        customer_name: customerName,
        transaction_type: parsedTransaction.transaction_type,
        amount,
        items_summary: itemsSummary,
        raw_transcript: parsedTransaction.raw_transcript,
        language,
        created_at: new Date().toISOString(),
      };

      addTransaction(newEntry, syncData.customer || undefined, syncData.updated_inventory);

      // Trigger Retail Soundbox Audio Feedback
      setCommittedData({
        customerName,
        amount,
        transactionType: parsedTransaction.transaction_type,
        trustScore: syncData.customer?.trust_score,
      });
      setVoiceState('confirmed');

      triggerSoundboxSuccess(customerName, amount, language).catch(() => {});

      toast.success(
        parsedTransaction.transaction_type === 'udhaar_sale'
          ? `₹${amount} recorded in udhaar for ${customerName}`
          : `₹${amount} payment received from ${customerName}`
      );
    } catch (err: unknown) {
      console.error('[VoiceEntryModal] Commit failed:', err);
      const msg = err instanceof Error ? err.message : 'Unknown commit error';
      setErrorMessage(msg);
      setVoiceState('error');
      toast.error(`Transaction failed: ${msg}`);
    } finally {
      setIsSyncing(false);
    }
  }, [
    stopCountdown,
    parsedTransaction,
    isSyncing,
    merchantId,
    customers,
    language,
    setIsSyncing,
    setVoiceState,
    addTransaction,
  ]);

  // Start 4-second linear grace countdown
  const startGraceCountdown = useCallback(
    (parsed: ParsedTransaction) => {
      stopCountdown();
      setParsedTransaction(parsed);
      setVoiceState('countdown');
      setCountdownSeconds(4);

      const totalMs = 4000;
      const startTime = Date.now();

      countdownTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, totalMs - elapsed);
        const remainingSec = Math.ceil(remaining / 1000);

        setCountdownSeconds(remainingSec);

        if (progressFillRef.current) {
          const pct = (remaining / totalMs) * 100;
          progressFillRef.current.style.width = `${pct}%`;
        }

        if (remaining <= 0) {
          stopCountdown();
          handleCommit();
        }
      }, 50);
    },
    [stopCountdown, setParsedTransaction, setVoiceState, setCountdownSeconds, handleCommit]
  );

  // Send transcribed text to /api/parse-transaction
  const parseSpokenText = useCallback(
    async (rawText: string) => {
      setVoiceState('transcribing');
      setErrorMessage(null);

      try {
        const response = await fetch('/api/parse-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: rawText,
            language,
            merchantId,
          }),
        });

        const resData = await response.json();

        if (!response.ok || !resData.success || !resData.data) {
          throw new Error(resData.error?.message || 'NLP entity parsing failed');
        }

        const parsed: ParsedTransaction = resData.data;
        startGraceCountdown(parsed);
      } catch (err: unknown) {
        console.error('[VoiceEntryModal] Parse error:', err);
        const msg = err instanceof Error ? err.message : 'Failed to parse text';
        setErrorMessage(msg);
        setVoiceState('error');
      }
    },
    [language, merchantId, setVoiceState, startGraceCountdown]
  );

  // 1-Click Audio Preset Handler
  const handleSelectPreset = useCallback(
    async (preset: AudioPreset) => {
      cleanupHardware();
      setTranscript(preset.transcript);
      setVoiceState('listening');

      // Emulate brief acoustic recognition before parsing
      setTimeout(() => {
        parseSpokenText(preset.transcript);
      }, 700);
    },
    [cleanupHardware, setTranscript, setVoiceState, parseSpokenText]
  );

  // Native Microphone Toggle
  const toggleListening = useCallback(async () => {
    if (voiceState === 'listening') {
      cleanupHardware();
      if (transcript.trim()) {
        parseSpokenText(transcript);
      } else {
        setVoiceState('idle');
      }
      return;
    }

    try {
      setVoiceState('listening');
      setErrorMessage(null);

      // Request microphone stream for visualizer
      let audioStream: MediaStream | null = null;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setStream(audioStream);
        } catch {
          // Fall back gracefully to synthetic sine wave visualizer
        }
      }

      // Initialize Web Speech API Recognizer
      const recognizer = createWebSpeechRecognizer({
        language,
        continuous: false,
        interimResults: true,
        listeners: {
          onInterim: (partialTranscript: string) => {
            setTranscript(partialTranscript, true);
          },
          onFinal: (finalTranscript: string) => {
            setTranscript(finalTranscript, false);
          },
          onEnd: () => {
            const currentStoreTranscript = useAppStore.getState().transcript;
            if (currentStoreTranscript && currentStoreTranscript.trim()) {
              parseSpokenText(currentStoreTranscript);
            } else {
              setVoiceState('idle');
            }
          },
          onError: (error) => {
            console.warn('[WebSpeech] Recognizer error:', error);
            // Non-fatal: user can select presets or retry
          },
        },
      });

      webSpeechControllerRef.current = recognizer;
      recognizer.start();
    } catch (err: unknown) {
      console.error('[VoiceEntryModal] Mic access error:', err);
      setErrorMessage('Could not access microphone. Try selecting a preset below.');
      setVoiceState('idle');
    }
  }, [voiceState, cleanupHardware, transcript, parseSpokenText, setVoiceState, language, setTranscript]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      cleanupHardware();
    };
  }, [cleanupHardware]);

  // Lookup matched customer trust score
  const matchedCustomer = parsedTransaction?.customer_name
    ? customers.find(
        (c) =>
          c.name.toLowerCase().includes(parsedTransaction.customer_name!.toLowerCase()) ||
          parsedTransaction.customer_name!.toLowerCase().includes(c.name.toLowerCase())
      )
    : null;

  const trustScore = matchedCustomer ? matchedCustomer.trust_score : 85;

  if (!isVoiceModalOpen) return null;

  return (
    <div
      className={`${styles.modalOverlay} ${isVoiceModalOpen ? styles.modalOverlayOpen : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Voice Entry Modal"
    >
      <div className={styles.modalSheet}>
        {/* Top Drag Handle */}
        <div className={styles.sheetHandle} />

        {/* Universal Audio Waveform Canvas */}
        <div className={styles.waveformBox}>
          <WaveformVisualizer
            isRecording={voiceState === 'listening'}
            stream={stream}
            demo={voiceState === 'listening' && !stream}
            height={64}
            barCount={28}
          />
          <div className={styles.transcriptOverlay}>
            {voiceState === 'listening' && '🎙️ Listening... Speak naturally'}
            {voiceState === 'transcribing' && '⚡ Processing speech...'}
            {voiceState === 'countdown' && (transcript ? `“${transcript}”` : 'Transaction Ready')}
            {voiceState === 'committing' && '💾 Atomically syncing ledger & stock...'}
            {voiceState === 'confirmed' && '✓ Retail Soundbox Confirmed'}
            {voiceState === 'idle' && 'Tap Mic or Select Preset to Begin'}
            {voiceState === 'error' && 'Recognition Issue'}
          </div>
        </div>

        {/* State: CONFIRMED */}
        {voiceState === 'confirmed' && committedData && (
          <div className={styles.successBanner}>
            <div className={styles.successIconBox}>✓</div>
            <div className="text-center">
              <h3 className="text-base font-extrabold text-foreground">
                {committedData.customerName}
              </h3>
              <p className="text-3xl font-black text-emerald-500 my-1 tabular-nums">
                ₹{committedData.amount}
              </p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 mt-1">
                <Volume2 className="size-3.5 text-emerald-500 animate-pulse" />
                <span>Retail Soundbox audio confirmation announced</span>
              </p>
            </div>
            <Button
              variant="default"
              size="default"
              onClick={handleClose}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              Done / Return Home
            </Button>
          </div>
        )}

        {/* State: PARSED / COUNTDOWN */}
        {(voiceState === 'countdown' || voiceState === 'committing') && parsedTransaction && (
          <div className="flex flex-col gap-3">
            {/* Bharat Soundbox Card */}
            <div className={styles.soundboxCard}>
              <div className={styles.speakerGrille}>
                <span className="text-2xl" role="img" aria-label="Speaker">
                  📢
                </span>
                <div className={styles.speakerWaveRing} />
              </div>

              <div className="text-center w-full">
                <div className={styles.customerTag}>
                  <User className="size-3 text-muted-foreground" />
                  <span className="text-foreground">
                    {parsedTransaction.customer_name || 'Walk-in Customer'}
                  </span>
                  <TrustBadge score={trustScore} size="sm" language="en" />
                </div>

                <div className={styles.amountDisplay}>
                  ₹{parsedTransaction.amount}
                </div>

                <div className={styles.itemBreakdown}>
                  {parsedTransaction.items.length > 0
                    ? parsedTransaction.items.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(' • ')
                    : 'Unspecified Items'}{' '}
                  •{' '}
                  <Badge
                    variant={parsedTransaction.transaction_type === 'udhaar_sale' ? 'destructive' : 'emerald'}
                    className="text-[10px] py-0 font-bold ml-1"
                  >
                    {parsedTransaction.transaction_type === 'udhaar_sale' ? 'Udhaar (বাকি)' : 'Payment / Cash'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* 4-Second Linear Grace Countdown Progress Bar */}
            <div className={styles.countdownBox}>
              <div className={styles.countdownHeader}>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" />
                  <span>Auto-Commits in</span>
                </span>
                <span className={styles.countdownTimerBadge}>
                  {countdownSeconds}s
                </span>
              </div>
              <div className={styles.progressTrack}>
                <div ref={progressFillRef} className={styles.progressFill} style={{ width: '100%' }} />
              </div>
            </div>

            {/* Action Buttons with Mutex Lock Protection */}
            <div className={styles.modalActions}>
              <button
                type="button"
                disabled={isSyncing}
                onClick={handleClose}
                className={`${styles.btnCancel} ${isSyncing ? styles.btnDisabled : ''}`}
              >
                ✕ Cancel / Edit
              </button>
              <button
                type="button"
                disabled={isSyncing}
                onClick={handleCommit}
                className={`${styles.btnConfirm} ${isSyncing ? styles.btnDisabled : ''}`}
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <span>✓ Confirm Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* State: IDLE / LISTENING / ERROR */}
        {voiceState !== 'countdown' && voiceState !== 'committing' && voiceState !== 'confirmed' && (
          <div className="flex flex-col gap-3 py-1">
            {/* Mic Center Trigger */}
            <div className="flex flex-col items-center justify-center p-3 text-center">
              <button
                type="button"
                onClick={toggleListening}
                className={`size-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
                  voiceState === 'listening'
                    ? 'bg-destructive text-white shadow-destructive/30 animate-pulse ring-4 ring-destructive/20'
                    : 'bg-gradient-to-tr from-primary to-amber-500 text-white shadow-primary/30 hover:scale-105 active:scale-95'
                }`}
                aria-label={voiceState === 'listening' ? 'Stop Listening' : 'Start Listening'}
              >
                {voiceState === 'listening' ? <MicOff className="size-9" /> : <Mic className="size-9" />}
              </button>

              <p className="text-xs font-bold text-foreground mt-2.5">
                {voiceState === 'listening' ? 'Listening... Tap to Stop' : 'Tap Mic & Speak'}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Speak vernacular Hindi or Bengali naturally
              </p>

              {errorMessage && (
                <div className="mt-2 text-xs text-destructive flex items-center gap-1.5 bg-destructive/10 px-3 py-1.5 rounded-lg border border-destructive/20">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Presets Tray */}
            <div className="pt-2 border-t border-border/60">
              <PresetSelector language={language} onSelectPreset={handleSelectPreset} />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="w-full text-xs text-muted-foreground hover:text-foreground mt-1"
            >
              Cancel & Return Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
