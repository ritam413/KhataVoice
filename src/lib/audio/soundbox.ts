/**
 * Indian Retail Soundbox Simulator (Paytm / PhonePe audio box style).
 * Combines a high-fidelity synthetic Web Audio payment chime with
 * multilingual Web Speech Synthesis (Bengali, Hindi, English).
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays a cheerful dual-harmonic retail payment chime using Web Audio API.
 * Frequency progression: 587.33Hz (D5) -> 880Hz (A5) -> 1174.66Hz (D6) with warm bell decay.
 */
export function playSoundboxChime(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) {
        resolve();
        return;
      }

      const now = ctx.currentTime;
      const notes = [
        { freq: 587.33, start: 0, duration: 0.12 },
        { freq: 880.0, start: 0.1, duration: 0.18 },
        { freq: 1174.66, start: 0.22, duration: 0.4 },
      ];

      notes.forEach(({ freq, start, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle'; // Warm, bell-like tone
        osc.frequency.setValueAtTime(freq, now + start);

        // Bell envelope: instant attack, exponential decay
        gain.gain.setValueAtTime(0.001, now + start);
        gain.gain.linearRampToValueAtTime(0.28, now + start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + start);
        osc.stop(now + start + duration);
      });

      setTimeout(resolve, 650);
    } catch {
      resolve();
    }
  });
}

/**
 * Vernacular Soundbox Text-to-Speech confirmation using Web Speech Synthesis.
 */
export function speakSoundboxConfirmation(
  customerName: string,
  amount: number,
  language: 'bn' | 'hi' | 'en'
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  // Format message based on language
  let message = '';
  let langCode = 'bn-IN';

  if (language === 'bn') {
    message = `${customerName}: ${amount} টাকা বাকি সেভ হয়েছে`;
    langCode = 'bn-IN';
  } else if (language === 'hi') {
    message = `${customerName}: ${amount} रुपये उधार दर्ज हो गया`;
    langCode = 'hi-IN';
  } else {
    message = `${customerName}: ${amount} rupees udhaar recorded`;
    langCode = 'en-IN';
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = langCode;
    utterance.rate = 1.05; // Lively retail pacing
    utterance.pitch = 1.0;

    // Pick a voice matching language if available
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) => v.lang.startsWith(language));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // Graceful degradation on unsupported browser TTS
  }
}

/**
 * Full Soundbox execution: chime first, followed immediately by vernacular voice confirmation.
 */
export async function triggerSoundboxSuccess(
  customerName: string,
  amount: number,
  language: 'bn' | 'hi' | 'en'
): Promise<void> {
  await playSoundboxChime();
  speakSoundboxConfirmation(customerName, amount, language);
}
