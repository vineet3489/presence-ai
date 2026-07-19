'use client';

import { useState, useRef, useCallback } from 'react';

// Abstraction over browser SpeechRecognition.
// Swap the internals here when moving to a native app (AssemblyAI / Whisper).

export interface TranscriptionHook {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  reset: () => void;
}

export function useTranscription(): TranscriptionHook {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const SR = (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
               (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.addEventListener('start', () => {
      setIsListening(true);
      setError(null);
    });

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalPart = '';
      let interimPart = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalPart += result[0].transcript;
        } else {
          interimPart += result[0].transcript;
        }
      }

      if (finalPart) {
        setTranscript((prev) => (prev ? prev + ' ' + finalPart.trim() : finalPart.trim()));
      }
      setInterimTranscript(interimPart);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error !== 'aborted') {
        setError(`Mic error: ${event.error ?? 'unknown'}. Check browser permissions.`);
      }
      setIsListening(false);
      setInterimTranscript('');
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const reset = useCallback(() => {
    stopListening();
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, [stopListening]);

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    reset,
  };
}

// Text-to-speech helper — wraps speechSynthesis for easy use
export function speak(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  // Prefer a natural-sounding voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find((v) =>
    v.name.includes('Samantha') || v.name.includes('Google US English') || v.lang === 'en-US'
  );
  if (preferred) utterance.voice = preferred;
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
}
