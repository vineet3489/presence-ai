'use client';

import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MessageSquare, AlertCircle, Dumbbell, Star, TrendingUp, TrendingDown } from 'lucide-react';
import type { VoiceResult } from '@/types';

interface Props {
  result: VoiceResult;
  score: number;
}

function FillerBar({ word, count, max }: { word: string; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  const danger = pct > 60;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono text-slate-400 w-16 shrink-0">&quot;{word}&quot;</span>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${danger ? 'bg-red-500' : 'bg-amber-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-bold w-6 text-right ${danger ? 'text-red-400' : 'text-amber-400'}`}>
        ×{count}
      </span>
    </div>
  );
}

function ExerciseCard({ text, index }: { text: string; index: number }) {
  const colors = ['#8b5cf6', '#38bdf8', '#f472b6'];
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
      <div
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white"
        style={{ background: colors[index % colors.length] }}
      >
        {index + 1}
      </div>
      <p className="text-slate-200 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

export function TranscriptViewer({ result, score }: Props) {
  const maxFillerCount = result.fillerWords.length > 0
    ? Math.max(...result.fillerWords.map((f) => f.count))
    : 1;

  return (
    <div className="space-y-5">
      {/* Score header */}
      <div className="rounded-2xl border border-sky-800/40 bg-gradient-to-br from-sky-950/60 to-slate-900 p-5">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex flex-col items-center min-w-[64px]">
            <span className="text-5xl font-black text-white leading-none">{score}</span>
            <span className="text-xs text-slate-400 mt-1">/ 100</span>
          </div>
          <div className="flex-1 min-w-40">
            <p className="text-sm font-semibold text-white mb-2">Voice Score</p>
            <Progress value={score} className="h-2 mb-3" />
            <div className="flex gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium">
                Clarity {result.clarityScore}/100
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium">
                {result.paceWpm} wpm
              </span>
              {result.fillerWordCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-900/40 border border-amber-800/50 text-xs text-amber-300 font-medium">
                  {result.fillerWordCount} fillers
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800/60">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Tone</p>
          <p className="text-slate-300 text-sm italic">&ldquo;{result.toneAssessment}&rdquo;</p>
        </div>
      </div>

      <Tabs defaultValue="feedback">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feedback" className="text-xs gap-1"><MessageSquare size={13} /> Feedback</TabsTrigger>
          <TabsTrigger value="fillers" className="text-xs gap-1"><AlertCircle size={13} /> Fillers</TabsTrigger>
          <TabsTrigger value="exercises" className="text-xs gap-1"><Dumbbell size={13} /> Drills</TabsTrigger>
          <TabsTrigger value="coaching" className="text-xs gap-1"><Star size={13} /> Full Read</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-4 mt-4">
          {result.strengthsList.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">What&apos;s working</p>
              {result.strengthsList.map((s, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                  <TrendingUp size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-slate-200 text-sm leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Fix these now</p>
            {result.improvementsList.map((s, i) => (
              <div key={i} className="flex gap-3 p-4 rounded-xl bg-amber-950/30 border border-amber-800/40">
                <TrendingDown size={15} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-slate-200 text-sm leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fillers" className="mt-4 space-y-5">
          {result.fillerWords.length === 0 ? (
            <div className="p-5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 text-sm font-semibold">
              Zero filler words detected — clean delivery.
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Filler breakdown — {result.fillerWordCount} total
              </p>
              {result.fillerWords.map((f) => (
                <FillerBar key={f.word} word={f.word} count={f.count} max={maxFillerCount} />
              ))}
            </div>
          )}

          {result.grammarIssues.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Grammar issues</p>
              {result.grammarIssues.map((issue, i) => (
                <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
                  <p className="text-red-400 text-sm line-through opacity-70">&ldquo;{issue.original}&rdquo;</p>
                  <p className="text-emerald-400 text-sm font-medium">&ldquo;{issue.suggestion}&rdquo;</p>
                  <p className="text-slate-500 text-xs italic">{issue.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="exercises" className="mt-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-400">Practice these today</p>
          {result.exercises.map((ex, i) => (
            <ExerciseCard key={i} text={ex} index={i} />
          ))}
        </TabsContent>

        <TabsContent value="coaching" className="mt-4">
          <div className="rounded-2xl bg-gradient-to-br from-sky-950/40 to-slate-900 border border-sky-800/30 p-5">
            <p className="text-slate-200 leading-relaxed text-sm whitespace-pre-line">
              {result.overallCoaching}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
