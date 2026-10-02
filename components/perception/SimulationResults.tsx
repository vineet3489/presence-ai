'use client';

import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPersonaById } from '@/lib/personas';
import type { PerceptionSimulationResult, ProfileOptimizerResult } from '@/types';

interface Props {
  simulation: PerceptionSimulationResult;
  optimizer: ProfileOptimizerResult;
  onApplyVariant?: (text: string, tone: string) => void;
  applying?: string | null; // tone currently being applied
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 px-3 py-3 text-center">
      <p className="text-3xl font-black text-white">{Math.round(value)}%</p>
      <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function TagPill({ label, value }: { label: string; value: string }) {
  const positive = value === 'High' || value === 'Above average';
  const negative = value === 'Low' || value === 'Below average';
  const color = positive ? 'text-emerald-400 border-emerald-700/40 bg-emerald-900/20'
    : negative ? 'text-amber-400 border-amber-700/40 bg-amber-900/20'
    : 'text-slate-300 border-slate-700 bg-slate-800/50';
  return (
    <span className={`text-xs rounded-full px-3 py-1 border ${color}`}>
      {label}: {value}
    </span>
  );
}

export function SimulationResults({ simulation, optimizer, onApplyVariant, applying }: Props) {
  const persona = getPersonaById(simulation.personaId);

  return (
    <div className="space-y-4">
      {simulation.actionNow && (
        <div className="rounded-2xl border border-amber-600/50 bg-gradient-to-br from-amber-900/30 to-slate-900 p-5">
          <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1.5">Do this now</p>
          <p className="text-xl font-black text-white leading-snug">{simulation.actionNow}</p>
        </div>
      )}

      <div className="rounded-2xl border border-violet-700/40 bg-gradient-to-br from-violet-950/30 to-slate-900/80 p-5">
        <p className="text-xs text-violet-400 font-semibold uppercase tracking-wider mb-3">
          {persona?.label ?? 'Persona'}
        </p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <StatTile label="Swipe" value={simulation.swipeProbability} />
          <StatTile label="Reply" value={simulation.replyProbability} />
          <StatTile label="Strength" value={simulation.profileStrengthScore} />
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          <TagPill label="Confidence" value={simulation.tags.confidence} />
          <TagPill label="Attractiveness" value={simulation.tags.attractiveness} />
          <TagPill label="Trust" value={simulation.tags.trustworthiness} />
          <TagPill label="Approachability" value={simulation.tags.approachability} />
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">{simulation.narrative}</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-violet-400" />
          <span className="text-sm font-semibold text-white">Bio rewrites</span>
        </div>
        <div className="space-y-2.5">
          {optimizer.bioVariants.map((variant) => (
            <div key={variant.tone} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-wide text-violet-400 font-bold">{variant.tone}</span>
                {onApplyVariant && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={applying === variant.tone}
                    onClick={() => onApplyVariant(variant.text, variant.tone)}
                    className="h-7 text-xs gap-1.5"
                  >
                    {applying === variant.tone ? <Loader2 size={11} className="animate-spin" /> : 'Apply & re-run'}
                  </Button>
                )}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{variant.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <p className="text-sm font-semibold text-white mb-2">Also fix</p>
        <ul className="space-y-1.5">
          {optimizer.suggestions.map((s, i) => (
            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
              <span className="text-violet-400 mt-0.5">•</span> {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
