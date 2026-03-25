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
  const displayedTranscriptRef = useRef<string>('');
  const isAbortedRef = useRef<boolean>(false);
  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) setState('unsupported');
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    isAbortedRef.current = true;
    recognitionRef.current?.stop();
  }, []);

  function startRecording() {
    setError('');
    setTranscript('');
    fullTranscriptRef.current = '';
    displayedTranscriptRef.current = '';
    setElapsed(0);
    isAbortedRef.current = false;

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
      const displayed = final + interim;
      setTranscript(displayed);
      displayedTranscriptRef.current = displayed;
    };

    recognition.onerror = (event: Event) => {
      const errEvent = event as Event & { error?: string };
      if (errEvent.error !== 'no-speech' && errEvent.error !== 'aborted') {
        setError(`Microphone error: ${errEvent.error ?? 'unknown'}. Please try again.`);
        stopRecording();
      }
    };

    recognition.onend = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      // Don't submit if user aborted (reset/retake)
      if (isAbortedRef.current) return;
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const text = (fullTranscriptRef.current.trim() || displayedTranscriptRef.current.trim());
      setState('done');
      if (text) {
        setTranscript(text);
        onTranscriptRef.current(text, duration);
      }
    };

    try {
      recognition.start();
    } catch {
      setError('Could not start microphone. Please check permissions and try again.');
      return;
    }
    recognitionRef.current = recognition;
    startTimeRef.current = Date.now();
    setState('recording');

    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }

  function stopRecording() {
    recognitionRef.current?.stop();
  }

  function reset() {
    isAbortedRef.current = true;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    setTranscript('');
    fullTranscriptRef.current = '';
    displayedTranscriptRef.current = '';
    setElapsed(0);
    setError('');
    setState('idle');
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (state === 'unsupported') {
    return (
      <div className="rounded-2xl border border-amber-800/40 bg-amber-900/10 p-6 text-center">
        <p className="text-amber-400 text-sm font-medium">Speech recognition not supported</p>
        <p className="text-slate-400 text-xs mt-1">
          Please use Chrome or Edge on desktop. On iPhone, use Safari.
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
            <span className="text-xs text-slate-500">{formatTime(elapsed)} recorded</span>
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
            <p className="text-xs text-slate-500 mt-1">Recording… speak naturally</p>
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
          {state === 'recording' ? 'Tap to stop when done' : 'Tap to start recording'}
        </p>
      </div>

      {state === 'recording' && transcript && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 max-h-32 overflow-y-auto">
          <p className="text-slate-400 text-xs leading-relaxed">{transcript}</p>
        </div>
      )}

      {error && (
        <div className="space-y-3">
          <p className="text-sm text-red-400 text-center">{error}</p>
          <Button variant="outline" onClick={reset} size="sm" className="w-full">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
