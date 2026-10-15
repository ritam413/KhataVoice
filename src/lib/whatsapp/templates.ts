import { Language, WhatsAppTone } from '@/types/domain';
import { ReminderDraftParams } from '@/types/whatsapp';

/**
 * Renders culturally respectful, polite debt recovery templates
 * in Bengali, Hindi, and English across 3 distinct tones.
 */
export function renderReminderMessage(
  params: ReminderDraftParams,
  upiUrl: string
): string {
  const { customerName, balance, tone, language, merchantStoreName, daysOverdue } = params;
  const formattedBalance = `₹${Math.round(balance).toLocaleString('en-IN')}`;

  // Bengali Templates
  if (language === 'bn') {
    switch (tone) {
      case 'polite':
        return `নমস্কার ${customerName} বাবু, ${merchantStoreName} থেকে বলছি। আশা করি আপনি ভালো আছেন। আপনার আগের ${formattedBalance} বাকি রয়েছে। সময়মতো দিয়ে দিলে খুব সুবিধা হয়।\n\nসরাসরি UPI এর মাধ্যমে পেমেন্ট করতে পারেন:\n${upiUrl}\n\nধন্যবাদ!`;
      case 'friendly':
        return `কেমন আছেন ${customerName} বাবু? ${merchantStoreName} থেকে আপনার খাতার হিসেব অনুযায়ী ${formattedBalance} বকেয়া রয়েছে। যখন সুবিধে হবে এই লিঙ্কে UPI দিয়ে পাঠিয়ে দেবেন:\n${upiUrl}\n\nভালো থাকবেন।`;
      case 'firm':
        const overdueText = daysOverdue ? ` (গত ${daysOverdue} দিন ধরে বকেয়া)` : '';
        return `জরুরি নোটিশ: নমস্কার ${customerName} বাবু, ${merchantStoreName}-এ আপনার মোট ${formattedBalance} বাকি রয়েছে${overdueText}। আপনার ক্রেডিট ট্রাস্ট স্কোর সুরক্ষিত রাখতে অনুগ্রহ করে আগামী ৪৮ ঘণ্টার মধ্যে UPI দিয়ে পরিশোধ করুন:\n${upiUrl}\n\nসহযোগিতার জন্য ধন্যবাদ।`;
    }
  }

  // Hindi Templates
  if (language === 'hi') {
    switch (tone) {
      case 'polite':
        return `नमस्ते ${customerName} जी, ${merchantStoreName} से। आशा है आप सकुशल हैं। आपकी ${formattedBalance} की पुरानी उधारी शेष है। कृपया सुविधानुसार चुका दें।\n\nआप सीधे UPI से भुगतान कर सकते हैं:\n${upiUrl}\n\nधन्यवाद!`;
      case 'friendly':
        return `हैलो ${customerName} जी, कैसे हैं आप? ${merchantStoreName} से याद दिलाना था कि आपके खाते में ${formattedBalance} बाकी हैं। जब समय मिले, नीचे दिए गए UPI लिंक से भेज दें:\n${upiUrl}\n\nशुभकामनाएं!`;
      case 'firm':
        const overdueText = daysOverdue ? ` (पिछले ${daysOverdue} दिनों से लंबित)` : '';
        return `सूचना: नमस्ते ${customerName} जी, ${merchantStoreName} में आपका कुल ${formattedBalance} बकाया है${overdueText}। अपना क्रेडिट ट्रस्ट स्कोर बनाए रखने के लिए कृपया अगले 48 घंटों में UPI द्वारा भुगतान करें:\n${upiUrl}\n\nसहयोग के लिए धन्यवाद।`;
    }
  }

  // English Templates (Default fallback)
  switch (tone) {
    case 'polite':
      return `Hello ${customerName} ji, warm greetings from ${merchantStoreName}. Just a gentle reminder regarding the pending balance of ${formattedBalance}. You can clear this easily via UPI:\n${upiUrl}\n\nThank you for your support!`;
    case 'friendly':
      return `Hi ${customerName}! Hope you are doing well. This is a quick note from ${merchantStoreName} regarding the pending balance of ${formattedBalance}. Whenever convenient, tap here to pay via UPI:\n${upiUrl}\n\nHave a great day!`;
    case 'firm':
      const overdueText = daysOverdue ? ` (overdue for ${daysOverdue} days)` : '';
      return `Payment Reminder: Hello ${customerName}, your pending balance of ${formattedBalance} at ${merchantStoreName} is currently outstanding${overdueText}. To maintain your Credit Trust Rating, kindly settle via UPI within 48 hours:\n${upiUrl}\n\nThank you.`;
  }
}
