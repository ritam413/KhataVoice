import { Language } from '@/types/domain';
import { WebSpeechController, WebSpeechOptions } from '@/types/speech';

/**
 * Maps application language code to standard Indian BCP-47 locale.
 */
export function mapLanguageToLocale(lang: Language): string {
  switch (lang) {
    case 'bn':
      return 'bn-IN';
    case 'hi':
      return 'hi-IN';
    case 'en':
    default:
      return 'en-IN';
  }
}

/**
 * Checks whether the current environment supports Web Speech API.
 * Safe to execute during Next.js SSR.
 */
export function isWebSpeechSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };
  return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
}

/**
 * Strict hardware microphone track cleanup.
 * Iterates all audio tracks and halts them immediately to extinguish
 * the browser's active recording indicator (red dot on tab).
 */
export function stopMediaStream(stream?: MediaStream | null): void {
  if (!stream) return;
  try {
    stream.getTracks().forEach((track) => {
      if (track && typeof track.stop === 'function') {
        track.stop();
      }
    });
  } catch (error) {
    console.warn('[WebSpeech] Warning while cleaning up audio tracks:', error);
  }
}

// Internal browser SpeechRecognition typings
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [altIndex: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

/**
 * Factory for creating a robust Web Speech API recognition controller.
 */
export function createWebSpeechRecognizer(options: WebSpeechOptions): WebSpeechController {
  if (!isWebSpeechSupported()) {
    return {
      start: () => {
        options.listeners?.onError?.(
          new Error('Web Speech API is not supported in this browser environment.'),
          'UNSUPPORTED_BROWSER'
        );
      },
      stop: () => {},
      abort: () => {},
      isListening: () => false,
      isSupported: false
    };
  }

  const win = window as unknown as {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  };
  const SpeechRecognitionConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;

  if (!SpeechRecognitionConstructor) {
    return {
      start: () => {},
      stop: () => {},
      abort: () => {},
      isListening: () => false,
      isSupported: false
    };
  }

  let recognition: BrowserSpeechRecognition | null = null;
  let listening = false;

  try {
    recognition = new SpeechRecognitionConstructor();
    recognition.lang = mapLanguageToLocale(options.language);
    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = options.interimResults ?? true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      listening = true;
      options.listeners?.onStart?.();
    };

    recognition.onend = () => {
      listening = false;
      options.listeners?.onEnd?.();
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      listening = false;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        options.listeners?.onError?.(
          new Error(
            'Microphone access was denied. Please allow microphone permissions or select one of the 1-Click Audio Sample Presets.'
          ),
          'MICROPHONE_PERMISSION_DENIED'
        );
      } else {
        options.listeners?.onError?.(
          new Error(`Speech recognition error: ${event.error}`),
          event.error
        );
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';
      let finalConfidence = 0.95;

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result && result[0]) {
          const piece = result[0].transcript;
          if (result.isFinal) {
            finalTranscript += piece;
            finalConfidence = result[0].confidence || 0.95;
          } else {
            interimTranscript += piece;
          }
        }
      }

      if (interimTranscript && options.listeners?.onInterim) {
        options.listeners.onInterim(interimTranscript);
      }

      if (finalTranscript && options.listeners?.onFinal) {
        options.listeners.onFinal(finalTranscript, finalConfidence);
      }
    };
  } catch (err) {
    console.error('[WebSpeech] Initialization failed:', err);
  }

  return {
    start: () => {
      if (!recognition) return;
      if (listening) {
        try {
          recognition.abort();
        } catch {}
      }
      try {
        recognition.lang = mapLanguageToLocale(options.language);
        recognition.start();
      } catch (err) {
        options.listeners?.onError?.(
          err instanceof Error ? err : new Error('Failed to start speech recognition'),
          'START_FAILED'
        );
      }
    },
    stop: () => {
      if (!recognition || !listening) return;
      try {
        recognition.stop();
      } catch {}
    },
    abort: () => {
      if (!recognition) return;
      try {
        recognition.abort();
      } catch {}
    },
    isListening: () => listening,
    isSupported: true
  };
}
