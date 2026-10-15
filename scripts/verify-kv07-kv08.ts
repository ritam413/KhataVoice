import { parseTransactionRegex } from '../src/lib/nlp/regex-parser';
import { parseTransaction } from '../src/lib/nlp/parser-engine';
import { POST as transcribeHandler, OPTIONS as transcribeOptionsHandler } from '../src/app/api/transcribe/route';
import { POST as parseHandler, OPTIONS as parseOptionsHandler } from '../src/app/api/parse-transaction/route';
import { NextRequest } from 'next/server';

async function runVerification() {
  console.log('--- Verifying KV-07 & KV-08 (NLP Engine & Route Handlers) ---');

  // Test 1: Ticket KV-07 Exact Automated Verification Gate
  console.log('1. Testing Ticket KV-07 Verification Gate...');
  const gateRes = parseTransactionRegex('Rohit ji 500 udhaar', 'hi');
  if (gateRes.amount !== 500 || gateRes.transaction_type !== 'udhaar_sale') {
    throw new Error(`Gate failed: amount=${gateRes.amount}, type=${gateRes.transaction_type}`);
  }
  console.log('   ✓ Gate passed: "Rohit ji 500 udhaar" => amount: 500, type: udhaar_sale');

  // Test 2: Bengali complex Kirana phrase
  console.log('2. Testing Bengali Udhaar phrase with items...');
  const bnRes = parseTransactionRegex('শ্যামবাবু ২ কেজি চাল আর ১ লিটার সর্ষের তেল বাকি লিখুন', 'bn');
  if (bnRes.transaction_type !== 'udhaar_sale') throw new Error(`Expected udhaar_sale, got ${bnRes.transaction_type}`);
  if (!bnRes.customer_name?.includes('Shyam')) throw new Error(`Expected Shyam, got ${bnRes.customer_name}`);
  if (bnRes.items.length < 2) throw new Error(`Expected at least 2 items, got ${bnRes.items.length}`);
  console.log(`   ✓ Bengali Udhaar passed: Customer="${bnRes.customer_name}", Amount=₹${bnRes.amount}, Items=${bnRes.items.length}`);

  // Test 3: Hindi Udhaar phrase
  console.log('3. Testing Hindi Udhaar phrase...');
  const hiRes = parseTransactionRegex('रोहित जी के खाते में 5 किलो आटा उधार लिख दो', 'hi');
  if (hiRes.transaction_type !== 'udhaar_sale') throw new Error(`Expected udhaar_sale, got ${hiRes.transaction_type}`);
  if (!hiRes.customer_name?.includes('Rohit')) throw new Error(`Expected Rohit, got ${hiRes.customer_name}`);
  console.log(`   ✓ Hindi Udhaar passed: Customer="${hiRes.customer_name}", Amount=₹${hiRes.amount}`);

  // Test 4: English Cash Repayment phrase
  console.log('4. Testing English Payment Received phrase...');
  const enRes = parseTransactionRegex('Sunita Devi gave 300 rupees cash today', 'en');
  if (enRes.transaction_type !== 'payment_received') throw new Error(`Expected payment_received, got ${enRes.transaction_type}`);
  if (enRes.amount !== 300) throw new Error(`Expected 300, got ${enRes.amount}`);
  if (!enRes.customer_name?.includes('Sunita')) throw new Error(`Expected Sunita, got ${enRes.customer_name}`);
  console.log(`   ✓ English Payment passed: Customer="${enRes.customer_name}", Amount=₹${enRes.amount}`);

  // Test 5: Restock phrase
  console.log('5. Testing Restock phrase...');
  const restockRes = parseTransactionRegex('দোকানের স্টক ১০ টিন তেল এলো', 'bn');
  if (restockRes.transaction_type !== 'restock') throw new Error(`Expected restock, got ${restockRes.transaction_type}`);
  if (restockRes.items.length === 0) throw new Error('Expected restock items');
  console.log(`   ✓ Restock passed: Type=${restockRes.transaction_type}, Item="${restockRes.items[0]?.name}", Qty=${restockRes.items[0]?.quantity}`);

  // Test 6: Unified parseTransaction() Engine
  console.log('6. Testing Unified parseTransaction() Engine...');
  const unifiedRes = await parseTransaction({
    transcript: 'Rajesh Mondal paid 500 rupees towards credit',
    language: 'en'
  });
  if (unifiedRes.transaction_type !== 'payment_received' || unifiedRes.amount !== 500) {
    throw new Error('Unified parser failed');
  }
  console.log(`   ✓ Unified engine returned engine="${unifiedRes.engine}", amount=₹${unifiedRes.amount}`);

  // Test 7: CORS Preflight OPTIONS on Route Handlers
  console.log('7. Testing CORS Preflight OPTIONS Handlers...');
  const transcribeOptionsRes = await transcribeOptionsHandler();
  if (transcribeOptionsRes.status !== 204) throw new Error(`Expected 204 from transcribe OPTIONS, got ${transcribeOptionsRes.status}`);
  if (transcribeOptionsRes.headers.get('Access-Control-Allow-Origin') !== '*') {
    throw new Error('Missing CORS origin header on transcribe OPTIONS');
  }

  const parseOptionsRes = await parseOptionsHandler();
  if (parseOptionsRes.status !== 204) throw new Error(`Expected 204 from parse OPTIONS, got ${parseOptionsRes.status}`);
  if (parseOptionsRes.headers.get('Access-Control-Allow-Methods') !== 'POST, OPTIONS') {
    throw new Error('Missing CORS methods header on parse OPTIONS');
  }
  console.log('   ✓ CORS Preflight OPTIONS returned HTTP 204 with valid CORS headers');

  // Test 8: Ticket KV-08 Scenario 1: POST /api/transcribe with presetId & dual-envelope
  console.log('8. Testing Ticket KV-08 Scenario 1: POST /api/transcribe...');
  const transcribeStart = Date.now();
  const transcribeReq = new NextRequest('http://localhost:3000/api/transcribe', {
    method: 'POST',
    body: JSON.stringify({ presetId: 'preset-bn-shyam', language: 'bn' }),
    headers: { 'Content-Type': 'application/json' }
  });
  const transcribeRes = await transcribeHandler(transcribeReq);
  const transcribeElapsed = Date.now() - transcribeStart;

  if (transcribeRes.status !== 200) throw new Error(`Transcribe API returned ${transcribeRes.status}`);
  const transcribeJson = await transcribeRes.json();

  // Validate Ticket contract top-level fields
  if (!transcribeJson.success || !transcribeJson.transcript || transcribeJson.confidence === undefined) {
    throw new Error('Missing ticket contract top-level fields in transcribe response');
  }
  // Validate standard envelope
  if (!transcribeJson.data || !transcribeJson.data.transcript) {
    throw new Error('Missing standard data envelope in transcribe response');
  }
  // Validate CORS & Server-Timing headers
  if (transcribeRes.headers.get('Access-Control-Allow-Origin') !== '*') {
    throw new Error('Missing CORS headers on POST response');
  }
  if (!transcribeRes.headers.get('Server-Timing')?.includes('transcribe')) {
    throw new Error('Missing Server-Timing header');
  }
  console.log(`   ✓ Scenario 1 passed: Returned Bengali transcript within ${transcribeElapsed}ms (dual-envelope verified)`);

  // Test 9: Ticket KV-08 Scenario 2: POST /api/parse-transaction with "Rohit ji 500 udhaar"
  console.log('9. Testing Ticket KV-08 Scenario 2: POST /api/parse-transaction...');
  const parseReq = new NextRequest('http://localhost:3000/api/parse-transaction', {
    method: 'POST',
    body: JSON.stringify({ transcript: 'Rohit ji 500 udhaar', language: 'hi' }),
    headers: { 'Content-Type': 'application/json' }
  });
  const parseResponse = await parseHandler(parseReq);
  if (parseResponse.status !== 200) throw new Error(`Parse API returned ${parseResponse.status}`);
  const parseJson = await parseResponse.json();

  if (!parseJson.success || !parseJson.data) {
    throw new Error('Parse API response missing data envelope');
  }
  const data = parseJson.data;
  if (data.transaction_type !== 'udhaar_sale' || data.amount !== 500 || !data.customer_name?.includes('Rohit')) {
    throw new Error(`Scenario 2 failed: expected udhaar_sale, 500, Rohit. Got: type=${data.transaction_type}, amount=${data.amount}, customer=${data.customer_name}`);
  }
  console.log(`   ✓ Scenario 2 passed: type="${data.transaction_type}", amount=₹${data.amount}, customer="${data.customer_name}"`);

  // Test 10: Early Content-Length 413 Payload Too Large Guard
  console.log('10. Testing Early Content-Length 413 Guard...');
  const highContentLengthReq = new NextRequest('http://localhost:3000/api/transcribe', {
    method: 'POST',
    body: JSON.stringify({ language: 'bn' }),
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': '9000000' // 9MB indicated in header
    }
  });
  const highContentLengthRes = await transcribeHandler(highContentLengthReq);
  if (highContentLengthRes.status !== 413) {
    throw new Error(`Expected HTTP 413 on high content-length, got ${highContentLengthRes.status}`);
  }
  console.log('   ✓ Early Content-Length header 413 guard verified');

  // Test 11: Oversized Base64 String 413 Guard
  console.log('11. Testing Oversized Base64 String 413 Guard...');
  const oversizedBase64 = 'A'.repeat(8 * 1024 * 1024); // 8MB
  const payloadTooLargeReq = new NextRequest('http://localhost:3000/api/transcribe', {
    method: 'POST',
    body: JSON.stringify({ audioBlobBase64: oversizedBase64, language: 'bn' }),
    headers: { 'Content-Type': 'application/json' }
  });
  const payloadTooLargeRes = await transcribeHandler(payloadTooLargeReq);
  if (payloadTooLargeRes.status !== 413) {
    throw new Error(`Expected HTTP 413, got ${payloadTooLargeRes.status}`);
  }
  console.log('   ✓ Oversized body base64 413 guard verified');

  console.log('\nAll 11 verification checks PASSED successfully!');
}

runVerification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
