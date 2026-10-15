'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  ArrowLeft,
  MessageCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  TrendingDown,
  UserCheck,
} from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { Customer } from '@/types/domain';
import { TrustBadge } from '@/components/ui/trust-badge';
import { toast } from 'sonner';
import styles from './views.module.css';

type CustomerFilter = 'all' | 'overdue' | 'gold' | 'silver' | 'bronze';

export function LedgerScreen() {
  const {
    customers,
    language,
    setActiveScreen,
    setSelectedCustomerForReminder,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<CustomerFilter>('all');

  // Total Outstanding Debt Calculation (YAGNI stdlib reduce)
  const totalOutstanding = useMemo(() => {
    return customers.reduce((sum, c) => sum + Math.max(0, c.current_balance), 0);
  }, [customers]);

  const overdueCount = useMemo(() => {
    return customers.filter((c) => c.current_balance > 0 && c.trust_badge === 'BRONZE').length;
  }, [customers]);

  // Client-Side Instant Filtering
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(q) ||
        c.phone.replace(/[^0-9]/g, '').includes(q);
      if (!matchesSearch) return false;

      if (activeFilter === 'all') return true;
      if (activeFilter === 'overdue') return c.current_balance > 0 && c.trust_score < 70;
      if (activeFilter === 'gold') return c.trust_badge === 'GOLD';
      if (activeFilter === 'silver') return c.trust_badge === 'SILVER';
      if (activeFilter === 'bronze') return c.trust_badge === 'BRONZE';
      return true;
    });
  }, [customers, searchQuery, activeFilter]);

  const handleSendReminder = (customer: Customer) => {
    setSelectedCustomerForReminder(customer);
  };

  return (
    <div className={styles.viewsContainer}>
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-3">
        <button
          onClick={() => setActiveScreen('home')}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to Voice Home"
        >
          <ArrowLeft className="size-4" />
          <span>Home</span>
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Udhaar Credit Ledger
        </span>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
          {customers.length} Accounts
        </span>
      </div>

      {/* Hero Stat Banner */}
      <div className={styles.heroBannerLedger}>
        <div className={styles.heroStatLabel} style={{ color: '#FDA4AF' }}>
          <TrendingDown className="size-3.5" />
          <span>Total Outstanding Udhaar</span>
        </div>
        <div className={styles.heroStatAmount}>
          <span>₹{totalOutstanding.toLocaleString()}</span>
          <span className="text-xs font-semibold text-rose-300/80">stuck credit</span>
        </div>
        <p className={styles.heroStatSub}>
          {overdueCount > 0 ? (
            <span className="text-amber-400 font-semibold">⚠️ {overdueCount} accounts overdue</span>
          ) : (
            <span className="text-emerald-400 font-semibold">✓ Credit recovery on track</span>
          )}
          {' • '}Instant WhatsApp reminders with 1-tap UPI deep links.
        </p>
      </div>

      {/* Instant Search Bar */}
      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>
          <Search className="size-4" />
        </span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search customer name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className={styles.searchClearBtn}
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className={styles.chipsTray}>
        <button
          className={`${styles.chipBtn} ${activeFilter === 'all' ? styles.chipBtnActive : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All ({customers.length})
        </button>
        <button
          className={`${styles.chipBtn} ${activeFilter === 'overdue' ? styles.chipBtnActiveAlert : ''}`}
          onClick={() => setActiveFilter('overdue')}
        >
          ⚠️ Overdue &lt;70
        </button>
        <button
          className={`${styles.chipBtn} ${activeFilter === 'gold' ? styles.chipBtnActive : ''}`}
          onClick={() => setActiveFilter('gold')}
        >
          🛡️ Gold 85+
        </button>
        <button
          className={`${styles.chipBtn} ${activeFilter === 'silver' ? styles.chipBtnActive : ''}`}
          onClick={() => setActiveFilter('silver')}
        >
          🥈 Silver 65-84
        </button>
        <button
          className={`${styles.chipBtn} ${activeFilter === 'bronze' ? styles.chipBtnActiveAlert : ''}`}
          onClick={() => setActiveFilter('bronze')}
        >
          ⚠️ At-Risk &lt;65
        </button>
      </div>

      {/* Customer List */}
      <div className="space-y-2.5">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserCheck className="size-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-bold text-foreground">No customers found</p>
            <p className="text-xs mt-1">Try adjusting your search query or filter chips.</p>
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const hasDebt = cust.current_balance > 0;
            return (
              <div key={cust.id} className={styles.itemCard}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{cust.name}</span>
                      <TrustBadge score={cust.trust_score} size="sm" language={language} />
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground block mt-0.5">
                      {cust.phone}
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-base font-black tabular-nums block ${
                        hasDebt ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {hasDebt ? `₹${cust.current_balance}` : '₹0 Settled'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {cust.total_transactions_count} visits
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/40">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock className="size-3" />
                    <span>
                      {hasDebt ? (
                        cust.trust_badge === 'BRONZE' ? (
                          <strong className="text-rose-400">High Overdue Risk</strong>
                        ) : (
                          'Active credit'
                        )
                      ) : (
                        <span className="text-emerald-400 font-semibold">Zero dues</span>
                      )}
                    </span>
                  </div>

                  {hasDebt ? (
                    <button
                      className={styles.whatsAppBtn}
                      onClick={() => handleSendReminder(cust)}
                      aria-label={`Send WhatsApp reminder to ${cust.name}`}
                    >
                      <MessageCircle className="size-3.5" />
                      <span>Send Reminder</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-400">
                      ✓ Paid in Full
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
