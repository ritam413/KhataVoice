import { ReminderDraft, ReminderDraftParams } from '@/types/whatsapp';
import { generateValidUpiUrl } from '@/lib/trust/upi-validator';
import { renderReminderMessage } from './templates';

/**
 * Normalizes Indian phone numbers to international E.164 format without '+' prefix (e.g., 919876543210)
 */
export function normalizeIndianPhoneNumber(phone: string): string {
  const digitsOnly = (phone || '').replace(/\D/g, '');
  if (digitsOnly.length === 10) {
    return `91${digitsOnly}`;
  }
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return digitsOnly;
  }
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    return `91${digitsOnly.slice(1)}`;
  }
  // Return digits as is if unknown length
  return digitsOnly || '919876543210';
}

/**
 * Generates a complete multilingual WhatsApp reminder draft with:
 * - RFC 3986 UPI deep link
 * - Mobile wa.me URL
 * - Desktop Web WhatsApp URL
 * - Plaintext for 1-tap clipboard copying
 */
export function generateReminderDraft(params: ReminderDraftParams): ReminderDraft {
  const {
    customerName,
    customerPhone,
    balance,
    tone,
    language,
    merchantStoreName,
    merchantUpiVpa,
  } = params;

  // Generate verified UPI payment URL
  const upiUrl = generateValidUpiUrl({
    vpa: merchantUpiVpa,
    payeeName: merchantStoreName,
    amount: balance,
    note: `Udhaar repayment by ${customerName}`,
  });

  // Render cultural text
  const rawMessage = renderReminderMessage(params, upiUrl);
  const encodedText = encodeURIComponent(rawMessage);
  const internationalPhone = normalizeIndianPhoneNumber(customerPhone);

  const waUrl = `https://wa.me/${internationalPhone}?text=${encodedText}`;
  const webWaUrl = `https://web.whatsapp.com/send?phone=${internationalPhone}&text=${encodedText}`;

  return {
    formattedText: rawMessage,
    waUrl,
    webWaUrl,
    upiUrl,
    phone: internationalPhone,
    tone,
    language,
  };
}
