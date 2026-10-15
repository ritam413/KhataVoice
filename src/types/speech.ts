import { Language, TransactionType } from './domain';

export type { Language, TransactionType };

export type SpeechSource = 'web_speech' | 'bhashini' | 'preset';

export interface SpeechTranscriptionResult {
  transcript: string;
  language: Language;
  confidence: number;
  source: SpeechSource;
  durationMs: number;
  interim?: boolean;
}

export interface PresetExpectedEntities {
  customerName?: string;
  transactionType: TransactionType;
  amount?: number;
  items?: Array<{
    name: string;
    quantity: number;
    unit?: string;
    price?: number;
  }>;
}

export interface AudioPreset {
  id: string;
  title: string;
  description: string;
  language: Language;
  transcript: string;
  englishTranslation: string;
  expectedEntities: PresetExpectedEntities;
  durationMs: number;
  audioDataUri?: string;
}

export interface TranscribeAudioInput {
  blob?: Blob;
  audioBase64?: string;
  presetId?: string;
  language: Language;
  mimeType?: string;
}

export interface WebSpeechListener {
  onInterim?: (partialTranscript: string) => void;
  onFinal?: (finalTranscript: string, confidence: number) => void;
  onError?: (error: Error | string, code?: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export interface WebSpeechOptions {
  language: Language;
  continuous?: boolean;
  interimResults?: boolean;
  listeners?: WebSpeechListener;
}

export interface WebSpeechController {
  start: () => void;
  stop: () => void;
  abort: () => void;
  isListening: () => boolean;
  isSupported: boolean;
}

export interface SpeechCapabilities {
  hasWebSpeech: boolean;
  hasBhashiniConfigured: boolean;
  hasPresets: boolean;
  defaultTier: SpeechSource;
}
