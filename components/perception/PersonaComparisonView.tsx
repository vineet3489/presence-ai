'use client';

import { getPersonaById } from '@/lib/personas';
import type { PerceptionSimulationResult } from '@/types';

export function PersonaComparisonView({ results }: { results: PerceptionSimulationResult[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {results.map((r) => {
        const persona = getPersonaById(r.personaId);
        return (
          <div key={r.personaId} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs text-violet-400 font-semibold uppercase tracking-wider mb-3">{persona?.label ?? r.personaId}</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="rounded-lg bg-slate-800/50 px-2 py-2 text-center">
                <p className="text-lg font-black text-white">{Math.round(r.swipeProbability)}%</p>
                <p className="text-[9px] text-slate-500 uppercase">Swipe</p>
              </div>
              <div className="rounded-lg bg-slate-800/50 px-2 py-2 text-center">
                <p className="text-lg font-black text-white">{Math.round(r.replyProbability)}%</p>
                <p className="text-[9px] text-slate-500 uppercase">Reply</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{r.narrative}</p>
          </div>
        );
      })}
    </div>
  );
}
