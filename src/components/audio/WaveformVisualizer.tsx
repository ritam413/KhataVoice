'use client';

import React, { useEffect, useRef } from 'react';
import styles from './waveform.module.css';

export interface WaveformVisualizerProps {
  /**
   * Whether the audio capture session is active.
   */
  isRecording: boolean;
  /**
   * Optional live MediaStream from navigator.mediaDevices.getUserMedia.
   * If null/undefined while isRecording is true, the visualizer automatically
   * falls back to a smooth synthetic sine wave pulse.
   */
  stream?: MediaStream | null;
  /**
   * Primary bar gradient start color.
   * @default '#FF7700' (Bharat Modern Saffron)
   */
  accentColor?: string;
  /**
   * Secondary bar gradient end color.
   * @default '#FFB800' (Gold)
   */
  secondaryColor?: string;
  /**
   * Number of symmetric frequency bars to render.
   * @default 32
   */
  barCount?: number;
  /**
   * Visualizer height in CSS pixels.
   * @default 80
   */
  height?: number;
  /**
   * Force synthetic animation mode (useful for demo/preset replay).
   */
  demo?: boolean;
  /**
   * Additional custom CSS classes.
   */
  className?: string;
}

/**
 * Draws a rounded vertical bar with fallback support for older browsers
 * lacking CanvasRenderingContext2D.prototype.roundRect.
 */
function drawRoundedBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, r);
    ctx.fill();
  } else {
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

/**
 * Real-Time Audio Waveform Canvas Visualizer with Strict Lifecycle Cleanup
 *
 * Implements the ElevenLabs-inspired conversational voice agent visualization
 * architecture, supporting live Web Audio AnalyserNode frequency analysis and
 * organic synthetic sine-wave pulse fallback when streaming 1-click Kirana audio presets.
 */
export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isRecording,
  stream,
  accentColor = '#FF7700',
  secondaryColor = '#FFB800',
  barCount = 32,
  height = 80,
  demo = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // References for strict lifecycle cleanup & leak prevention
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Local cleanup trackers
    let isCancelled = false;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array<ArrayBuffer> | null = null;

    // Smoothed bar heights array for fluid 60fps decay physics
    const currentHeights: number[] = new Array(barCount).fill(4);

    // Dynamic width tracking via container
    let containerWidth = container.clientWidth || 320;

    const handleResize = () => {
      if (!container || !canvas || !ctx) return;
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      containerWidth = container.clientWidth || 320;

      canvas.width = Math.floor(containerWidth * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    handleResize();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            handleResize();
          })
        : null;

    if (resizeObserver && container) {
      resizeObserver.observe(container);
    }

    // Audio Graph Initialization
    const useLiveAudio = isRecording && !demo && stream;

    if (useLiveAudio) {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

        if (AudioContextClass) {
          audioContext = new AudioContextClass();
          audioContextRef.current = audioContext;

          if (audioContext.state === 'suspended') {
            audioContext.resume().catch(() => {});
          }

          const source = audioContext.createMediaStreamSource(stream);
          analyser = audioContext.createAnalyser();

          // fftSize = 64 produces 32 frequency bins (frequencyBinCount = fftSize / 2)
          analyser.fftSize = Math.max(32, Math.min(2048, barCount * 2));
          analyser.smoothingTimeConstant = 0.8;
          analyser.minDecibels = -90;
          analyser.maxDecibels = -25;

          // Connect source -> analyser ONLY. Do NOT connect to destination (prevents feedback scream).
          source.connect(analyser);

          dataArray = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
        }
      } catch (err) {
        console.warn('[WaveformVisualizer] Failed to initialize AudioContext:', err);
      }
    }

    // Animation Render Loop
    let phase = 0;

    const render = () => {
      if (isCancelled) return;

      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const w = containerWidth;
      const h = height;

      ctx.clearRect(0, 0, w, h);

      // Pre-create Saffron-to-Gold linear gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, accentColor);
      gradient.addColorStop(1, secondaryColor);
      ctx.fillStyle = gradient;

      const totalBars = barCount;
      const minBarHeight = 4;
      const maxBarHeight = h - 12;

      // Calculate bar widths and responsive spacing
      const availableWidth = w - 16; // 8px horizontal padding
      const gapRatio = 0.35;
      const slotWidth = availableWidth / totalBars;
      const barWidth = Math.max(2, Math.min(6, slotWidth * (1 - gapRatio)));
      const actualGap = (availableWidth - barWidth * totalBars) / (totalBars - 1 || 1);
      const startX = 8;
      const centerY = h / 2;

      phase += 0.06;

      for (let i = 0; i < totalBars; i++) {
        let targetHeight = minBarHeight;

        if (isRecording) {
          if (analyser && dataArray) {
            // Live Mic Mode: Read frequency bin
            analyser.getByteFrequencyData(dataArray);
            const dataIndex = Math.floor((i / totalBars) * dataArray.length);
            const value = dataArray[dataIndex] || 0;
            const normalized = Math.min(1, Math.max(0, value / 255));
            targetHeight = minBarHeight + normalized * (maxBarHeight - minBarHeight);
          } else {
            // Synthetic Sine Wave Fallback Mode (Demo / Preset Mode)
            const normalizedIndex = i / totalBars;
            const wave1 = Math.sin(normalizedIndex * Math.PI * 3 + phase);
            const wave2 = Math.cos(normalizedIndex * Math.PI * 5 - phase * 0.7);
            const combined = Math.abs(wave1 * 0.6 + wave2 * 0.4);
            targetHeight = minBarHeight + combined * (maxBarHeight - minBarHeight);
          }
        } else {
          // Idle state: resting pills
          targetHeight = minBarHeight;
        }

        // Apply smooth exponential dampening physics
        currentHeights[i] += (targetHeight - currentHeights[i]) * 0.28;
        const currentBarH = Math.max(minBarHeight, Math.min(maxBarHeight, currentHeights[i]));

        const x = startX + i * (barWidth + actualGap);
        // Center-align vertically for balanced symmetric oscillation
        const y = centerY - currentBarH / 2;

        ctx.globalAlpha = isRecording ? 0.95 : 0.35;
        drawRoundedBar(ctx, x, y, barWidth, currentBarH, barWidth / 2);
      }

      ctx.globalAlpha = 1.0;
      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    animationFrameIdRef.current = requestAnimationFrame(render);

    // Strict Lifecycle Cleanup: Prevents audio thread and animation frame leaks
    return () => {
      isCancelled = true;

      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }

      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
        audioContext = null;
        audioContextRef.current = null;
      }
    };
  }, [isRecording, stream, accentColor, secondaryColor, barCount, height, demo]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${isRecording ? styles.recording : ''} ${className}`}
      style={{ height: `${height}px` }}
      data-testid="waveform-visualizer"
    >
      <div className={`${styles.ambientGlow} ${isRecording ? styles.active : ''}`} />
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
};

export default WaveformVisualizer;
