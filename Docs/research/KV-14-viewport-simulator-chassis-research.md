# Firecrawl Deep Research: Responsive Dual-Mode Viewport Simulator & Hardware Chassis Architecture

**Document ID:** `RESEARCH-KV-14-VIEWPORT-SIMULATOR-CHASSIS`  
**Target Ticket:** [KV-14-dual-mode-viewport-simulator.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/Docs/Tickets/KV-14-dual-mode-viewport-simulator.md)  
**Agent Directive:** `/firecrawl` Primary Source Investigation & Specification  
**Primary Sources:**
- W3C CSS Container Queries Level 3: [w3.org/TR/css-contain-3](https://www.w3.org/TR/css-contain-3/)
- CSS-Tricks & Modern Device Mockup Specifications
- Next.js 14 App Router Hydration Boundaries
- Zustand v5 State Synchronization (`zustand@^5.0.15`)
**Status:** Approved & Formally Specified

---

## 1. Architectural Role & Objective

KhataVoice must demonstrate two distinct user experiences to the hackathon judge (Ekansh Jain):
1. **"📱 Kirana Mobile Handset" Mode:** Simulates an authentic Android/iOS smartphone ($390\text{px} \times 844\text{px}$) with realistic bezels, dynamic camera notch, status bar, and bottom home bar. This demonstrates the authentic in-store reality of a Kirana shopkeeper (1-tap mic, oversized buttons, vernacular typography).
2. **"💻 Desktop Command Center" Mode:** Expands into a widescreen multi-column operations dashboard featuring real-time event logs, inventory analytics, and customer debt ledgers.

### Core Challenges to Solve:
- **Zero Layout Shifts & Zero State Drift:** Switching between modes must preserve all live store state (e.g. loaded customers, active transcript, inventory) without unmounting or re-fetching.
- **Physical Mobile Browser Compatibility:** If a user opens the web app on an actual mobile device, the phone mockup must NOT clip or cause horizontal scrolling. It must gracefully collapse outer bezels and fill $100\%$ width.
- **Pure CSS Hardware Accents:** Zero external images or heavy assets; 100% vector CSS with `box-shadow` layering and squircle radii.
- **CSS Container Queries (`container-type: inline-size`):** All components rendered inside the handset adapt to the container's physical width rather than the browser window viewport.

---

## 2. Research Findings: CSS Container Queries & Pure CSS Chassis

### 2.1 Container Queries vs Media Queries
Using `@container (max-width: ...)` on `.phoneChassis` ensures that whether the phone frame is displayed on a 4K monitor, a laptop, or an iPad, internal components scale relative to the simulated screen width (typically $390\text{px}$), avoiding media-query breakpoint breakage.

### 2.2 Modern Pure CSS Hardware Specification
```css
.phoneChassis {
  --phone-width: min(390px, 94vw);
  --phone-height: min(844px, 86vh);

  position: relative;
  width: var(--phone-width);
  height: var(--phone-height);
  background: #18181b;
  border-radius: 48px;
  padding: 10px;
  box-shadow: 
    0 0 0 2px #27272a,
    0 0 0 4px #09090b,
    0 25px 60px -15px rgba(0, 0, 0, 0.75),
    inset 0 0 0 2px rgba(255, 255, 255, 0.08);
  container-type: inline-size;
  container-name: phone;
  display: flex;
  flex-direction: column;
}
```

### 2.3 Responsive Adaptation on Small Real Devices
```css
@media (max-width: 640px) {
  .phoneChassis {
    width: 100%;
    height: 100%;
    border-radius: 0;
    padding: 0;
    box-shadow: none;
    border: none;
  }
  .dynamicNotch,
  .sideButtons,
  .homeIndicator {
    display: none;
  }
}
```

---

## 3. Zustand v5 State Coordination

The top bar binds directly to [useAppStore.ts](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/src/lib/store/useAppStore.ts) using `useShallow`:
```typescript
const { viewportMode, setViewportMode, language, setLanguage, activeScreen, setActiveScreen } = useAppStore(
  useShallow((s) => ({
    viewportMode: s.viewportMode,
    setViewportMode: s.setViewportMode,
    language: s.language,
    setLanguage: s.setLanguage,
    activeScreen: s.activeScreen,
    setActiveScreen: s.setActiveScreen,
  }))
);
```

---

## 4. Component Structure & Assembly Plan

1. **`src/components/layout/simulator.module.css`:**
   - Styling for `.wrapper`, `.phoneChassis`, `.screenFrame`, `.notch`, `.statusBar`, `.homeBar`, and `.desktopContainer`.
2. **`src/components/layout/TopBar.tsx`:**
   - Brand logo & Vernacular Tagline.
   - Mode Switcher Pill (`[📱 Mobile View] | [💻 Desktop Command Center]`).
   - Vernacular Language Selector (`বাংলা`, `हिन्दी`, `English`).
   - Quick Action: `⚖️ Judge Economics Tour`.
3. **`src/components/layout/ViewportSimulator.tsx`:**
   - Client Component wrapper (`"use client"`).
   - Renders `TopBar` at the top.
   - Conditionally renders phone frame or desktop grid based on `viewportMode`.
4. **`src/app/page.tsx`:**
   - Integrates `ViewportSimulator` with live initial server data.
