'use client';

import { useState, useEffect, useRef } from 'react';
import { CameraCapture } from '@/components/camera/CameraCapture';
import { AppearanceResults } from '@/components/camera/AppearanceResults';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCcw, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { AppearanceResult } from '@/types';

type State = 'loading' | 'idle' | 'captured' | 'analyzing' | 'done' | 'error';

interface SessionSnap {
  id: string;
  appearance_score: number | null;
  appearance_result: AppearanceResult | null;
  created_at: string;
}

const ANALYSIS_STAGES = [
  { pct: 18, label: 'Reading your features…', delay: 500 },
  { pct: 38, label: 'Mapping your face shape…', delay: 2200 },
  { pct: 57, label: 'Identifying your style DNA…', delay: 4500 },
  { pct: 74, label: 'Building your coaching…', delay: 7000 },
  { pct: 88, label: 'Almost done…', delay: 10000 },
];

export default function FaceScanPage() {
  const [state, setState] = useState<State>('loading');
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);
  const [capturedMediaType, setCapturedMediaType] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [result, setResult] = useState<AppearanceResult | null>(null);
  const [score, setScore] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [history, setHistory] = useState<SessionSnap[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [analysisPct, setAnalysisPct] = useState(0);
  const [analysisLabel, setAnalysisLabel] = useState('Starting analysis…');
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('analysis_sessions')
      .select('id, appearance_result, appearance_score, created_at')
      .eq('session_type', 'appearance')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const [latest, ...rest] = data as SessionSnap[];
          if (latest?.appearance_result) {
            setResult(latest.appearance_result);
            setScore(latest.appearance_score ?? 0);
            setState('done');
          } else {
            setState('idle');
          }
          setHistory(rest.filter(s => s.appearance_result));
        } else {
          setState('idle');
        }
      });
  }, []);

  function handleCapture(base64: string, mediaType: 'image/jpeg' | 'image/png') {
    setCapturedBase64(base64);
    setCapturedMediaType(mediaType);
    setState('captured');
  }

  useEffect(() => {
    if (state !== 'analyzing') {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      setAnalysisPct(0);
      setAnalysisLabel('Starting analysis…');
      return;
    }
    timersRef.current = ANALYSIS_STAGES.map(({ pct, label, delay }) =>
      setTimeout(() => { setAnalysisPct(pct); setAnalysisLabel(label); }, delay)
    );
    return () => { timersRef.current.forEach(clearTimeout); };
  }, [state]);

  async function handleAnalyze() {
    if (!capturedBase64) return;
    setState('analyzing');
    setErrorMsg('');
    try {
      const res = await fetch('/api/analyze-appearance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: capturedBase64, mediaType: capturedMediaType }),
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
    setCapturedBase64(null);
    setResult(null);
    setScore(0);
    setErrorMsg('');
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  if (state === 'loading') {
    return (
      <div className="p-6 max-w-2xl mx-auto flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-white">Face Scan</h1>
        <p className="text-slate-400 mt-1 text-sm md:text-base">
          Upload a photo — get personalized style & appearance coaching
        </p>
      </div>

      {state === 'done' && result ? (
        <div className="space-y-6">
          <AppearanceResults result={result} score={score} />
          <Button variant="outline" onClick={reset} className="w-full gap-2">
            <RotateCcw size={16} /> Scan Again
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <CameraCapture onCapture={handleCapture} />

          {state === 'captured' && (
            <Button onClick={handleAnalyze} className="w-full" size="lg">
              Analyze My Appearance
            </Button>
          )}

          {state === 'analyzing' && (
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#1e1b4b" strokeWidth="6" />
                  <circle
                    cx="48" cy="48" r="40" fill="none" stroke="#7c3aed" strokeWidth="6"
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
                <p className="text-sm font-semibold text-white">Presence AI is on it</p>
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
            Past scans ({history.length})
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
                      <div className="w-8 h-8 rounded-full bg-violet-900/40 border border-violet-700/40 flex items-center justify-center">
                        <span className="text-xs font-bold text-violet-300">{s.appearance_score ?? '—'}</span>
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Appearance scan</p>
                        <p className="text-xs text-slate-500">{formatDate(s.created_at)}</p>
                      </div>
                    </div>
                    {expandedId === s.id ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                  </button>

                  {expandedId === s.id && s.appearance_result && (
                    <div className="px-4 pb-4 border-t border-slate-800 pt-3 space-y-2">
                      <p className="text-xs text-slate-400 leading-relaxed">{s.appearance_result.overallCoaching}</p>
                      {s.appearance_result.hairstyleRecommendations?.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1">Hairstyle recommendations:</p>
                          <ul className="space-y-0.5">
                            {s.appearance_result.hairstyleRecommendations.slice(0, 2).map((r, i) => (
                              <li key={i} className="text-xs text-slate-400 flex gap-1.5">
                                <span className="text-violet-400">→</span> {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
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
