# KV-06: Real-Time Audio Waveform Canvas Visualizer with Strict Lifecycle Cleanup

- **Epic:** Epic 2: Multilingual Speech & NLP Engine
- **Priority:** P1
- **Story Points:** 3 SP
- **Upstream Dependencies:** KV-04
- **Downstream Blockers:** KV-15
- **Target Files:**
  - `src/components/audio/WaveformVisualizer.tsx`
  - `src/components/audio/waveform.module.css`

---

## 1. Architectural Role & Objective
Build an ultra-responsive HTML5 Canvas audio waveform visualizer that renders live audio frequency oscillations when the shopkeeper speaks into the microphone, and a smooth pulsing synthetic sine wave when listening in preset mode. Satisfies the hackathon requirement for "wow-factor" visual polish and immediate sensory feedback.

---

## 2. Input Contract & Pre-Conditions
- Props:
  - `isRecording: boolean`
  - `stream?: MediaStream | null`
  - `accentColor?: string` (defaults to saffron `#FF7700`)
  - `barCount?: number` (defaults to 32)
  - `height?: number` (defaults to 80)

---

## 3. State Invariants & Hardening Guards
- **Adversarial Review Hardening (Memory & Thread Leak Prevention):** Repeated opening and closing of the voice modal must NOT leak Web Audio threads or browser animation frames. The React `useEffect` cleanup handler **must** explicitly call:
  ```typescript
  if (animationFrameIdRef.current) {
    cancelAnimationFrame(animationFrameIdRef.current);
  }
  if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
    audioContextRef.current.close();
  }
  ```
- **Synthetic Animation Fallback:** If `stream` is null (e.g. preset demo mode or mock mode), render a dynamic aesthetic sine wave pulse so the visualizer never appears frozen while `isRecording` is true.

---

## 4. Implementation Details

### 4.1 Audio Analysis Setup
- Use `AudioContext` and `AnalyserNode` with `fftSize = 64` or `128`.
- Extract `Uint8Array` byte frequency data using `analyser.getByteFrequencyData(dataArray)`.
- Render symmetric vertical bars with rounded caps using `ctx.roundRect()` or arc calculations.
- Use saffron-to-gold gradient fill (`createLinearGradient`).

### 4.2 Cleanup Lifecycle Pattern
```typescript
useEffect(() => {
  if (!isRecording) return;

  let audioContext: AudioContext | null = null;
  let animationFrameId: number;

  try {
    if (stream) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      // animate loop...
    } else {
      // synthetic sine wave animation loop...
    }
  } catch (err) {
    console.error('AudioContext init error:', err);
  }

  return () => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().catch(() => {});
    }
  };
}, [isRecording, stream]);
```

---

## 5. Behavior-Driven Specification (Given / When / Then)

### Scenario 1: Modal Unmount Cleanup
- **Given:** The user taps the mic button, visualizer activates, and user rapidly closes the modal.
- **When:** `WaveformVisualizer` unmounts.
- **Then:** `cancelAnimationFrame` and `audioContext.close()` fire immediately, releasing the browser audio hardware without console warnings.

### Scenario 2: Active Spoken Input Oscillation
- **Given:** Microphone stream receives vocal input above $-40\text{dB}$.
- **When:** Frequency bars render on the canvas.
- **Then:** Waveform bars scale dynamically from $4\text{px}$ to $70\text{px}$ in height in real-time ($60\text{fps}$).

---

## 6. Automated Verification Gates
```bash
# Verify component syntax and absence of missing cleanup calls
node -e "const fs = require('fs'); const code = fs.readFileSync('src/components/audio/WaveformVisualizer.tsx', 'utf8'); console.assert(code.includes('cancelAnimationFrame') && code.includes('close()'), 'Missing cleanup');"
```
