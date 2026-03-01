'use client';

import { useState } from 'react';
import { VoiceRecorder } from '@/components/voice/VoiceRecorder';
import { TranscriptViewer } from '@/components/voice/TranscriptViewer';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCcw } from 'lucide-react';
import type { VoiceResult } from '@/types';

type State = 'idle' | 'analyzing' | 'done' | 'error';

const PROMPT = "Tell me about yourself — your work, what you're passionate about, and what you're looking forward to right now.";

export default function VoiceCheckPage() {
  const [state, setState] = useState<State>('idle');
  const [transcript, setTranscript] = useState('');
  const [duration, setDuration] = useState(0);
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [score, setScore] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  function handleTranscript(text: string, dur: number) {
    setTranscript(text);
    setDuration(dur);
  }

  async function handleAnalyze() {
    if (!transcript) return;
    setState('analyzing');
    setErrorMsg('');
    try {
      const res = await fetch('/api/analyze-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, durationSeconds: duration }),
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
    setTranscript('');
    setDuration(0);
    setResult(null);
    setScore(0);
    setErrorMsg('');
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Voice Check</h1>
        <p className="text-slate-400 mt-1">
          Record yourself speaking — get coaching on clarity, tone, and grammar
        </p>
      </div>

      {state === 'done' && result ? (
        <div className="space-y-6">
          <TranscriptViewer result={result} score={score} />
          <Button variant="outline" onClick={reset} className="w-full gap-2">
            <RotateCcw size={16} /> Check Again
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <VoiceRecorder onTranscript={handleTranscript} prompt={PROMPT} />

          {transcript && state === 'idle' && (
            <Button onClick={handleAnalyze} className="w-full" size="lg">
              Analyze My Voice
            </Button>
          )}

          {state === 'analyzing' && (
            <div className="flex flex-col items-center gap-3 py-8 text-slate-400">
              <Loader2 size={32} className="animate-spin text-sky-400" />
              <p className="text-sm">Analyzing your speech...</p>
              <p className="text-xs text-slate-600">Checking grammar, tone, and clarity</p>
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
