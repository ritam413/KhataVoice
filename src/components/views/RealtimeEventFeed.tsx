'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { LedgerEntry } from '@/types/domain';
import { useAppStore } from '@/lib/store/useAppStore';
import { supabase, isSupabaseConfigured } from '@/lib/db/supabase';
import { localStore } from '@/lib/db/local-fallback';
import { Activity, Zap, Sparkles, Clock, Volume2 } from 'lucide-react';
import styles from '@/styles/command-center.module.css';

interface RealtimeEventFeedProps {
  initialEntries?: LedgerEntry[];
  maxEntries?: number;
}

export function RealtimeEventFeed({
  initialEntries = [],
  maxEntries = 20,
}: RealtimeEventFeedProps) {
  const storeLedger = useAppStore((s) => s.ledger);
  const addTransaction = useAppStore((s) => s.addTransaction);

  // Entries list: fallback to store or initial props
  const entries = storeLedger.length > 0 ? storeLedger : initialEntries;

  // Track IDs of newly arrived entries to apply saffron flash animation
  const [newArrivalIds, setNewArrivalIds] = useState<Set<string>>(new Set());
  const [connectionMode, setConnectionMode] = useState<'supabase' | 'local'>('local');

  // Helper to trigger saffron glow for a newly arrived entry ID
  const markNewArrival = useCallback((id: string) => {
    setNewArrivalIds((prev) => new Set(prev).add(id));
    // Clear animation after 3.5 seconds
    setTimeout(() => {
      setNewArrivalIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 3500);
  }, []);

  // Set up Multi-Mode Realtime Subscriptions
  useEffect(() => {
    let supabaseChannel: RealtimeChannel | null = null;
    let broadcastChannel: BroadcastChannel | null = null;

    // 1. Supabase Realtime Subscription (when configured)
    if (isSupabaseConfigured && supabase) {
      setConnectionMode('supabase');
      try {
        supabaseChannel = supabase
          .channel('schema-ledger-changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'ledger_entries',
            },
            (payload) => {
              const newRow = payload.new as any;
              if (newRow && newRow.id) {
                const entry: LedgerEntry = {
                  id: newRow.id,
                  merchant_id: newRow.merchant_id,
                  customer_id: newRow.customer_id,
                  customer_name: newRow.customer_name,
                  transaction_type: newRow.transaction_type,
                  amount: Number(newRow.amount),
                  items_summary: newRow.items_summary || [],
                  raw_transcript: newRow.raw_transcript,
                  language: newRow.language || 'en',
                  created_at: newRow.created_at || new Date().toISOString(),
                };
                addTransaction(entry);
                markNewArrival(entry.id);
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('[RealtimeEventFeed] Supabase realtime connection error:', err);
      }
    } else {
      setConnectionMode('local');
    }

    // 2. HTML5 BroadcastChannel for Multi-Window / Multi-Tab Synchronization
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        broadcastChannel = new BroadcastChannel('khatavoice-realtime');
        broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type === 'NEW_TRANSACTION' && event.data.entry) {
            const entry = event.data.entry as LedgerEntry;
            addTransaction(entry, event.data.customer, event.data.inventory);
            markNewArrival(entry.id);
          }
        };
      } catch (e) {
        console.warn('[RealtimeEventFeed] BroadcastChannel unsupported:', e);
      }
    }

    // 3. In-memory local fallback store subscriber (same-process)
    const unsubscribeLocal = localStore.subscribe((event) => {
      if (event.type === 'DUAL_SYNC_COMPLETED' && event.payload) {
        const payload = event.payload as any;
        if (payload.ledger_entry_id) {
          markNewArrival(payload.ledger_entry_id);
        }
      }
    });

    return () => {
      if (supabaseChannel && supabase) {
        supabase.removeChannel(supabaseChannel);
      }
      if (broadcastChannel) {
        broadcastChannel.close();
      }
      unsubscribeLocal();
    };
  }, [addTransaction, markNewArrival]);

  // Format relative timestamp
  const formatTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      if (diffSecs < 10) return 'Just now';
      if (diffSecs < 60) return `${diffSecs}s ago`;
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  // Helper for badge styling based on transaction type
  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'udhaar_sale':
        return `${styles.typeBadge} ${styles.typeBadgeUdhaar}`;
      case 'cash_sale':
        return `${styles.typeBadge} ${styles.typeBadgeCash}`;
      case 'restock':
        return `${styles.typeBadge} ${styles.typeBadgeRestock}`;
      case 'payment_received':
        return `${styles.typeBadge} ${styles.typeBadgePayment}`;
      default:
        return styles.typeBadge;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'udhaar_sale':
        return 'Udhaar Sale';
      case 'cash_sale':
        return 'Cash Sale';
      case 'restock':
        return 'Restock';
      case 'payment_received':
        return 'Payment Received';
      default:
        return type.replace(/_/g, ' ');
    }
  };

  // 1-Click Spoken Entry Simulator for Live Hackathon Demos
  const handleSimulateEntry = () => {
    const randomPresets = [
      {
        transcript: 'রমেশ বাবু ২ কেজি সরষের তেল বাকি লিখুন',
        customer: 'Ramesh Babu',
        amount: 350,
        type: 'udhaar_sale' as const,
        lang: 'bn' as const,
        item: 'Mustard Oil (1L)',
        qty: 2,
      },
      {
        transcript: 'रोहित गुप्ता ने ₹500 उधार चुकाया',
        customer: 'Rohit Gupta',
        amount: 500,
        type: 'payment_received' as const,
        lang: 'hi' as const,
        item: 'Cash Repayment',
        qty: 1,
      },
      {
        transcript: 'Sunita Devi bought 1 Fortune Atta cash ₹220',
        customer: 'Sunita Devi',
        amount: 220,
        type: 'cash_sale' as const,
        lang: 'en' as const,
        item: 'Fortune Chakki Atta (5kg)',
        qty: 1,
      },
    ];

    const pick = randomPresets[Math.floor(Math.random() * randomPresets.length)];
    const newEntry: LedgerEntry = {
      id: `sim_${Date.now()}`,
      merchant_id: 'm_kolkata_kirana_001',
      customer_name: pick.customer,
      transaction_type: pick.type,
      amount: pick.amount,
      items_summary: [
        {
          name: pick.item,
          quantity: pick.qty,
          unit: 'unit',
          price: pick.amount,
        },
      ],
      raw_transcript: pick.transcript,
      language: pick.lang,
      created_at: new Date().toISOString(),
    };

    addTransaction(newEntry);
    markNewArrival(newEntry.id);

    // Broadcast across other open browser tabs
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('khatavoice-realtime');
        bc.postMessage({
          type: 'NEW_TRANSACTION',
          entry: newEntry,
        });
        bc.close();
      } catch (e) {
        // broadcast silent fallback
      }
    }
  };

  return (
    <div className={styles.feedContainer}>
      <div className={styles.feedHeader}>
        <div className={styles.feedTitle}>
          <Activity className="size-4 text-primary" />
          <span>Live Realtime Stream</span>
        </div>
        <button
          onClick={handleSimulateEntry}
          className={styles.simulateBtn}
          title="Simulate a spoken voice transaction arriving via Supabase Realtime"
          type="button"
        >
          <Zap className="size-3 text-amber-400 fill-amber-400" />
          <span>Simulate Entry</span>
        </button>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
        <span className="flex items-center gap-1.5 font-medium">
          <span
            className={`size-2 rounded-full ${
              connectionMode === 'supabase'
                ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]'
                : 'bg-blue-400'
            }`}
          />
          {connectionMode === 'supabase'
            ? 'Supabase Realtime Channel'
            : 'Local Multi-Window Broadcast'}
        </span>
        <span>{entries.length} audited entries</span>
      </div>

      <div className={styles.feedList}>
        {entries.length === 0 ? (
          <div className={styles.emptyFeed}>
            <Clock className="size-8 mx-auto mb-2 opacity-40 text-muted-foreground" />
            <p>Waiting for voice entries...</p>
          </div>
        ) : (
          entries.slice(0, maxEntries).map((entry) => {
            const isNew = newArrivalIds.has(entry.id);
            return (
              <div
                key={entry.id}
                className={`${styles.feedItem} ${isNew ? styles.feedItemNew : ''}`}
              >
                <div className={styles.feedItemTop}>
                  <span className={getTypeBadgeClass(entry.transaction_type)}>
                    {getTypeLabel(entry.transaction_type)}
                  </span>
                  <span className={styles.feedAmount}>
                    ₹{entry.amount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={styles.feedCustomer}>
                    {entry.customer_name || 'Walk-in Customer'}
                  </span>
                  <span className={styles.feedTimestamp}>
                    {formatTime(entry.created_at)}
                  </span>
                </div>

                {entry.raw_transcript && (
                  <div className={styles.feedTranscript}>
                    &ldquo;{entry.raw_transcript}&rdquo;
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
