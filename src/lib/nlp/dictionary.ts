import type { TransactionType } from '@/types/domain';

// Map Eastern Nagari (Bengali) and Devanagari numerals to standard digits
export const VERNACULAR_DIGIT_MAP: Record<string, string> = {
  // Bengali
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  // Devanagari
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
};

export function normalizeVernacularDigits(text: string): string {
  return text.replace(/[০-৯०-९]/g, (char) => VERNACULAR_DIGIT_MAP[char] || char);
}

export const HONORIFIC_REGEX = /\b(babu|kaku|da|dada|didi|ji|uncle|bhaiya|বাবু|কাকু|দা|দাদা|দিদি|জি|भैया)\b/gi;

export const INTENT_KEYWORDS: Record<TransactionType, string[]> = {
  restock: [
    'দোকানের স্টক', 'স্টক', 'এলো',
    'माल आया', 'स्टॉक', 'आया', 'आई', 'गोदाम',
    'restock', 'stock', 'inventory', 'received', 'arrived'
  ],
  payment_received: [
    'জমা দিলো', 'জমা দিল', 'জমা', 'শোধ', 'দিলো', 'দিল', 'দিয়েছে',
    'चुका दिया', 'जमा', 'दिया', 'भुगतान',
    'paid', 'gave', 'payment', 'repayment', 'jama', 'chuka', 'settle', 'clear'
  ],
  udhaar_sale: [
    'বাকি লিখুন', 'বাকি লিখো', 'বাকি', 'বাকিতে', 'ধার', 'ধারে',
    'उधार', 'खाते में', 'खाता',
    'udhaar', 'baki', 'baaki', 'credit', 'khata', 'due'
  ],
  cash_sale: [
    'নগদ', 'নগদে',
    'नकद', 'रोकड़ा',
    'cash', 'nagad', 'nakad'
  ]
};

export const UNIT_MAP: Record<string, 'kg' | 'packet' | 'liter' | 'piece' | 'tin' | 'bag'> = {
  // Bengali
  'কেজি': 'kg',
  'কেজী': 'kg',
  'কিলো': 'kg',
  'লিটার': 'liter',
  'প্যাকেট': 'packet',
  'টিন': 'tin',
  'বস্তা': 'bag',
  'পিস': 'piece',
  // Hindi
  'किलो': 'kg',
  'लीटर': 'liter',
  'पैकेट': 'packet',
  'टिन': 'tin',
  'बोरी': 'bag',
  // English / Hinglish
  'kg': 'kg',
  'kilo': 'kg',
  'liter': 'liter',
  'litre': 'liter',
  'l': 'liter',
  'ltr': 'liter',
  'packet': 'packet',
  'pkt': 'packet',
  'tin': 'tin',
  'bag': 'bag',
  'piece': 'piece',
  'pc': 'piece',
};

export interface CatalogSynonym {
  keywords: string[];
  canonicalName: string;
  defaultUnit: 'kg' | 'packet' | 'liter' | 'piece' | 'tin' | 'bag';
  defaultUnitPrice: number;
}

export const CATALOG_SYNONYMS: CatalogSynonym[] = [
  {
    keywords: ['সর্ষের তেল', 'সরিষার তেল', 'সর্ষে তেল', 'তেল', 'सरसों का तेल', 'सरसों तेल', 'तेल', 'mustard oil', 'oil'],
    canonicalName: 'Fortune Mustard Oil 1L',
    defaultUnit: 'liter',
    defaultUnitPrice: 130
  },
  {
    keywords: ['আটা', 'আশীর্বাদ আটা', 'आटा', 'आशीर्वाद आटा', 'aashirvaad atta', 'atta', 'flour'],
    canonicalName: 'Aashirvaad Chakki Atta 5kg',
    defaultUnit: 'kg',
    defaultUnitPrice: 44 // ₹220 for 5kg => ₹44/kg
  },
  {
    keywords: ['ম্যাগি', 'নুডলস', 'मैगी', 'नूडल्स', 'maggi', 'noodles'],
    canonicalName: 'Maggi 2-Minute Noodles 70g',
    defaultUnit: 'packet',
    defaultUnitPrice: 14
  },
  {
    keywords: ['চাল', 'ভাত', 'মিনিকেট', 'चावल', 'rice', 'miniket'],
    canonicalName: 'Miniket Rice',
    defaultUnit: 'kg',
    defaultUnitPrice: 45
  },
  {
    keywords: ['চিনি', 'चीनी', 'sugar', 'chini'],
    canonicalName: 'Sugar 1kg',
    defaultUnit: 'kg',
    defaultUnitPrice: 44
  },
  {
    keywords: ['লবণ', 'নুন', 'नमक', 'salt', 'namak'],
    canonicalName: 'Tata Salt 1kg',
    defaultUnit: 'packet',
    defaultUnitPrice: 28
  },
  {
    keywords: ['বিস্কুট', 'পারলে-জি', 'বিস্কিট', 'बिस्कुट', 'पारले-जी', 'parle-g', 'biscuit', 'parle'],
    canonicalName: 'Parle-G 80g',
    defaultUnit: 'packet',
    defaultUnitPrice: 10
  },
  {
    keywords: ['চা পাতা', 'টাটা চা', 'চা প্যাকেট', 'चाय पत्ती', 'चाय', 'tea packet', 'tea'],
    canonicalName: 'Tata Tea Premium',
    defaultUnit: 'packet',
    defaultUnitPrice: 120
  },
  {
    keywords: ['ডাল', 'মসুর ডাল', 'दाल', 'मसूर दाल', 'masoor dal', 'dal', 'lentil'],
    canonicalName: 'Masoor Dal 1kg',
    defaultUnit: 'kg',
    defaultUnitPrice: 110
  },
  {
    keywords: ['সাবান', 'ডেটোল', 'साबुन', 'डेटॉल', 'dettol', 'soap'],
    canonicalName: 'Dettol Soap 75g',
    defaultUnit: 'piece',
    defaultUnitPrice: 38
  }
];
