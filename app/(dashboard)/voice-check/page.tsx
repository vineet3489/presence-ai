'use client';

import { useState, useEffect, useRef } from 'react';
import { VoiceRecorder } from '@/components/voice/VoiceRecorder';
import { TranscriptViewer } from '@/components/voice/TranscriptViewer';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCcw, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { VoiceResult } from '@/types';

const VOICE_STAGES = [
  { pct: 22, label: 'Reading your transcript…', delay: 400 },
  { pct: 45, label: 'Counting filler words…', delay: 1400 },
  { pct: 65, label: 'Checking grammar & tone…', delay: 2600 },
  { pct: 83, label: 'Building your coaching…', delay: 3800 },
];

type State = 'loading' | 'idle' | 'analyzing' | 'done' | 'error';

const PROMPT = "Tell me about yourself — your work, what you're passionate about, and what you're looking forward to right now.";

interface SessionSnap {
  id: string;
  voice_score: number | null;
  voice_result: VoiceResult | null;
  created_at: string;
}

export default function VoiceCheckPage() {
  const [state, setState] = useState<State>('loading');
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [score, setScore] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [history, setHistory] = useState<SessionSnap[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [analysisPct, setAnalysisPct] = useState(0);
  const [analysisLabel, setAnalysisLabel] = useState('Starting…');
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (state !== 'analyzing') {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      setAnalysisPct(0);
      return;
    }
    timersRef.current = VOICE_STAGES.map(({ pct, label, delay }) =>
      setTimeout(() => { setAnalysisPct(pct); setAnalysisLabel(label); }, delay)
    );
    return () => { timersRef.current.forEach(clearTimeout); };
  }, [state]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('analysis_sessions')
      .select('id, voice_result, voice_score, created_at')
      .eq('session_type', 'voice')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const [latest, ...rest] = data as SessionSnap[];
          if (latest?.voice_result) {
            setResult(latest.voice_result);
            setScore(latest.voice_score ?? 0);
            setState('done');
          } else {
            setState('idle');
          }
          setHistory(rest.filter(s => s.voice_result));
        } else {
          setState('idle');
        }
      });
  }, []);

  async function handleTranscript(text: string, dur: number) {
    if (!text) return;
    setState('analyzing');
    setErrorMsg('');
    try {
      const res = await fetch('/api/analyze-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, durationSeconds: dur }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setResult(data.result);
      setScore(data.score);
      setState('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setState('error');
    }
  }

  function reset() {
    setState('idle');
    setResult(null);
    setScore(0);
    setErrorMsg('');
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  if (state === 'loading') {
    return (
      <div className="p-6 max-w-2xl mx-auto flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-sky-400" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-white">Voice Check</h1>
        <p className="text-slate-400 mt-1 text-sm md:text-base">
          Record yourself speaking — get coaching on clarity, tone, and grammar
        </p>
      </div>

      {state === 'done' && result ? (
        <div className="space-y-6">
          <TranscriptViewer result={result} score={score} />
          <Button variant="outline" onClick={reset} className="w-full gap-2">
            <RotateCcw size={16} /> Record Again
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <VoiceRecorder onTranscript={handleTranscript} prompt={PROMPT} />

          {state === 'analyzing' && (
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#0c2030" strokeWidth="6" />
                  <circle
                    cx="48" cy="48" r="40" fill="none" stroke="#0ea5e9" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - analysisPct / 100)}`}
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-white">{analysisPct}%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Presence AI is listening</p>
                <p className="text-xs text-slate-500 mt-1">{analysisLabel}</p>
              </div>
            </div>
          )}

          {state === 'error' && (
            <div className="space-y-3">
              <p className="text-sm text-red-400 bg-red-900/20 rounded-lg px-4 py-3">{errorMsg}</p>
              <Button variant="outline" onClick={reset} className="w-full gap-2">
                <RotateCcw size={16} /> Try Again
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Past sessions */}
      {history.length > 0 && (
        <div className="mt-10">
          <button
            onClick={() => setShowHistory(h => !h)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
          >
            <Clock size={15} />
            Past recordings ({history.length})
            {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showHistory && (
            <div className="space-y-3">
              {history.map((s) => (
                <div key={s.id} className="rounded-xl border border-slate-800 bg-slate-900/50">
                  <button
                    onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sky-900/40 border border-sky-700/40 flex items-center justify-center">
                        <span className="text-xs font-bold text-sky-300">{s.voice_score ?? '—'}</span>
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Voice session</p>
                        <p className="text-xs text-slate-500">{formatDate(s.created_at)}</p>
                      </div>
                    </div>
                    {expandedId === s.id ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                  </button>

                  {expandedId === s.id && s.voice_result && (
                    <div className="px-4 pb-4 border-t border-slate-800 pt-3 space-y-3">
                      <p className="text-xs text-slate-400 leading-relaxed">{s.voice_result.overallCoaching}</p>
                      <div className="flex gap-4 text-xs">
                        <span className="text-slate-500">Pace: <span className="text-white">{s.voice_result.paceWpm} wpm</span></span>
                        <span className="text-slate-500">Fillers: <span className="text-white">{s.voice_result.fillerWordCount}</span></span>
                        <span className="text-slate-500">Clarity: <span className="text-white">{s.voice_result.clarityScore}/100</span></span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
