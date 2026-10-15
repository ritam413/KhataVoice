# KV-22: Production Vercel Deployment, Video Pitch Assets, & Demo Rehearsal Checklist

- **Epic:** Epic 5: Judge Suite, Testing & Launch
- **Priority:** P0 (Blocker)
- **Story Points:** 3 SP
- **Upstream Dependencies:** KV-21
- **Downstream Blockers:** Complete
- **Target Files:**
  - `vercel.json`
  - `Docs/pitch_video_script.md`
  - `Docs/demo_rehearsal_checklist.md`
  - `README.md`

---

## 1. Architectural Role & Objective
Finalize production readiness and pitch delivery assets for the Next Founders Hackathon submission. Deploys the application live to Vercel with zero runtime crashes or missing environment errors. Authors the timed 5-minute video presentation script strictly mapped to the 4 judging criteria (Technical Execution 25%, Innovation & UX 25%, Business & Finance 25%, Communication 25%), and compiles a fail-safe demo rehearsal checklist.

---

## 2. Input Contract & Pre-Conditions
- All 21 prior tickets verified and passing gates.
- Public Git repository URL and Vercel project configuration.

---

## 3. State Invariants & Hardening Guards
- **Live Public URL Guarantee:** The Vercel production deployment must boot out-of-the-box in public mode without requiring visitors or judges to authenticate or enter database API credentials.
- **5-Minute Video Pitch Compliance:** Video script must be strictly structured under 5 minutes (300 seconds total):
  - 0:00 - 0:45: Problem Statement (The ₹20 Lakh Crore Kirana credit trap).
  - 0:45 - 1:30: Solution & Innovation (Voice dual-entry + Trust Score + Cultural WhatsApp recovery).
  - 1:30 - 3:15: Live Demo (Spoken entry, waveform, 4s auto-commit, Soundbox audio, desktop command center).
  - 3:15 - 4:15: Unit Economics & Business Model (Ekansh Jain rubric: ₹0.10 cost, 78% margin, 10.8x ROI).
  - 4:15 - 5:00: Architecture, Scalability & Roadmap (Bhashini, Supabase, B2B underwriting).

---

## 4. Implementation Details

### 4.1 Deployment Config (`vercel.json`)
```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "installCommand": "npm install"
}
```

### 4.2 Demo Rehearsal Checklist (`Docs/demo_rehearsal_checklist.md`)
- [ ] Confirm browser tab has audio permissions enabled or use 1-Click Audio Presets.
- [ ] Ensure volume is turned up to capture Soundbox vernacular audio confirmation chime.
- [ ] Toggle between Mobile View and Desktop Command Center to demonstrate responsiveness.
- [ ] Open WhatsApp modal and demonstrate 1-tap tone switcher.
- [ ] Open Judge Economics Simulator and demonstrate live ROI sliders.

### 4.3 Root README (`README.md`)
- Comprehensive overview with live demo link, architecture diagram, 1-line setup command, tech stack summary, and hackathon presentation guide.

---

## 5. Behavior-Driven Specification (Given / When / Then)

### Scenario 1: Vercel Production Build
- **Given:** Code committed to GitHub main branch.
- **When:** Vercel build trigger executes.
- **Then:** Build finishes with exit code 0 and deploys to production edge network.

---

## 6. Automated Verification Gates
```bash
# Verify production build and markdown assets
npm run build
test -f Docs/Tickets/README.md && echo "All tickets verified"
```
