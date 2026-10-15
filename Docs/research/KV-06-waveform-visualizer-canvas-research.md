# Deep Research Report: KV-06 Real-Time Audio Waveform Canvas Visualizer with Strict Lifecycle Cleanup

**Ticket:** [KV-06-waveform-visualizer-canvas.md](file:///c:/CCodes_WebDevelopment/hckthon/Next%20Founders/Docs/Tickets/KV-06-waveform-visualizer-canvas.md)  
**Epic:** Epic 2: Multilingual Speech & NLP Engine  
**Priority:** P1  
**Story Points:** 3 SP  
**Persona:** `wshobson-agents` (ROLE: DEVELOPER)  
**Discipline:** `/ponytail` (YAGNI, stdlib-first, zero runtime bloat) & `/firecrawl` (Official W3C / MDN Specs)  
**Date:** 2026-10-14  

---

## 1. Executive Summary & Architectural Role

KhataVoice is built for 13–15 million Indian Kirana shopkeepers. In loud, chaotic storefront environments, visual feedback during speech recording is not merely decorative—it is a critical sensory confirmation that the application is actively listening and receiving acoustic energy.

For the Next Founders Hackathon (judged by Ekansh Jain, Co-Founder of LUMA), UI polish and responsive sensory feedback contribute directly to the "Innovation & UX" (25%) and "Technical Execution" (25%) judging criteria. A frozen visualizer or delayed UI response creates user anxiety and degrades demo confidence.

Ticket **KV-06** implements an ultra-responsive, 60fps HTML5 Canvas waveform visualizer with:
1. **Live Microphone Frequency Analysis:** Direct Web Audio API `AudioContext` and `AnalyserNode` frequency spectrum binding.
2. **Synthetic Pulsing Sine Fallback:** Organic mathematical wave generation for audio sample presets and zero-permission mock modes.
3. **Adversarial Review Hardening:** Zero audio thread or animation frame leaks across rapid voice modal toggles, handling React 18 StrictMode double-mount gracefully.
4. **"Bharat Modern" Visual Craft:** High-DPI retina sharpness, saffron-to-gold linear gradients, rounded bar geometry, and fluid dampening physics.

---

## 1.1 Library Benchmark & Architectural Decision

We evaluated four industry candidates using `/firecrawl` and browser inspections against KhataVoice's Kirana mobile-first constraints:

| Candidate | Category & Footprint | Live Mic `MediaStream` | Synthetic Fallback (Preset / Zero-Mic) | Assessment & Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **`wavesurfer.js`** | Third-party npm (~85 kB + record plugin) | Supported via plugin | ❌ None (Audio buffer playback only) | **Rejected:** Overkill audio player library with scrubbars and timelines; poor fit for live voice modal capture. |
| **`audioMotion-analyzer`** | Third-party npm (~30 kB ESM) | Supported via Web Audio | ❌ Complex (Requires mock audio oscillator) | **Rejected:** Overkill DJ/DAW graphic spectrum analyzer with 240 frequency bands; imperative DOM wrapper not idiomatic to React 18. |
| **ElevenLabs `live-waveform`** | Shadcn-style Canvas CLI component (0 npm bloat) | Supported natively | ✅ Built-in `processing={true}` pulse | **Strong Contender:** Continuous oscilloscope wave; highly responsive. |
| **ElevenLabs `bar-visualizer`** | Shadcn-style Canvas/Tailwind CLI component (0 npm bloat) | Supported natively (`mediaStream`) | ✅ Built-in `demo={true}` synthetic sine pulse | 🏆 **WINNER & SELECTED:** Tailor-made for conversational AI voice agents; native synthetic demo support; 100% React lifecycle & cleanup control. |

### Architectural Decision
**Adopt the ElevenLabs UI Bar Visualizer architecture** (enhanced with High-DPI Canvas scaling and "Bharat Modern" Saffron `#FF7700` to Gold `#FFB800` linear gradients) for `WaveformVisualizer.tsx`.

---

## 2. Technical Deep Dive: Official W3C & MDN Web Audio Specifications

### 2.1 The Audio Routing Graph
```
┌─────────────────────────┐
│ MediaStream (Mic Audio) │
└────────────┬────────────┘
             │ createMediaStreamSource(stream)
             ▼
┌─────────────────────────┐
│ MediaStreamAudioSource  │
└────────────┬────────────┘
             │ connect(analyser)
             ▼
┌─────────────────────────┐
│      AnalyserNode       │ ──getByteFrequencyData(Uint8Array)──► Canvas 2D Draw Loop
│  (fftSize = 64 / 128)   │
└─────────────────────────┘
   (DO NOT connect to AudioContext.destination to prevent acoustic feedback loop)
```

### 2.2 AnalyserNode Parameters
- **`fftSize`**: Determines frequency resolution. Must be a power of 2 ($32 \le \text{fftSize} \le 32768$).
  - For voice visualizations with 32 symmetric bars, $\text{fftSize} = 64$ produces $\text{frequencyBinCount} = 32$ bins ($\text{fftSize} / 2$).
  - $\text{fftSize} = 128$ produces 64 bins, allowing higher-frequency downsampling and smoothing across speech formants ($100\text{Hz} - 4000\text{Hz}$).
- **`smoothingTimeConstant`**: Value between $0$ and $1$ (default $0.8$). Controls temporal smoothing of FFT results. Setting to $0.75 - 0.8$ produces natural vocal reactivity without jitter.
- **`minDecibels` & `maxDecibels`**: Defaults to $-100\text{dB}$ and $-30\text{dB}$. This matches typical conversational vocal amplitudes in noisy Kirana stores.

### 2.3 AudioContext Autoplay & Lifecycle Invariants
Modern Chromium and WebKit browsers enforce strict user-gesture policies:
1. If created before user gesture, `AudioContext.state` may be `'suspended'`. When recording starts, check:
   ```typescript
   if (audioContext.state === 'suspended') {
     audioContext.resume().catch((err) => console.warn('[Waveform] AudioContext resume failed:', err));
   }
   ```
2. Hardware Resource Disposal:
   - Calling `audioContext.close()` releases operating system audio thread handles.
   - Attempting to call `.close()` on an already closed context throws an `InvalidStateError`. Therefore, guard with:
   ```typescript
   if (audioContext && audioContext.state !== 'closed') {
     audioContext.close().catch(() => {});
   }
   ```

---

## 3. High-DPI Canvas Rendering & 60fps Animation Loop

### 3.1 Device Pixel Ratio (Retina Display) Sharpness
Unscaled HTML5 canvas elements appear blurry on modern smartphone displays with $\text{DPR} \ge 2.0$ or $3.0$. To guarantee crisp, razor-sharp rendering:
```typescript
const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
const displayWidth = containerWidth;
const displayHeight = height;

canvas.width = Math.floor(displayWidth * dpr);
canvas.height = Math.floor(displayHeight * dpr);
canvas.style.width = `${displayWidth}px`;
canvas.style.height = `${displayHeight}px`;

ctx.scale(dpr, dpr);
```

### 3.2 Rounded Rectangle Geometry
Modern browsers natively support `CanvasRenderingContext2D.roundRect(x, y, w, h, radii)` (Chrome 99+, Safari 16+, Firefox 112+). For maximum resilience across all environments, provide an inline fallback:
```typescript
function drawRoundedBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const r = Math.min(radius, width / 2, height / 2);
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, r);
    ctx.fill();
  } else {
    // Fallback using standard arcTo
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.arcTo(x + width, y, x + width, y + r, r);
    ctx.lineTo(x + width, y + height - r);
    ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
    ctx.lineTo(x + r, y + height);
    ctx.arcTo(x, y + height, x, y + height - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
    ctx.fill();
  }
}
```

### 3.3 Zero-GC 60fps Performance Principles
1. **Pre-allocate Buffers:** Never instantiate `new Uint8Array(...)` inside the `requestAnimationFrame` loop. Allocate once during setup.
2. **Exponential Smoothing:** Calculate interpolated bar heights using dampening:
   $$\text{height}_t = \text{height}_{t-1} + (\text{targetHeight} - \text{height}_{t-1}) \times \alpha$$
   where $\alpha = 0.25$, ensuring smooth transitions between audio frames.
3. **Single Gradient Instance:** Create the `CanvasGradient` once per resize or frame rather than per bar.

---

## 4. Synthetic Waveform Fallback Mode

When `isRecording: true` but `stream` is null or undefined (e.g., when the user selects a 1-click Kirana audio preset, tests demo mode, or runs in an emulated environment):
- The visualizer must **never** appear frozen or dead.
- It renders an undulating synthetic wave using phase-shifted sine equations:
  $$y_i(t) = \text{baseHeight} + A \cdot \left[ 0.6 \sin\left(\frac{i}{N} \cdot 3\pi + \omega_1 t\right) + 0.4 \cos\left(\frac{i}{N} \cdot 5\pi - \omega_2 t\right) \right]$$
- When `isRecording: false`, bars smoothly decay down to a resting state ($4\text{px}$ minimum height pills) with low opacity.

---

## 5. Component Props & Architecture Contract

```typescript
export interface WaveformVisualizerProps {
  /** Whether the voice capture session is actively listening */
  isRecording: boolean;
  /** Live MediaStream from navigator.mediaDevices.getUserMedia */
  stream?: MediaStream | null;
  /** Primary accent color (default: Saffron '#FF7700') */
  accentColor?: string;
  /** Secondary gradient color (default: Gold '#FFB800') */
  secondaryColor?: string;
  /** Number of symmetric vertical bars to render (default: 32) */
  barCount?: number;
  /** Visualizer canvas height in CSS pixels (default: 80) */
  height?: number;
  /** Optional custom CSS class name */
  className?: string;
}
```

---

## 6. Adversarial Review Hardening & Memory Leak Invariants

1. **AudioContext Closing:** Every initialized `AudioContext` is explicitly closed in the cleanup return handler:
   ```typescript
   if (audioContext && audioContext.state !== 'closed') {
     audioContext.close().catch(() => {});
   }
   ```
2. **Animation Frame Cancellation:** `cancelAnimationFrame(animationFrameId)` is invoked unconditionally upon unmount or `isRecording` change.
3. **ResizeObserver Cleanup:** Any `ResizeObserver` observing the container element is disconnected on unmount.
4. **React 18 StrictMode Safety:** Local scoped handles within `useEffect` guarantee that double-mount cycles clean up initial context before establishing the second, preventing orphaned background audio threads.
5. **No Audio Destination Connection:** `source.connect(analyser)` is connected, but `analyser.connect(audioContext.destination)` is **strictly avoided** to prevent loud feedback screeching through the shopkeeper's phone speaker.

---

## 7. Verification & Automated Testing Harness

The verification suite will execute:
1. Syntax & cleanup assertion gate: Checks component code contains `cancelAnimationFrame` and `close()`.
2. Static type verification: `npm.cmd run type-check` (`tsc --noEmit`) passes with 0 errors.
3. Production compilation: `npm.cmd run build` passes with zero SSR hydration errors.
4. Visual test harness: Mount and unmount cycle verification in `scripts/verify-kv06.ts`.
