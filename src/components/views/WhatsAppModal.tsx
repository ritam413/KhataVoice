'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Customer, Language, WhatsAppTone } from '@/types/domain';
import { useAppStore } from '@/lib/store/useAppStore';
import { generateReminderDraft } from '@/lib/whatsapp/reminder-engine';
import { TrustBadge } from '@/components/ui/trust-badge';
import { SEED_MERCHANT } from '@/lib/db/seed-data';
import { toast } from 'sonner';
import {
  X,
  MessageCircle,
  Copy,
  Check,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  Send,
  Sparkles,
} from 'lucide-react';
import styles from '@/styles/whatsapp-modal.module.css';

export interface WhatsAppModalProps {
  customer?: Customer | null;
  isOpen?: boolean;
  onClose?: () => void;
  merchantStoreName?: string;
  merchantUpiVpa?: string;
}

export function WhatsAppModal({
  customer: propCustomer,
  isOpen: propIsOpen,
  onClose: propOnClose,
  merchantStoreName = SEED_MERCHANT.business_name,
  merchantUpiVpa = SEED_MERCHANT.upi_id,
}: WhatsAppModalProps) {
  const storeCustomer = useAppStore((s) => s.selectedCustomerForReminder);
  const setStoreCustomer = useAppStore((s) => s.setSelectedCustomerForReminder);
  const storeLanguage = useAppStore((s) => s.language);

  // Active customer from props or store
  const customer = propCustomer !== undefined ? propCustomer : storeCustomer;
  const isOpen = propIsOpen !== undefined ? propIsOpen : Boolean(customer);

  // Close callback
  const handleClose = useCallback(() => {
    if (propOnClose) {
      propOnClose();
    } else {
      setStoreCustomer(null);
    }
  }, [propOnClose, setStoreCustomer]);

  // Tone & Language State
  const [tone, setTone] = useState<WhatsAppTone>('polite');
  const [lang, setLang] = useState<Language>(storeLanguage || 'bn');
  const [isCopied, setIsCopied] = useState(false);

  // Sync initial language with store language when opening
  useEffect(() => {
    if (isOpen) {
      setLang(storeLanguage || 'bn');
      // If customer has bronze score (<65), recommend firm tone, else polite
      if (customer && customer.trust_score < 65) {
        setTone('firm');
      } else {
        setTone('polite');
      }
    }
  }, [isOpen, customer, storeLanguage]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Generate Reminder Draft
  const reminderDraft = useMemo(() => {
    if (!customer) return null;

    return generateReminderDraft({
      customerName: customer.name,
      customerPhone: customer.phone,
      balance: customer.current_balance,
      tone,
      language: lang,
      merchantStoreName,
      merchantUpiVpa,
    });
  }, [customer, tone, lang, merchantStoreName, merchantUpiVpa]);

  if (!isOpen || !customer || !reminderDraft) {
    return null;
  }

  // Handle Send on WhatsApp (Mobile vs Desktop User-Agent Detection)
  const handleSendWhatsApp = () => {
    const isMobile =
      typeof navigator !== 'undefined' &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    const targetUrl = isMobile ? reminderDraft.waUrl : reminderDraft.webWaUrl;

    toast.success(`Launching WhatsApp for ${customer.name}...`, {
      description: `Tone: ${tone.toUpperCase()} • Balance: ₹${customer.current_balance}`,
    });

    if (typeof window !== 'undefined') {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Handle 1-Tap Copy to Clipboard
  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(reminderDraft.formattedText);
        setIsCopied(true);
        toast.success('Copied to clipboard!', {
          description: 'Message & UPI link ready to paste in WhatsApp.',
        });
        setTimeout(() => setIsCopied(false), 2500);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = reminderDraft.formattedText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setIsCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setIsCopied(false), 2500);
      }
    } catch {
      toast.error('Failed to copy to clipboard.');
    }
  };

  // Customer trust score advice
  const isGoldCustomer = customer.trust_score >= 85;
  const isBronzeCustomer = customer.trust_score < 65;

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-modal-title"
    >
      <div className={styles.modalSheet}>
        {/* Grabber indicator */}
        <div className={styles.grabber} />

        {/* Modal Header */}
        <div className={styles.header}>
          <div className={styles.customerMeta}>
            <div className={styles.customerNameRow}>
              <span id="whatsapp-modal-title" className={styles.customerName}>
                {customer.name}
              </span>
              <TrustBadge score={customer.trust_score} size="sm" language={lang} />
            </div>
            <span className={styles.customerPhone}>
              {customer.phone} · {customer.total_transactions_count} orders
            </span>
          </div>

          <div className="flex items-center">
            <div className={styles.debtBadge}>
              <span className={styles.debtAmount}>
                ₹{customer.current_balance.toLocaleString('en-IN')}
              </span>
              <span className={styles.debtLabel}>Overdue Udhaar</span>
            </div>
            <button
              onClick={handleClose}
              className={styles.closeBtn}
              aria-label="Close recovery modal"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className={styles.contentBody}>
          {/* Tone Selector Segmented Control */}
          <div className={styles.controlSection}>
            <div className={styles.sectionLabel}>
              <span>Cultural Message Tone</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                Select demeanor
              </span>
            </div>
            <div className={styles.toneSelector} role="radiogroup">
              <button
                type="button"
                role="radio"
                aria-checked={tone === 'polite'}
                className={`${styles.toneBtn} ${styles.toneBtnPolite} ${
                  tone === 'polite' ? styles.toneBtnActive : ''
                }`}
                onClick={() => setTone('polite')}
              >
                <span>🌸 Polite Gentle</span>
                <span className="text-[9px] opacity-75">Respectful tab</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={tone === 'friendly'}
                className={`${styles.toneBtn} ${styles.toneBtnFriendly} ${
                  tone === 'friendly' ? styles.toneBtnActive : ''
                }`}
                onClick={() => setTone('friendly')}
              >
                <span>🤝 Friendly</span>
                <span className="text-[9px] opacity-75">Casual nudge</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={tone === 'firm'}
                className={`${styles.toneBtn} ${styles.toneBtnFirm} ${
                  tone === 'firm' ? styles.toneBtnActive : ''
                }`}
                onClick={() => setTone('firm')}
              >
                <span>⚠️ Firm Overdue</span>
                <span className="text-[9px] opacity-75">48hr notice</span>
              </button>
            </div>
          </div>

          {/* Language Selector */}
          <div className={styles.controlSection}>
            <div className={styles.sectionLabel}>
              <span>Language Script</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                Customer vernacular
              </span>
            </div>
            <div className={styles.langPills}>
              <button
                type="button"
                className={`${styles.langPill} ${lang === 'bn' ? styles.langPillActive : ''}`}
                onClick={() => setLang('bn')}
              >
                বাংলা (Bengali)
              </button>
              <button
                type="button"
                className={`${styles.langPill} ${lang === 'hi' ? styles.langPillActive : ''}`}
                onClick={() => setLang('hi')}
              >
                हिंदी (Hindi)
              </button>
              <button
                type="button"
                className={`${styles.langPill} ${lang === 'en' ? styles.langPillActive : ''}`}
                onClick={() => setLang('en')}
              >
                English
              </button>
            </div>
          </div>

          {/* Trust Advice Guidance */}
          {isGoldCustomer && tone === 'firm' && (
            <div className={`${styles.trustAdvice} text-amber-300 border-amber-500/30 bg-amber-500/10`}>
              <ShieldCheck className="size-4 text-amber-400 shrink-0" />
              <span>
                <strong>Gold Trust Customer:</strong> Firm tone may harm long-term relationship.
                Consider Polite or Friendly.
              </span>
            </div>
          )}

          {isBronzeCustomer && (
            <div className={`${styles.trustAdvice} text-rose-300 border-rose-500/30 bg-rose-500/10`}>
              <ShieldAlert className="size-4 text-rose-400 shrink-0" />
              <span>
                <strong>At-Risk Account:</strong> Firm tone with 48-hour settlement notice is
                recommended.
              </span>
            </div>
          )}

          {/* Authentic WhatsApp Message Bubble */}
          <div className={styles.whatsappContainer}>
            <div className={styles.whatsappHeader}>
              <div className={styles.whatsappAvatar}>
                {customer.name.slice(0, 1)}
              </div>
              <div className={styles.whatsappHeaderInfo}>
                <span className={styles.whatsappHeaderName}>{customer.name}</span>
                <span className={styles.whatsappHeaderStatus}>
                  <span className="size-1.5 rounded-full bg-emerald-400 inline-block" />
                  WhatsApp Draft Preview
                </span>
              </div>
            </div>

            <div className={styles.whatsappBody}>
              <div className={styles.chatBubble}>
                <p className={styles.messageText}>{reminderDraft.formattedText}</p>
                <div className={styles.bubbleMeta}>
                  <span>Just now</span>
                  <span className={styles.ticks}>
                    <Check className="size-3 stroke-[2.5]" />
                    <Check className="size-3 stroke-[2.5] -ml-1.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className={styles.actionsBar}>
          <button
            type="button"
            className={styles.sendWhatsappBtn}
            onClick={handleSendWhatsApp}
            aria-label="Send reminder on WhatsApp"
          >
            <MessageCircle className="size-5 fill-white stroke-none" />
            <span>Open WhatsApp (wa.me)</span>
          </button>

          <button
            type="button"
            className={styles.copyClipboardBtn}
            onClick={handleCopy}
            aria-label="Copy message and UPI link to clipboard"
          >
            {isCopied ? (
              <>
                <Check className="size-4 text-emerald-400" />
                <span className="text-emerald-300">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="size-4" />
                <span>Copy Message & UPI Deep Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
