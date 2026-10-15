# KhataVoice: Devpost Submission Copy

## Inspiration

If you have ever stood at a corner Kirana shop during evening rush hour, you know it is pure organized chaos. Three aunties are debating coriander prices, two kids want Parle-G biscuits on credit, and the shopkeeper is trying to scribble names into a grease-stained red notebook with a pen that ran out of ink three months ago.

Whenever someone tries to hand these shopkeepers a digital app, it fails for a very simple reason: you cannot type on a cracked phone screen when your hands are covered in flour, spices, and mustard oil. Navigating three sub-menus while twenty customers shout orders is just not happening. So the notebook stays, and by the end of the month, ₹30,000 to ₹50,000 gets locked up in forgotten debts. Even worse, walking over to a neighbor's house to ask for ₹150 feels like committing a social crime.

We built KhataVoice so the shopkeeper can just speak out loud in their own language, while the app quietly does the math, updates the shelves, and handles the awkward debt recovery without ruining neighborhood friendships.

## What it does

KhataVoice is a voice ledger built for how Indian neighborhood shops actually work.

A shopkeeper taps one big microphone button and says something like, *"Ramesh babu, two kilos of rice and one bottle of mustard oil on udhaar."*

In less than a second, KhataVoice parses the sentence, updates Ramesh babu's credit balance, and subtracts the rice and oil from the store inventory in one go.

It also calculates a Credit Trust Score from 0 to 100 based on how fast people actually repay. When bills pile up, the merchant does not have to make an uncomfortable phone call. With one tap, KhataVoice prepares a culturally polite WhatsApp reminder in Bengali, Hindi, or English, complete with a direct UPI payment link. The customer can settle their bill in two taps before their morning tea gets cold.

## How we built it

We built the frontend with Next.js 14, TypeScript, and Tailwind CSS. We wrapped it in a dual-mode layout that lets you switch between an authentic handheld mobile view and a widescreen desktop command center.

For the voice pipeline, we built an adaptive three-tier system. It uses the native browser Web Speech API for instant client-side transcription, proxies to the Government of India's Bhashini Dhruva speech engine for regional vernacular dialects, and keeps pre-recorded audio presets ready so hackathon demos never fail on a silent microphone.

To parse messy spoken sentences, we paired local LLMs with a fast phonetic regex engine that converts vernacular numerals and colloquial grocery terms into structured JSON.

On the storage side, Supabase handles PostgreSQL data with row-level security and live Realtime sync. When Supabase is offline or unconfigured, an in-memory fallback store takes over immediately so the app never throws an unexpected error.

## Challenges we ran into

Parsing Indian retail speech was a wild ride. In Kolkata or Delhi, people rarely speak textbook grammar. A customer might say, *"Shyam babu ke duto Miniket chal ar ekta mustard oil baki dao,"* mixing Bengali, English, and brand names in a single breath. Teaching our parser that *"duto"* means two and *"Miniket"* is a premium rice took plenty of late-night head scratching.

Our audio waveform visualizer also gave us a fun scare. In React 18 strict mode, the audio analyzer kept remounting without properly closing the previous audio context. For about twenty minutes, we had an acoustic feedback loop loud enough to alert every stray dog in the neighborhood.

Then there was the inventory problem. In standard software, if digital inventory hits zero, you block the checkout. But in a real Kirana, a shopkeeper will never turn away cash just because a computer says the shelf is empty. If the pouch is physically in his hand, he sells it. We had to rewrite our database routines so sales never stall on negative numbers, logging restock warnings instead of throwing angry red errors.

## Accomplishments that we're proud of

We got the full pipeline from spoken voice to entity parsing and database write down to under 950 milliseconds.

Our offline heuristic parser handles tricky multilingual phrases with 100% accuracy on our benchmark suite without charging a single rupee in cloud API fees.

The simulated retail Soundbox chime is another favorite detail. It rings a dual-tone harmonic bell and speaks a vernacular voice confirmation in Bengali, Hindi, or English, giving shopkeepers the exact audio confirmation they rely on every day.

## What we learned

Building for neighborhood merchants taught us to throw out half of our textbook software assumptions. Corner shop owners do not care about fancy analytics with twenty graphs or corporate SaaS buzzwords. They care about two simple things: did my stock decrease, and will I get my money back before rent is due?

We also learned that debt recovery is mostly about etiquette. If an automated tool sends a cold, intimidating collection notice to someone who has lived across the street for twenty years, the shopkeeper will delete the app on the spot. The message has to sound like a polite neighbor, not a debt collection agency.

## What's next for KhataVoice

Next, we want to connect KhataVoice directly to local wholesale distributors. When rice or cooking oil runs low, the app should be able to prepare a restock draft directly to the supplier on WhatsApp.

We also want to use verified credit trust scores to help reliable shopkeepers qualify for low-interest micro-working capital loans, helping them stock up for festival seasons without drowning in paperwork.
