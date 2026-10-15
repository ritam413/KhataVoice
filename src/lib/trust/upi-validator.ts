import { UpiLinkParams } from '@/types/trust';

const NPCI_VPA_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

/**
 * Validates a UPI Virtual Payment Address (VPA) against the official NPCI regex
 */
export function isValidUpiVpa(vpa: string): boolean {
  if (!vpa || typeof vpa !== 'string') return false;
  return NPCI_VPA_REGEX.test(vpa.trim());
}

/**
 * Generates an RFC 3986 compliant UPI payment deep link URL.
 * 
 * Guards:
 * - Validates VPA format
 * - Strictly escapes payee name, note, and parameters to prevent URI injection
 * - Formats amount to 2 decimal places
 */
export function generateValidUpiUrl(params: UpiLinkParams): string {
  const trimmedVpa = (params.vpa || '').trim();
  if (!isValidUpiVpa(trimmedVpa)) {
    throw new Error(`Invalid UPI VPA format: "${params.vpa}"`);
  }

  const safeAmount = Math.max(0, Number(params.amount) || 0).toFixed(2);
  const encodedVpa = encodeURIComponent(trimmedVpa);
  const encodedName = encodeURIComponent((params.payeeName || 'Kirana Store').trim());
  const encodedNote = encodeURIComponent((params.note || 'KhataVoice Udhaar Repayment').trim());

  return `upi://pay?pa=${encodedVpa}&pn=${encodedName}&am=${safeAmount}&cu=INR&tn=${encodedNote}`;
}
