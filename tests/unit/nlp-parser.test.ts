/**
 * Unit Test: Heuristic Kirana NLP Parser Benchmark (10 Benchmark Vernacular Phrases)
 * Verifies zero-crash, deterministic entity extraction across Bengali, Hindi, Hinglish, English.
 */
import assert from 'node:assert';
import { parseTransactionRegex } from '@/lib/nlp/regex-parser';

console.log('🧪 Running NLP Parser Unit Benchmark Tests...\n');

let passed = 0;
function testCase(id: number, desc: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ Benchmark #${id}: ${desc}`);
    passed++;
  } catch (err: any) {
    console.error(`  ❌ Benchmark #${id} FAILED: ${desc}\n     ${err.message}`);
    throw err;
  }
}

// 1. Bengali Udhaar
testCase(1, 'Bengali Udhaar (Shyam Sundar Das, 2kg rice + 1L oil)', () => {
  const result = parseTransactionRegex(
    'শ্যামবাবু ২ কেজি চাল আর ১ লিটার সর্ষের তেল বাকি লিখুন',
    'bn'
  );
  assert.strictEqual(result.transaction_type, 'udhaar_sale');
  assert.strictEqual(result.customer_name, 'Shyam Sundar Das');
  assert.ok(result.items.length >= 1, 'Should extract items');
  assert.ok(result.amount > 0, 'Amount should be computed');
});

// 2. Bengali Cash Payment
testCase(2, 'Bengali Cash Payment (Rohit, 500 rupees)', () => {
  const result = parseTransactionRegex(
    'রোহিত ৫০০ টাকা নগদ দিল',
    'bn'
  );
  assert.strictEqual(result.transaction_type, 'payment_received');
  assert.strictEqual(result.customer_name, 'Rohit Gupta');
  assert.strictEqual(result.amount, 500);
});

// 3. Hindi Udhaar
testCase(3, 'Hindi Udhaar (Rohit, 5kg atta + 2 maggi)', () => {
  const result = parseTransactionRegex(
    'रोहित जी के खाते में 5 किलो आशीर्वाद आटा और 2 पैकेट मैगी उधार लिख दो',
    'hi'
  );
  assert.strictEqual(result.transaction_type, 'udhaar_sale');
  assert.strictEqual(result.customer_name, 'Rohit Gupta');
  assert.ok(result.items.length >= 1, 'Should extract items');
  assert.ok(result.amount > 0, 'Amount should be calculated');
});

// 4. Hindi Restock
testCase(4, 'Hindi Restock (10 bags sugar)', () => {
  const result = parseTransactionRegex(
    '10 बोरी चीनी गोदाम में आई',
    'hi'
  );
  assert.strictEqual(result.transaction_type, 'restock');
  assert.ok(result.items.length >= 1, 'Should extract items');
});

// 5. Hinglish Udhaar
testCase(5, 'Hinglish Udhaar (Amit Das, 2 packet Tata Salt)', () => {
  const result = parseTransactionRegex(
    'Amit Das ko 2 packet Tata Salt udhaar do',
    'hi'
  );
  assert.strictEqual(result.transaction_type, 'udhaar_sale');
  assert.strictEqual(result.customer_name, 'Amit Das');
  assert.ok(result.amount > 0, 'Amount should be non-zero');
});

// 6. English Udhaar
testCase(6, 'English Udhaar (Shyam, 2 liters Fortune mustard oil)', () => {
  const result = parseTransactionRegex(
    "Put 2 liters Fortune mustard oil on Shyam's credit",
    'en'
  );
  assert.strictEqual(result.transaction_type, 'udhaar_sale');
  assert.strictEqual(result.customer_name, 'Shyam Sundar Das');
  assert.ok(result.amount > 0, 'Amount computed');
});

// 7. English Payment
testCase(7, 'English Payment (Sunita Devi, 300 rupees)', () => {
  const result = parseTransactionRegex(
    'Sunita Devi paid 300 rupees cash today',
    'en'
  );
  assert.strictEqual(result.transaction_type, 'payment_received');
  assert.strictEqual(result.customer_name, 'Sunita Devi');
  assert.strictEqual(result.amount, 300);
});

// 8. Bengali Payment
testCase(8, 'Bengali Payment (Sunita Devi, 200 rupees)', () => {
  const result = parseTransactionRegex(
    'সুনীতা দেবী ২০০ টাকা শোধ করেছেন',
    'bn'
  );
  assert.strictEqual(result.transaction_type, 'payment_received');
  assert.strictEqual(result.customer_name, 'Sunita Devi');
  assert.strictEqual(result.amount, 200);
});

// 9. Hindi Payment
testCase(9, 'Hindi Payment (Amit Das, 150 rupees)', () => {
  const result = parseTransactionRegex(
    'अमित दास ने 150 रुपये जमा किए',
    'hi'
  );
  assert.strictEqual(result.transaction_type, 'payment_received');
  assert.strictEqual(result.customer_name, 'Amit Das');
  assert.strictEqual(result.amount, 150);
});

// 10. Hinglish Restock
testCase(10, 'Hinglish Restock (5 bottle Mustard Oil restock)', () => {
  const result = parseTransactionRegex(
    '5 bottle Mustard Oil restock',
    'en'
  );
  assert.strictEqual(result.transaction_type, 'restock');
  assert.ok(result.items.length >= 1, 'Items should be extracted');
});

console.log(`\n🎉 All ${passed}/10 NLP Benchmark Phrases passed with 100% accuracy!`);
