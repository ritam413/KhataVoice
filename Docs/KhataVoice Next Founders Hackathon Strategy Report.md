# KhataVoice: Next Founders Hackathon Strategy Report

Oct 11, 2026 · @Riu

## Summary

Build **KhataVoice**, an app that gets small shopkeepers paid: they speak a sale or a credit entry in Bengali, Hindi or English, and the app keeps the stock list current, tracks who owes what, scores each customer's repayment habits, and drafts a reminder in the customer's language. We win on evidence from real shops, not on the idea alone.

- **Positioning:** voice is how entries get in, not what we sell. We sell repaid credit (udhaar), because voice ledgers for shops already exist and cannot be our edge. Inventory management stays in as the second core feature: the same spoken entry updates the stock.
- **Why this can win:** winners of comparable startup hackathons were picked because they worked like real startups, solved a real problem, and showed real demand (next section).
- **Biggest threat:** one student hackathon project, ClearBooks AI, records shop sales from voice notes in Tamil or English ([LinkedIn post](https://in.linkedin.com/in/tanu02)). Our edge is the credit trust score, the language-aware reminders, and a measured pilot outcome. I did not verify what Khatabook, OkCredit or others offer today.
- **Speech API:** Bhashini, the government speech service, free for proof-of-concept use only.
- **No past winners list exists for this hackathon.** It is a first edition as far as I could find, so the winner research uses comparable events, listed with their sources.

## Previous winners and why they won

The winners that match our situation were chosen for being startup-like, solving a real problem, and showing demand, not for technical show. I found no winners list for the Next Founders Hackathon itself, so these come from comparable events.

| Winner and event | What it does | Why it won | Takeaway for us |
| --- | --- | --- | --- |
| [LaunchPie](https://stack.convex.dev/hacakthon-winners-winter-2024), Best Overall, Convex Zero to One (2,400+ participants, 79 apps) | Equity tracking and cap-table modelling for founders | Judges said it works like a ready-to-be-backed startup on the backend. Its builder, a corporate attorney, had seen equity disputes first-hand, then [spoke with entrepreneurs to confirm demand](https://stack.convex.dev/launchpie-hackathon-winner) and opened a waitlist | Founder-problem fit, proof of demand, a waitlist |
| [Farmware](https://stack.convex.dev/hacakthon-winners-winter-2024), Best Startup Idea, same event | Historical soil-moisture readings for farmers from satellite imagery | Judges framed a startup idea as impact on a real problem, and it combined image storage, server actions and outside APIs | Underserved users plus a real data API |
| [ConvJobs](https://stack.convex.dev/hacakthon-winners-winter-2024), Best AI App, same event | AI recruiter using vector search | Combined several opportunities into one tool serving both recruiters and job seekers | Value for both sides of a market |
| [recapit](https://stack.convex.dev/hacakthon-winners-winter-2024), Most Viral App, same event | Study recap app | Its builder shared it widely on social channels, which also brought early customer feedback | Public traction earns points |
| [BimaSathi](https://www.iiitd.ac.in/sites/default/files/docs/pressreleases/2026/AWS%20Hackathon%20press%20note_iiitd-April%202026.pdf), Student Track winner, AWS AI for Bharat 2026 (96,000 developers) | WhatsApp-first, voice and multilingual insurance claims assistant | A real public-impact problem for low-digital-literacy users, built to be deployable ([report](https://yourstory.com/2026/06/crop-insurance-conversational-analytics-ai-for-bharat-hackathon)); each winning team received Rs 3 lakh | Indian-language voice for low-literacy users wins, but it is also a crowded theme |
| [VoiceGuru](https://sode-edu.in/smvitm/news-2/news/from-idea-to-impact-smvitm-wins-at-build-for-bengaluru-hackathon/), Award of Excellence, Build for Bengaluru 2026 | Voice-first AI tutor for state-board students | Praised for real-world impact and accessibility | Same theme again |

**Not read in detail:** Convex's second hackathon named Fireview (overall), Relio CRM (startup idea), AIbase (AI) and DirectReach AI (viral) as winners, per a [summary](https://www.plushcap.com/companies/convex/blog/summaries/2024/09). I did not find the reasons.

**Pattern across the winners:**

1. They looked like a company: working backend, real users or a waitlist.
2. The builder knew the problem first-hand or talked to the users.
3. They used real data or APIs, not a canned demo.
4. They showed outside attention: feedback, shares, a waitlist.

## What judges notice

Judges will score a 5-minute video, so they cannot ask questions; the video itself must answer "how is this different?", "what is the business model?" and "does it work?". Each of the four criteria carries 25%, taken from the hackathon page. The "scores high" and "scores low" columns come from published judging guides, not from this hackathon's judge.

| Criterion (25% each) | What the page asks | Scores high | Scores low | Our proof |
| --- | --- | --- | --- | --- |
| Technical Execution | Does it actually work; grasp of the stack | Live demo that works first try, public URL, code you can explain | Crashes, a localhost demo with a flaky API call, code you cannot explain ([HackerEarth](https://www.hackerearth.com/blog/10-tips-win-hackathon), [Reskilll](https://blogs.reskilll.com/what-hackathon-judges-look-for-complete-judging-criteria-breakdown-2026/)) | Deployed app, the adapter code on screen, a real transcript including one error |
| Innovation & UX | Original idea; intuitive interface and flow | An underserved audience, two ideas combined into something new | "Another todo app" or "another chatbot" | A shopkeeper speaks a credit sale and sends a reminder in two taps |
| Business & Finance | Realistic model, revenue streams, path to sustainability | A model that sustains itself without extra funds, with real numbers | A great demo with no business side, a common complaint ([veteran tip](https://hashnode.com/posts/hackathon-presenter-tips/5cff461610f45faf781985ff/comment/5d02c1e1a2d0bd102e98f3d9)) | Pricing, measured cost per entry, pilot numbers |
| Communication | Deep understanding of product, architecture and consumers | A clear story, then the demo; the team owns the story, not only the code ([Masai](https://www.masaischool.com/blog/how-to-win-an-ai-hackathon-in-2026-full-guide/)) | Engineers who can wire a pipeline but cannot explain who needs it | Real shopkeeper quotes, a scripted video, one owner for the story |

**What gets a project screened out**

- A video that skips one of the four required points: problem, build walkthrough, live demo, scalability.
- A demo that only works on a developer's machine.
- Ignoring the rules or the theme, a common mistake ([guide](https://www.placementpreparation.io/blog/?p=17721)).
- Not meeting eligibility: students aged 13 to 22 only, teams of 1 to 5.

**Open item:** the page lists one judge, Ekansh Jain. I did not research his background; look him up and tune the pitch to it.

## Our project: KhataVoice

KhataVoice helps small shops get their credit (udhaar) repaid: the shopkeeper speaks an entry in Bengali, Hindi or English, the app keeps the credit ledger, scores each customer's repayment habits, and drafts a reminder in the customer's language for the shopkeeper to approve and send. It also manages inventory: each spoken sale or purchase updates the stock list, and a storefront and a restock message build on that. "Khata" means ledger. The name is a working title; check availability before committing.

**One-line pitch for the video:** "Speak your credit sales, and KhataVoice helps you get paid back."

**Who it is for:** owners of small neighbourhood shops who keep accounts by hand, starting with shops we can reach in Kolkata.

| Feature | Build priority | Why it is in or out |
| --- | --- | --- |
| Voice entry to credit ledger | Must have | How entries get in; the core of the live demo |
| Inventory management (simple version) | Must have | The original idea. A spoken sale lowers the item's stock, a spoken purchase raises it, and a low-stock list shows what to reorder. No barcodes or photos |
| Reminder in the customer's language | Must have | The outcome we sell; the shopkeeper approves it and sends it through a `wa.me` link, no WhatsApp API |
| Credit trust score per customer | Must have | Simple rules from repayment history, not machine learning; the data-moat story |
| Storefront from the stock list | Nice to have | Shows the zero-setup idea; cut if time is short |
| Restock message to a supplier | Nice to have | Built from the low-stock list; cut first |

If time runs short, cut from the bottom of the table, never from the top.

## The problem we are solving

Small shop owners sell on credit and track it on paper or from memory, so money owed is chased late or never. One student team describes the wider problem: [shop owners rely on paper notebooks](https://in.linkedin.com/in/tanu02), with no backups and poor stock visibility. Both are descriptions from others; our interviews must confirm them, especially how much credit is outstanding and how it gets recovered.

**The five pains we believe exist (hypotheses to test):**

1. **Credit is untracked.** Money owed is remembered, not recorded, so shopkeepers cannot say exactly who owes what.
2. **Chasing is awkward.** Asking customers for money face to face strains the relationship; a polite written message may be easier.
3. **No view of who pays.** Shopkeepers cannot easily tell reliable customers from slow ones before giving more credit.
4. **Stock is guesswork.** Without a running count, a shopkeeper learns an item is out when a customer asks for it.
5. **Typing is a barrier.** Apps that need typed entries lose busy shopkeepers who speak a local language.

**Interview questions for the 10 or more shopkeepers (Mon Oct 12):**

- How do you record sales and credit today, and what goes wrong?
- How much money is owed to you right now, and how do you chase it?
- What share of credit is repaid late or never?
- Would you send customers a written reminder? In which language and on which app?
- How do you track stock today, and how do you decide what to reorder?
- Would you speak entries instead of writing them? In which language?
- Have you tried a ledger app? Why did you stop?
- What would you pay per month, if anything?

Write down exact quotes and counts. "7 of 10 keep credit only in a notebook" is worth more in the video than any market-size claim.

## How we solve it

The shopkeeper speaks a sale or a credit entry; the app records it, updates the stock, scores the customer's repayment habits, and drafts a reminder the shopkeeper approves and sends, with the storefront and restock message building on the stock list.

&#91;embedded content: product flow · 1 input, 4 outputs\]

Speaking is the only data entry the shopkeeper does; the stock list, the score and the reminder are derived from it. The outcome we sell is repaid credit, which keeps the pitch to one sentence and the build small enough for four days. The technical path from audio to ledger, including the Bhashini calls, is in the [architecture drawing](https://claude.ai/code/artifact/35f68f7e-0c09-426b-a20b-2214676e25c5).

## Our five USPs

No single feature here is unique on its own, and voice entry already appears in other student projects, so voice is how entries get in, not what we sell. We sell repaid credit; USPs 1 to 3 are built around it, and USP 5, the field evidence, matters most.

| # | USP | What it means | Criterion it earns | Proof to show |
| --- | --- | --- | --- | --- |
| 1 | Gets credit repaid | The product is built around one outcome: customers who owe pay back. The pilot metric is reminders sent and customers who responded | Business & Finance | Pilot numbers on reminders and replies; claim only what we see |
| 2 | Reminders in the customer's language | The shopkeeper approves a polite message in Bengali, Hindi or English and sends it through a `wa.me` link, with no WhatsApp API | Innovation & UX | Live: tap, approve, WhatsApp opens with the message filled in |
| 3 | Credit trust score | Repayment history per customer drives the reminders and a simple score; this data is the long-term moat for supplier credit or lending | Technical Execution, Business & Finance | A customer list with scores built from pilot data |
| 4 | Speak once, ledger and stock update | Mixed Bengali, Hindi and English speech becomes a structured entry, with spoken item names matched to the shop's own item list, and the same entry updates the stock count. Whether rivals handle Bengali well is unverified | Innovation & UX | Live voice demo, one transcript error and its fix |
| 5 | Field-proven evidence | 10 or more interviews, a 3 to 5 shop pilot, and a measured cost per entry shown in the video | Business & Finance, Communication | Interview counts and quotes, pilot usage, cost per entry |

**What we claim and do not claim:** we claim a working product with measured pilot results. We do not claim recovered money, a market size, a user count or accuracy figures we have not measured. Two days of pilot will likely show reminders sent and replies, not money recovered.

## Why judges should choose us

We win a criterion only if the video shows evidence for it, so each 25% block has a specific thing we must put on screen.

| Criterion | Evidence we must show | Place in the video |
| --- | --- | --- |
| Technical Execution | Public URL working live; the speech adapter code; a real transcript with one error handled; the trust score rules on screen | Demo and build walkthrough |
| Innovation & UX | A shopkeeper (or a first-time user) speaks a credit sale, sees the stock count change, then sends a reminder in two taps | Demo |
| Business & Finance | Pricing, measured cost per entry, pilot numbers: credit logged, reminders sent, replies | Business segment |
| Communication | A real shopkeeper quote about unpaid credit in the first 40 seconds; each of the four required points covered in order | Whole video |

**5-minute video script**

1. **0:00 to 0:40, problem:** a shopkeeper quote about unpaid credit, then the count from your interviews.
2. **0:40 to 2:30, demo:** speak a credit sale live, show who owes what, the stock count updating and the trust score, then send a reminder; show the storefront and restock message only if built.
3. **2:30 to 3:30, build:** the architecture drawing, the adapter code, the stack.
4. **3:30 to 4:30, business:** who pays, how much, cost per entry, pilot results such as reminders sent and replies.
5. **4:30 to 5:00, scalability and close:** separate data per shop, swappable speech provider, what you build next.

Record a clean backup take of the demo before recording the final video, in case the speech service is slow on the day.

## APIs and tech we use

The one government API we use is **Bhashini** for speech-to-text. Its [official docs](https://dibd-bhashini.gitbook.io/bhashini-apis/overall-understanding-of-the-api-calls.md) limit free use to proof of concept, which covers this hackathon but not a paid launch. Setup steps and the architecture drawing are in the [earlier research doc](https://claude.ai/code/artifact/35f68f7e-0c09-426b-a20b-2214676e25c5).

| Part | Choice | Limits and notes |
| --- | --- | --- |
| Speech to text | Bhashini ASR, via a config call then a compute call | Needs registration, a User ID and an API key; rate limits and approval time unverified. Keep the key on the server |
| Speech fallback | Browser speech recognition, or another provider behind the same adapter | A community library lists Sarvam AI and local faster-whisper as alternatives ([listing](https://pypi.org/project/indic-language-utils/)); check Bengali support yourself |
| Entry parsing | An LLM API with the shop's item list in the prompt | Speech models write English words in the native script ([example](https://pypi.org/project/codemix-restore-shunyalabs/)), so the LLM maps them to items. Commercial LLM APIs can hit rate or cost caps during a demo ([HackerEarth](https://webflow.hackerearth.com/blog/top-hackathon-ideas)) |
| Database and hosting | Supabase and Vercel, suggested and untested | Confirm current free-tier limits before relying on them |
| Reminders and supplier messages | A `wa.me` link, no WhatsApp API | Opens the shopkeeper's own WhatsApp with the text filled in |
| API Setu (optional, later) | GSTIN check for supplier onboarding | Needs registration and approvals I could not verify; leave it out of the 4-day build ([API Setu](https://docs.apisetu.gov.in/document-central/explore-apisetu/Overview.html)) |

**Credit in the product:** add a footer line "Speech by Bhashini". It is honest and shows judges you know the ecosystem.

## Business model and scalability

Shops use the ledger free; we earn from a paid tier that adds reminders and the trust score, and every number in the video must come from our own interviews and measurements. I have no verified market data, so none is quoted here.

| Revenue stream | How it works | Status |
| --- | --- | --- |
| Pro subscription | Reminders, trust score, inventory reports and low-stock alerts for a low monthly price | Price to be set from interview answers |
| Credit services (later) | Use the trust score for supplier credit or lending referrals | Long-term; regulated, so needs a licensed partner |
| Supplier commission (secondary) | A small share of orders the restock message routes to suppliers | Assumption; test with suppliers in the pilot |

Do not plan to charge a fee on UPI payments; as far as I know UPI is zero-fee for merchants, so verify before building a model on it.

**Monthly contribution per shop:**

```latex
\text{subscription} + \text{commission} - (\text{entries} \times \text{cost per entry}) - \text{hosting share}
```

**What to measure by Wed Oct 14 for the video:**

- Cost per voice entry: speech call plus LLM call, from your actual usage logs.
- Entries per shop per day in the pilot.
- Share of spoken entries recorded correctly, from your 20-sentence test.
- Items tracked per shop, and how often the app's stock count matched a physical count.
- Reminders sent in the pilot and how many customers replied or paid afterward.
- How many interviewed shopkeepers said they would pay, and how much.

**Scalability answer for the video:**

- Each shop's data is kept separate in the database.
- The speech provider can be swapped in one place, so one service's limit or outage is not the product's limit.
- Cost per entry is measured, so growth cost is known.

## Risks and honest gaps

The research has real gaps, and the biggest competitive risk is that voice-first ideas for Indian users are already common.

| Gap or risk | What it means | Action |
| --- | --- | --- |
| No winners list for this hackathon | Winner patterns come from other events, so they are a guide, not a guarantee | Check the Project gallery tonight for similar entries |
| Overlapping idea | ClearBooks AI, another student project, records shop sales by voice note and photo | Lead with repaid credit, reminders, trust score and pilot evidence; read how ClearBooks differs before recording |
| Repayment cannot be proven in two days | A short pilot will show reminders sent and replies, not recovered money | Claim only what is measured; present recovery as the next step |
| Competitor claims unchecked | I did not verify whether Khatabook, OkCredit or others offer voice entry or reminders today | Look them up and state the difference accurately in the video |
| Bhashini limits unknown | Rate limits, approval time and Bengali accuracy are unverified | Request the key tonight; run the 20-sentence test Monday; keep the adapter swappable |
| PoC-only terms | Free use ends at production or when charging users | Say "free for the pilot" and show measured costs |
| Judge unknown | Only one judge is listed and I did not research him | Look him up and tune the pitch |
| Scope | Voice, inventory, reminders and the score in four days is tight, so inventory is a simple version | Cut from the bottom of the feature table |
| Eligibility and rules | Ages 13 to 22, students only; full rules not read in detail | Read the full rules tonight, including AI-tool and build-period clauses |

No report can guarantee a win. What it can do is make sure each of the four scoring blocks has visible evidence in your video.

## Sources

Opened in full: the first three pages. Everything else is a search excerpt, so confirm details on the original page. Researched Oct 11, 2026.

- [Zero to One Hackathon winners (Convex)](https://stack.convex.dev/hacakthon-winners-winter-2024)
- [LaunchPie winner interview (Convex)](https://stack.convex.dev/launchpie-hackathon-winner)
- [Bhashini API docs: overall understanding of the API calls](https://dibd-bhashini.gitbook.io/bhashini-apis/overall-understanding-of-the-api-calls.md)
- [Convex V2 hackathon summary (Plushcap)](https://www.plushcap.com/companies/convex/blog/summaries/2024/09)
- [AI for Bharat winners (YourStory)](https://yourstory.com/2026/06/crop-insurance-conversational-analytics-ai-for-bharat-hackathon) and [IIIT-Delhi press note](https://www.iiitd.ac.in/sites/default/files/docs/pressreleases/2026/AWS%20Hackathon%20press%20note_iiitd-April%202026.pdf)
- [VoiceGuru at Build for Bengaluru](https://sode-edu.in/smvitm/news-2/news/from-idea-to-impact-smvitm-wins-at-build-for-bengaluru-hackathon/)
- [ClearBooks AI participant post (LinkedIn)](https://in.linkedin.com/in/tanu02)
- Judging guides: [HackerEarth](https://www.hackerearth.com/blog/10-tips-win-hackathon), [Reskilll criteria](https://blogs.reskilll.com/what-hackathon-judges-look-for-complete-judging-criteria-breakdown-2026/), [Reskilll winning guide](https://reskilll.com/blogs/how-to-win-a-hackathon-in-2026-reskillls-guide-from-5000-events/), [Masai AI hackathon guide](https://www.masaischool.com/blog/how-to-win-an-ai-hackathon-in-2026-full-guide/), [hackathon veteran tips](https://hashnode.com/posts/hackathon-presenter-tips/5cff461610f45faf781985ff/comment/5d02c1e1a2d0bd102e98f3d9), [common mistakes](https://www.placementpreparation.io/blog/?p=17721)
- [API Setu overview](https://docs.apisetu.gov.in/document-central/explore-apisetu/Overview.html), [indic-language-utils](https://pypi.org/project/indic-language-utils/), [codemix-restore](https://pypi.org/project/codemix-restore-shunyalabs/)
- Hackathon rules and rubric: the Next Founders Hackathon Devpost page you shared
