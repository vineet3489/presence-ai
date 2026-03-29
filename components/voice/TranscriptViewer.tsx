'use client';

import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Zap, AlertCircle, Dumbbell, TrendingUp, TrendingDown } from 'lucide-react';
import type { VoiceResult } from '@/types';

interface Props {
  result: VoiceResult;
  score: number;
}

function scoreTier(s: number): { label: string; color: string } {
  if (s >= 88) return { label: 'Magnetic', color: '#f59e0b' };
  if (s >= 74) return { label: 'Confident', color: '#8b5cf6' };
  if (s >= 58) return { label: 'Solid', color: '#38bdf8' };
  if (s >= 40) return { label: 'Building', color: '#34d399' };
  return { label: 'Raw', color: '#94a3b8' };
}

function paceBucket(wpm: number): { label: string; color: string } {
  if (wpm < 110) return { label: 'Slow', color: '#94a3b8' };
  if (wpm <= 150) return { label: 'Perfect pace', color: '#34d399' };
  if (wpm <= 175) return { label: 'Slightly fast', color: '#f59e0b' };
  return { label: 'Too fast', color: '#f87171' };
}

function FillerBar({ word, count, max }: { word: string; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono text-slate-400 w-16 shrink-0">&quot;{word}&quot;</span>
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${pct > 60 ? 'bg-red-500' : 'bg-amber-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-bold w-6 text-right ${pct > 60 ? 'text-red-400' : 'text-amber-400'}`}>×{count}</span>
    </div>
  );
}

function CompactItem({ text, positive }: { text: string; positive: boolean }) {
  const words = text.split(' ');
  const headline = words.slice(0, 7).join(' ');
  const rest = words.slice(7).join(' ');
  return (
    <div className="flex gap-3 px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
      <div
        className="w-1 shrink-0 rounded-full mt-1"
        style={{ background: positive ? '#10b981' : '#f59e0b', minHeight: '1.2rem' }}
      />
      <div>
        <p className="text-white text-sm font-semibold leading-snug">{headline}</p>
        {rest && <p className="text-slate-500 text-xs mt-0.5">{rest}</p>}
      </div>
    </div>
  );
}

function VerdictCard({ text }: { text: string }) {
  const sentences = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  const verdict = sentences[0] ?? text;
  const insights = sentences.slice(1);
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-gradient-to-br from-sky-950/60 to-slate-900 border border-sky-700/40 p-5">
        <p className="text-xs text-sky-400 font-semibold uppercase tracking-widest mb-2">The Verdict</p>
        <p className="text-white text-base font-semibold leading-relaxed">{verdict}</p>
      </div>
      {insights.map((s, i) => (
        <div key={i} className="flex gap-3 px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-sky-400 font-black text-sm shrink-0">→</span>
          <p className="text-slate-300 text-sm leading-relaxed">{s}</p>
        </div>
      ))}
    </div>
  );
}

export function TranscriptViewer({ result, score }: Props) {
  const tier = scoreTier(score);
  const pace = paceBucket(result.paceWpm);
  const maxFillerCount = result.fillerWords.length > 0
    ? Math.max(...result.fillerWords.map(f => f.count))
    : 1;

  return (
    <div className="space-y-5">
      {/* Score header */}
      <div className="rounded-2xl border border-sky-800/40 bg-gradient-to-br from-sky-950/60 to-slate-900 p-5">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex flex-col items-center min-w-[72px]">
            <span className="text-5xl font-black text-white leading-none">{score}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: tier.color }}>
              {tier.label}
            </span>
          </div>
          <div className="flex-1 min-w-40">
            <Progress value={score} className="h-2 mb-3" />
            <div className="flex gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium"
                style={{ color: pace.color }}>
                {result.paceWpm} wpm · {pace.label}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium">
                Clarity {result.clarityScore}/100
              </span>
              {result.fillerWordCount > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-amber-900/40 border border-amber-800/50 text-xs text-amber-300 font-medium">
                  {result.fillerWordCount} fillers
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Tone as a chip */}
        <div className="mt-3 pt-3 border-t border-slate-800/60">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Tone · </span>
          <span className="text-sm text-slate-300 italic">{result.toneAssessment}</span>
        </div>
      </div>

      <Tabs defaultValue="verdict">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="verdict" className="text-xs gap-1"><Zap size={12} /> Verdict</TabsTrigger>
          <TabsTrigger value="feedback" className="text-xs gap-1"><TrendingUp size={12} /> Fixes</TabsTrigger>
          <TabsTrigger value="fillers" className="text-xs gap-1"><AlertCircle size={12} /> Fillers</TabsTrigger>
          <TabsTrigger value="exercises" className="text-xs gap-1"><Dumbbell size={12} /> Drills</TabsTrigger>
        </TabsList>

        <TabsContent value="verdict" className="mt-4">
          <VerdictCard text={result.overallCoaching} />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4 mt-4">
          {result.strengthsList.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Working for you</p>
              {result.strengthsList.map((s, i) => <CompactItem key={i} text={s} positive={true} />)}
            </div>
          )}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Fix these</p>
            {result.improvementsList.map((s, i) => <CompactItem key={i} text={s} positive={false} />)}
          </div>
        </TabsContent>

        <TabsContent value="fillers" className="mt-4 space-y-5">
          {result.fillerWords.length === 0 ? (
            <div className="p-5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 text-sm font-semibold">
              Zero filler words — clean delivery.
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {result.fillerWordCount} total fillers
              </p>
              {result.fillerWords.map(f => (
                <FillerBar key={f.word} word={f.word} count={f.count} max={maxFillerCount} />
              ))}
            </div>
          )}
          {result.grammarIssues.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Grammar</p>
              {result.grammarIssues.map((issue, i) => (
                <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 space-y-1">
                  <p className="text-red-400 text-xs line-through opacity-70">{issue.original}</p>
                  <p className="text-emerald-400 text-sm font-medium">{issue.suggestion}</p>
                  <p className="text-slate-500 text-xs">{issue.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="exercises" className="mt-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-3">Practice today</p>
          {result.exercises.map((ex, i) => (
            <div key={i} className="flex gap-3 px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="w-1 shrink-0 rounded-full bg-violet-500" style={{ minHeight: '1.2rem' }} />
              <div>
                {(() => {
                  const words = ex.split(' ');
                  const h = words.slice(0, 7).join(' ');
                  const r = words.slice(7).join(' ');
                  return <>
                    <p className="text-white text-sm font-semibold">{h}</p>
                    {r && <p className="text-slate-500 text-xs mt-0.5">{r}</p>}
                  </>;
                })()}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
