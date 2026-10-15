/**
 * Automated Verification Harness for Ticket KV-17
 * Screen 5: Cultural WhatsApp Debt Recovery Modal with 3 Tones & 1-Tap Launch
 */

import fs from 'fs';
import path from 'path';
import { generateReminderDraft } from '../src/lib/whatsapp/reminder-engine';
import { renderReminderMessage } from '../src/lib/whatsapp/templates';
import { SEED_CUSTOMERS, SEED_MERCHANT } from '../src/lib/db/seed-data';
import { WhatsAppTone, Language } from '../src/types/domain';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('--- KV-17 AUTOMATED VERIFICATION SUITE ---');

// 1. File Existence Gates
console.log('\n[1] Verifying File Architecture & Invariants:');
const modalPath = path.resolve(process.cwd(), 'src/components/views/WhatsAppModal.tsx');
const stylePath = path.resolve(process.cwd(), 'src/styles/whatsapp-modal.module.css');
assert(fs.existsSync(modalPath), 'WhatsAppModal.tsx exists');
assert(fs.existsSync(stylePath), 'whatsapp-modal.module.css exists');

const modalContent = fs.readFileSync(modalPath, 'utf8');
assert(modalContent.includes('export function WhatsAppModal'), 'Exports WhatsAppModal component');
assert(modalContent.includes('generateReminderDraft'), 'Integrates generateReminderDraft');
assert(modalContent.includes('handleSendWhatsApp'), 'Includes handleSendWhatsApp user-agent router');
assert(modalContent.includes('handleCopy'), 'Includes 1-tap clipboard copy handler');
assert(modalContent.includes('Escape'), 'Includes keyboard accessibility (Escape to close)');

// 2. Cultural Tones & Multi-Language Generation Gates
console.log('\n[2] Verifying Cultural 3-Tone Generator Matrix:');
const testCustomer = SEED_CUSTOMERS[0]; // Shyam Sundar Das, balance ₹420
const tones: WhatsAppTone[] = ['polite', 'friendly', 'firm'];
const languages: Language[] = ['bn', 'hi', 'en'];

for (const tone of tones) {
  for (const lang of languages) {
    const draft = generateReminderDraft({
      customerName: testCustomer.name,
      customerPhone: testCustomer.phone,
      balance: testCustomer.current_balance,
      tone,
      language: lang,
      merchantStoreName: SEED_MERCHANT.business_name,
      merchantUpiVpa: SEED_MERCHANT.upi_id,
    });

    assert(draft.formattedText.length > 30, `Draft generated for [${tone} | ${lang}] (${draft.formattedText.length} chars)`);
    assert(draft.upiUrl.startsWith('upi://pay?'), `UPI deep link formatted correctly for [${tone} | ${lang}]`);
    assert(draft.waUrl.startsWith('https://wa.me/91'), `Mobile wa.me URL formatted for [${tone} | ${lang}]`);
    assert(draft.webWaUrl.startsWith('https://web.whatsapp.com/send?phone=91'), `Desktop web.whatsapp.com formatted for [${tone} | ${lang}]`);
    assert(draft.formattedText.includes('₹420') || draft.formattedText.includes('420'), `Balance ₹420 included in [${tone} | ${lang}] text`);
  }
}

// 3. Cultural Content Specificity Gates
console.log('\n[3] Verifying Cultural Courtesy & Firmness Rules:');
const bnPolite = renderReminderMessage({
  customerName: 'Shyam Babu',
  customerPhone: '9876543210',
  balance: 420,
  tone: 'polite',
  language: 'bn',
  merchantStoreName: 'মা তারা ভ্যারাইটি স্টোর',
  merchantUpiVpa: 'maatarastore@okaxis',
}, 'upi://pay?...');
assert(bnPolite.includes('নমস্কার') && bnPolite.includes('আশা করি আপনি ভালো আছেন'), 'Bengali polite contains warm courtesy greeting');

const hiFirm = renderReminderMessage({
  customerName: 'Rohit Gupta',
  customerPhone: '9876543211',
  balance: 1250,
  tone: 'firm',
  language: 'hi',
  merchantStoreName: 'माँ तारा किराना स्टोर',
  merchantUpiVpa: 'maatarastore@okaxis',
  daysOverdue: 18,
}, 'upi://pay?...');
assert(hiFirm.includes('48 घंटों') && hiFirm.includes('क्रेडिट ट्रस्ट स्कोर'), 'Hindi firm contains 48hr and trust score protection notice');

// 4. MainClientView Integration Gate
console.log('\n[4] Verifying Viewport Simulator Mount:');
const clientViewPath = path.resolve(process.cwd(), 'src/components/views/MainClientView.tsx');
const clientViewContent = fs.readFileSync(clientViewPath, 'utf8');
assert(clientViewContent.includes('<WhatsAppModal />') || clientViewContent.includes('<WhatsAppModal'), 'WhatsAppModal is mounted inside MainClientView');

console.log(`\n========================================`);
console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
}
