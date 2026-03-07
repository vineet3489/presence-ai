'use client';

import { useState, useEffect } from 'react';
import { CameraCapture } from '@/components/camera/CameraCapture';
import { AppearanceResults } from '@/components/camera/AppearanceResults';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCcw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { AppearanceResult } from '@/types';

type State = 'loading' | 'idle' | 'captured' | 'analyzing' | 'done' | 'error';

export default function FaceScanPage() {
  const [state, setState] = useState<State>('loading');
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);
  const [capturedMediaType, setCapturedMediaType] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [result, setResult] = useState<AppearanceResult | null>(null);
  const [score, setScore] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Load last saved session on mount
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('analysis_sessions')
      .select('appearance_result, appearance_score')
      .eq('session_type', 'appearance')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data, error }) => {
        if (!error && data?.appearance_result) {
          setResult(data.appearance_result as AppearanceResult);
          setScore(data.appearance_score ?? 0);
          setState('done');
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

  if (state === 'loading') {
    return (
      <div className="p-8 max-w-2xl mx-auto flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Face Scan</h1>
        <p className="text-slate-400 mt-1">
          Take or upload a photo — get personalized style & appearance coaching
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
            <div className="flex flex-col items-center gap-3 py-8 text-slate-400">
              <Loader2 size={32} className="animate-spin text-violet-400" />
              <p className="text-sm">Claude is analyzing your photo…</p>
              <p className="text-xs text-slate-600">This takes about 10–15 seconds</p>
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
    </div>
  );
}
