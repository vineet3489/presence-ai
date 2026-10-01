'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { PerceptionSimulationResult } from '@/types';

interface Props {
  before: PerceptionSimulationResult;
  after: PerceptionSimulationResult;
}

function DeltaStat({ label, before, after }: { label: string; before: number; after: number }) {
  const delta = Math.round(after - before);
  const Icon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const color = delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-red-400' : 'text-slate-500';
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-slate-500">{Math.round(before)}%</span>
        <span className="text-slate-600">→</span>
        <span className="text-xl font-black text-white">{Math.round(after)}%</span>
      </div>
      <div className={`flex items-center justify-center gap-1 text-xs mt-1 font-semibold ${color}`}>
        <Icon size={11} /> {delta > 0 ? '+' : ''}{delta}%
      </div>
      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">{label}</p>
    </div>
  );
}

export function BeforeAfterView({ before, after }: Props) {
  return (
    <div className="rounded-2xl border border-emerald-700/40 bg-gradient-to-br from-emerald-950/20 to-slate-900/80 p-5">
      <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-4">Before → After</p>
      <div className="grid grid-cols-3 gap-3">
        <DeltaStat label="Swipe" before={before.swipeProbability} after={after.swipeProbability} />
        <DeltaStat label="Reply" before={before.replyProbability} after={after.replyProbability} />
        <DeltaStat label="Strength" before={before.profileStrengthScore} after={after.profileStrengthScore} />
      </div>
    </div>
  );
}
