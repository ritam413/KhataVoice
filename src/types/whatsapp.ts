import { Language, WhatsAppTone } from './domain';

export interface ReminderDraftParams {
  customerName: string;
  customerPhone: string;
  balance: number;
  tone: WhatsAppTone;
  language: Language;
  merchantStoreName: string;
  merchantUpiVpa: string;
  lastPurchaseDate?: string;
  daysOverdue?: number;
}

export interface ReminderDraft {
  formattedText: string;
  waUrl: string;
  webWaUrl: string;
  upiUrl: string;
  phone: string;
  tone: WhatsAppTone;
  language: Language;
}

export interface ReminderApiResponse {
  success: boolean;
  draft?: ReminderDraft;
  error?: string;
}
