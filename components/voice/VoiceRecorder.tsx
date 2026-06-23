'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, RotateCcw, ArrowRight } from 'lucide-react';

interface Props {
  onTranscript: (transcript: string, duration: number) => void;
  onAudioBlob?: (blob: Blob, mimeType: string) => void;
  prompt?: string;
}

type RecordState = 'idle' | 'recording' | 'review' | 'unsupported';

export function VoiceRecorder({ onTranscript, onAudioBlob, prompt }: Props) {
  const [state, setState] = useState<RecordState>('idle');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fullTranscriptRef = useRef<string>('');
  const isAbortedRef = useRef<boolean>(false);
  const onTranscriptRef = useRef(onTranscript);
  const onAudioBlobRef = useRef(onAudioBlob);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioMimeRef = useRef<string>('audio/webm');
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);
  useEffect(() => { onAudioBlobRef.current = onAudioBlob; }, [onAudioBlob]);

  useEffect(() => {
    const SR = window.SpeechRecognition || (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) setState('unsupported');
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    isAbortedRef.current = true;
    recognitionRef.current?.stop();
  }, []);

  function startRecording() {
    setError('');
    setLiveTranscript('');
    setReviewText('');
    fullTranscriptRef.current = '';
    setElapsed(0);
    elapsedRef.current = 0;
    isAbortedRef.current = false;
    audioChunksRef.current = [];

    // Start MediaRecorder for audio storage
    try {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';
        audioMimeRef.current = mimeType;
        const mr = new MediaRecorder(stream, { mimeType });
        audioChunksRef.current = [];
        mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
        mr.onstop = () => {
          stream.getTracks().forEach(t => t.stop());
          if (!isAbortedRef.current && onAudioBlobRef.current && audioChunksRef.current.length > 0) {
            const blob = new Blob(audioChunksRef.current, { type: mimeType });
            onAudioBlobRef.current(blob, mimeType);
          }
        };
        mr.start(1000);
        mediaRecorderRef.current = mr;
      }).catch(() => {});
    } catch {}

    const SR = window.SpeechRecognition || (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) { setState('unsupported'); return; }

    const recognition = new SR();
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
      setLiveTranscript(final + interim);
    };

    recognition.onerror = (event: Event) => {
      const errEvent = event as Event & { error?: string };
      if (errEvent.error !== 'no-speech' && errEvent.error !== 'aborted') {
        setError(`Mic error: ${errEvent.error ?? 'unknown'}`);
      }
    };

    recognition.onend = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (isAbortedRef.current) return;
      // Move to review step — user sees transcript and can edit/submit
      const text = fullTranscriptRef.current.trim();
      setReviewText(text);
      setState('review');
    };

    try {
      recognition.start();
    } catch {
      setError('Could not start microphone. Check permissions and try again.');
      return;
    }
    recognitionRef.current = recognition;
    startTimeRef.current = Date.now();
    setState('recording');

    timerRef.current = setInterval(() => {
      elapsedRef.current = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsed(elapsedRef.current);
    }, 1000);
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    recognitionRef.current?.stop();
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
  }

  function submitTranscript() {
    const text = reviewText.trim();
    if (!text) {
      setError('Please say something or type what you said before submitting.');
      return;
    }
    onTranscriptRef.current(text, elapsedRef.current || elapsed || 30);
  }

  function reset() {
    isAbortedRef.current = true;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    setLiveTranscript('');
    setReviewText('');
    fullTranscriptRef.current = '';
    setElapsed(0);
    elapsedRef.current = 0;
    setError('');
    setState('idle');
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (state === 'unsupported') {
    return (
      <div className="rounded-2xl border border-amber-800/40 bg-amber-900/10 p-6 space-y-3">
        <p className="text-amber-400 text-sm font-medium">Voice recording not supported in this browser</p>
        <p className="text-slate-400 text-xs">Use Chrome or Edge on desktop. On iPhone, use Safari.</p>
        <p className="text-xs text-slate-500 mb-1">Or type what you&apos;d like to say and we&apos;ll coach you on it:</p>
        <textarea
          value={reviewText}
          onChange={e => setReviewText(e.target.value)}
          placeholder="Tell me about yourself — your work, what you're passionate about..."
          rows={4}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 resize-none"
        />
        <Button onClick={submitTranscript} className="w-full gap-2" disabled={!reviewText.trim()}>
          Analyze My Voice <ArrowRight size={14} />
        </Button>
      </div>
    );
  }

  // Review step — after recording stops
  if (state === 'review') {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">What we heard</p>
            <span className="text-xs text-slate-500">{formatTime(elapsed)}</span>
          </div>
          {reviewText ? (
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              rows={4}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 resize-none leading-relaxed"
            />
          ) : (
            <div className="space-y-2">
              <p className="text-slate-500 text-sm">Couldn&apos;t capture speech automatically. Type what you said:</p>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Tell me about yourself — your work, what you're passionate about..."
                rows={4}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button onClick={submitTranscript} className="w-full gap-2" size="lg" disabled={!reviewText.trim()}>
          Analyze My Voice <ArrowRight size={16} />
        </Button>
        <Button variant="outline" onClick={reset} className="w-full gap-2" size="sm">
          <RotateCcw size={14} /> Record Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {prompt && (
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Speak about this:</p>
          <p className="text-slate-300 text-sm italic">&ldquo;{prompt}&rdquo;</p>
        </div>
      )}

      <div className="flex flex-col items-center py-8 gap-4">
        {state === 'recording' && (
          <div className="text-center mb-2">
            <p className="text-4xl font-mono font-bold text-white tabular-nums">{formatTime(elapsed)}</p>
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
          {state === 'recording' ? 'Tap to stop when done' : 'Tap mic to start recording'}
        </p>
      </div>

      {state === 'recording' && liveTranscript && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 max-h-32 overflow-y-auto">
          <p className="text-slate-400 text-xs leading-relaxed">{liveTranscript}</p>
        </div>
      )}

      {error && (
        <div className="space-y-3">
          <p className="text-sm text-red-400 text-center">{error}</p>
          <Button variant="outline" onClick={reset} size="sm" className="w-full">Try Again</Button>
        </div>
      )}
    </div>
  );
}
