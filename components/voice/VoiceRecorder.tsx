'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, RotateCcw } from 'lucide-react';


interface Props {
  onTranscript: (transcript: string, duration: number) => void;
  prompt?: string;
}

type RecordState = 'idle' | 'recording' | 'done' | 'unsupported';

export function VoiceRecorder({ onTranscript, prompt }: Props) {
  const [state, setState] = useState<RecordState>('idle');
  const [transcript, setTranscript] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fullTranscriptRef = useRef<string>('');

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) setState('unsupported');
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    recognitionRef.current?.stop();
  }, []);

  function startRecording() {
    setError('');
    setTranscript('');
    fullTranscriptRef.current = '';
    setElapsed(0);

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = fullTranscriptRef.current;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + ' ';
          fullTranscriptRef.current = final;
        } else {
          interim = event.results[i][0].transcript;
        }
      }
      setTranscript(final + interim);
    };

    recognition.onerror = (event: Event) => {
      const errEvent = event as Event & { error?: string };
      if (errEvent.error !== 'no-speech') {
        setError(`Microphone error: ${errEvent.error ?? 'unknown'}. Please try again.`);
        stopRecording();
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    startTimeRef.current = Date.now();
    setState('recording');

    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const finalText = fullTranscriptRef.current.trim();
    setState('done');
    if (finalText) {
      onTranscript(finalText, duration);
    }
  }

  function reset() {
    recognitionRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setTranscript('');
    fullTranscriptRef.current = '';
    setElapsed(0);
    setState('idle');
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (state === 'unsupported') {
    return (
      <div className="rounded-2xl border border-amber-800/40 bg-amber-900/10 p-6 text-center">
        <p className="text-amber-400 text-sm font-medium">Speech recognition not supported</p>
        <p className="text-slate-400 text-xs mt-1">
          Please use Chrome or Edge. You can also type your transcript directly below.
        </p>
      </div>
    );
  }

  if (state === 'done' && transcript) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-emerald-800/30 bg-emerald-900/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Transcript captured</p>
            <span className="text-xs text-slate-500">{elapsed}s recorded</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{transcript}</p>
        </div>
        <Button variant="outline" onClick={reset} className="w-full gap-2">
          <RotateCcw size={16} /> Record Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {prompt && (
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Speak about this:</p>
          <p className="text-slate-300 text-sm italic">"{prompt}"</p>
        </div>
      )}

      <div className="flex flex-col items-center py-8 gap-4">
        {state === 'recording' && (
          <div className="text-center mb-2">
            <p className="text-4xl font-mono font-bold text-white tabular-nums">
              {formatTime(elapsed)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Recording...</p>
          </div>
        )}

        {state === 'recording' ? (
          <button
            onClick={stopRecording}
            className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center recording-pulse transition-colors"
          >
            <Square size={28} fill="white" className="text-white" />
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="w-20 h-20 rounded-full bg-violet-600 hover:bg-violet-700 flex items-center justify-center transition-colors shadow-lg"
          >
            <Mic size={32} className="text-white" />
          </button>
        )}

        <p className="text-sm text-slate-400">
          {state === 'recording' ? 'Tap to stop' : 'Tap to start recording'}
        </p>
      </div>

      {state === 'recording' && transcript && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 max-h-32 overflow-y-auto">
          <p className="text-slate-400 text-xs leading-relaxed">{transcript}</p>
        </div>
      )}

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}
    </div>
  );
}
