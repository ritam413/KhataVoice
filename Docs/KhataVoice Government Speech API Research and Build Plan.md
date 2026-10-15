# KhataVoice: Government Speech API Research and Build Plan

Oct 11, 2026 · @Riu

## Bottom line

Use **Bhashini** for speech-to-text, not API Setu. Bhashini is the free government speech service; API Setu is a different MeitY platform and is not a speech API.

- **Bhashini** is MeitY's Indian-language AI platform. A third-party summary says it offers free speech recognition (ASR), translation, text-to-speech and transliteration for 22 Indian languages, with API access after registering at [bhashini.gov.in](https://bhashini.gov.in). Its own docs limit free use to proof of concept, so plan for a paid plan in production; see the next section. ([summary](https://schemesinindia.in/central/bhashini-digital-india-language-ai-platform))
- **API Setu** is MeitY's [open API marketplace](https://docs.apisetu.gov.in/document-central/explore-apisetu/Introduction.html) for document and verification APIs (DigiLocker, GSTN and similar). I found no speech service on it.
- **For KhataVoice:** Bhashini covers the voice-to-ledger step. API Setu is optional later, for example to verify a supplier's GSTIN.
- **Naming:** do not call the product "apisetu"; see the naming section.

## Bhashini speech recognition: access, limits, how it works

Bhashini's speech recognition is free for proof-of-concept use, which covers a hackathon demo. Its [official API docs](https://dibd-bhashini.gitbook.io/bhashini-apis/overall-understanding-of-the-api-calls.md) say usage is for PoC only, and anyone going to production or charging end users must contact Bhashini about paid plans and pricing.

**Get access (about 15 minutes if approval is instant; I could not confirm approval time):**

1. Register at [bhashini.gov.in/ulca/user/register](https://bhashini.gov.in/ulca/user/register#) and verify your email (check spam).
2. Log in, open **My Profile**, and press **Generate** to create an API key. App names must be lower-case words with underscores, and each account can hold 5 keys ([onboarding guide](https://bhashini.gitbook.io/bhashini-apis/pre-requisites-and-onboarding)).
3. Copy your **User ID** from the same page; the config call needs it with the key.
4. One partner guide describes a newer dashboard where the key request needs approval before the key appears ([example guide](https://appexchange.salesforce.com/image_host/1cc782c8-8584-4f2c-be6b-afdbc04bd0e1.pdf)). **Request the key tonight** so approval, if any, does not eat build time.

**How a call works:** two mandatory calls, per the [official docs](https://dibd-bhashini.gitbook.io/bhashini-apis/overall-understanding-of-the-api-calls.md).

| Step | Call | Purpose |
| --- | --- | --- |
| 0 (optional) | Pipeline Search | Find a pipeline ID that supports ASR |
| 1 | Pipeline Config | Send task (ASR), language and your User ID plus key; get back the model and service IDs |
| 2 | Pipeline Compute | Send the audio; get the transcript |

The docs also list a WebSocket ASR API for streaming. Language codes follow ISO-639 (Bengali `bn`, Hindi `hi`, English `en`).

**Shortcut (unofficial):** a community Python package, [bhashini-client](https://pypi.org/project/bhashini-client/0.1.8/), wraps both calls: `client.asr(audio_url, "bn")`, with the multilingual conformer model as the example service. A community client's code calls the compute endpoint `dhruva-api.bhashini.gov.in/services/inference/pipeline` and defaults to 16 kHz WAV audio ([example](https://huggingface.co/spaces/pvanand/general_chat/raw/c7ec9348471a4b76e2832ad67dd8b5e80b85c6a2/ai4b.py)). Check both against the official request payload page before relying on them.

**Open questions I could not verify:** exact rate limits, the real list of supported ASR languages today, and Bengali code-mixed accuracy. Test with 20 real sentences on day 1 (see the risks section). Bhashini's team lists a support email in its docs: digitalindiabhashinidivision@gmail.com.

## API Setu: what it is and whether it helps

API Setu is a marketplace where government and private publishers list APIs and consumers subscribe to them. It does not list a speech-to-text service in the pages I read, so it cannot replace Bhashini.

| Item | What the official pages say |
| --- | --- |
| Owner | Ministry of Electronics and IT (MeitY), Government of India ([introduction](https://docs.apisetu.gov.in/document-central/explore-apisetu/Introduction.html)) |
| API types | Document APIs (e.g. DigiLocker), Service APIs (e.g. GSTN verification, myScheme), Listing APIs ([overview](https://docs.apisetu.gov.in/document-central/explore-apisetu/Overview.html)) |
| Who can consume | Authorized partners via DigiLocker/MeriPehchaan, and offline consumers such as private firms verifying GSTN or PAN for vendor onboarding |
| Scale | 1,800+ partners, 4,200+ APIs, about 6 crore transactions a month ([Digital India](https://www.digitalindia.gov.in/initiative/api-setu)) |

**Use for KhataVoice:** optional, after the hackathon. A GSTIN check on supplier onboarding is the one natural fit. It needs registration and approvals I could not verify, so keep it out of the 4-day build and mention it only as a roadmap item.

## How voice becomes a ledger entry

The phone sends a short audio clip to your server. One adapter function calls Bhashini, hands the transcript to an LLM that maps it to the shop's own item list, and saves the result to the ledger, which also feeds the customer storefront.

&#91;embedded content: voice-to-ledger flow · 6 boxes\]

- **Keep the key on the server.** Call Bhashini from your backend, never from the browser, so your API key is not exposed.
- **Suggested stack (untested):** Next.js, Supabase, an LLM API and Vercel, as in the chat plan; any stack with a server function works.
- **For the video:** show the adapter code on screen. Swapping the provider in one place is your scalability and reliability answer, alongside separate data per shop.

## Risks and fallbacks

The biggest risk is depending on one speech service you have not tested. Build the speech step behind a small adapter so you can swap providers in minutes.

| Risk | Why it matters | Fallback |
| --- | --- | --- |
| Key approval is slow | You cannot build voice without a key | Request it tonight; meanwhile use the browser's built-in speech recognition (check Bengali support in Chrome yourself) |
| "PoC only" terms | Production use or charging users needs a paid plan | Pitch it as free for the pilot, show your measured cost per entry, and never claim free forever |
| Code-mixed speech | Speech models output one script, so English words like item names get transliterated into Bengali or Hindi script ([example of the problem](https://pypi.org/project/codemix-restore-shunyalabs/)) | Pass the transcript to your LLM with the shop's own item list so it maps variants to the right item |
| Unknown rate limits and latency | A slow call ruins a live demo | Keep clips under about 10 seconds, show a loading state, retry once, and record a clean take as a backup |
| Provider outage | Demo day failure | Adapter with a second provider. A community library lists Bhashini, Sarvam AI, a free Google option and local faster-whisper as interchangeable speech-to-text providers ([listing](https://pypi.org/project/indic-language-utils/)) |
| Shop noise | Real shops are loud | Test in a real shop on day 2 and report the measured error rate honestly |

**Rule for the video:** show the real transcript output, including one mistake and how the app recovers. Judges trust that more than a perfect run.

## The name "apisetu"

Do not use "apisetu" for your product or site. API Setu is an existing MeitY platform with its own site at [apisetu.gov.in](https://apisetu.gov.in/aboutus), so your site would look like a government service or like a copy of one. That hurts you with judges on originality and, if you collect shopkeepers' data, on trust. I have not checked trademark or domain rules, so treat this as a risk, not a legal finding.

Name ideas that describe what you do (availability unchecked for all of them):

- **KhataVoice**: ledger (khata) plus voice; the working name in the plan.
- **BolKhata**: "bol" means speak; short and easy to say in Hindi and Bengali.
- **DokanBol**: shop plus speak.

Before you commit, spend 10 minutes on each: search Devpost for the name, check the domain and social handles, and search India's trademark register. Credit the platforms you use inside the product instead: a footer line such as "Speech by Bhashini" is honest and shows judges you know the ecosystem, without implying you are the government.

## Build checklist to the Oct 16 deadline

Finish and submit on Thursday night, Oct 15; the 2:30am IST deadline on Oct 16 is only your safety margin.

&#91;embedded content: build plan by day · 5 work blocks, 1 deadline\]

**Tonight (Sun Oct 11)**

- [ ] Request the Bhashini key and copy your User ID
- [ ] Read the full rules: AI-tool use, build period, video limits
- [ ] Scan the Project gallery for similar ideas
- [ ] Write the 90-second demo script before any code

**Mon Oct 12**

- [ ] Interview 10 or more shopkeepers; note exact quotes
- [ ] Voice to transcript to ledger entry working end to end
- [ ] Test 20 real Bengali and Hindi sentences and log the error rate

**Tue Oct 13**

- [ ] Inventory built from entries, storefront link or QR, deployed on a public URL

**Wed Oct 14**

- [ ] Restock message and a simple trust score
- [ ] Pilot with 3 to 5 real shops and record their numbers

**Thu Oct 15**

- [ ] Record the 5-minute video: problem, code walkthrough, live demo, business model, scalability
- [ ] Submit on Devpost by 10pm IST

## Sources

Only the first Bhashini page below was opened in full. The others are search excerpts, so check details on the originals before relying on them. Bhashini's main site renders only in JavaScript and could not be read. Researched Oct 11, 2026.

- [Bhashini API docs: overall understanding of the API calls](https://dibd-bhashini.gitbook.io/bhashini-apis/overall-understanding-of-the-api-calls.md) (PoC-only note, three-call flow)
- [Bhashini API docs: pre-requisites and onboarding](https://bhashini.gitbook.io/bhashini-apis/pre-requisites-and-onboarding) (registration, key creation, User ID)
- [Bhashini overview summary (third party)](https://schemesinindia.in/central/bhashini-digital-india-language-ai-platform) (22 languages, free access claim; unofficial)
- [bhashini-client on PyPI](https://pypi.org/project/bhashini-client/0.1.8/) and [community client code](https://huggingface.co/spaces/pvanand/general_chat/raw/c7ec9348471a4b76e2832ad67dd8b5e80b85c6a2/ai4b.py) (unofficial examples)
- [API Setu introduction](https://docs.apisetu.gov.in/document-central/explore-apisetu/Introduction.html), [overview](https://docs.apisetu.gov.in/document-central/explore-apisetu/Overview.html) and [Digital India page](https://www.digitalindia.gov.in/initiative/api-setu)
- [indic-language-utils](https://pypi.org/project/indic-language-utils/) and [codemix-restore](https://pypi.org/project/codemix-restore-shunyalabs/) (provider options, code-mixed script issue)
- [Partner setup guide mentioning key approval](https://appexchange.salesforce.com/image_host/1cc782c8-8584-4f2c-be6b-afdbc04bd0e1.pdf)
