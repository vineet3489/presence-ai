import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Lock, TrendingUp } from 'lucide-react';
import { PresenceScoreRing } from './PresenceScoreRing';

export interface ScoreCardData {
  label: string;
  score: number | null;
  color: string;
  icon: LucideIcon;
  /** What this score measures, in a few words. */
  what: string;
  /** Top fix from the user's latest result. */
  fix?: string;
  href: string;
  cta: string;
}

/** Keep fixes to one scannable line: cut at the first em-dash/sentence end, cap length. */
function shorten(text: string, max = 70) {
  const first = text.split(/ — |\. /)[0].trim();
  return first.length > max ? `${first.slice(0, max - 1).trimEnd()}…` : first;
}

function verdict(score: number) {
  if (score >= 80) return { text: 'Strong', cls: 'text-emerald-400 bg-emerald-900/30 border-emerald-700/40' };
  if (score >= 65) return { text: 'Good', cls: 'text-sky-300 bg-sky-900/30 border-sky-700/40' };
  return { text: 'Fix first', cls: 'text-amber-400 bg-amber-900/30 border-amber-700/40' };
}

export function ScoreBoard({ total, goalLabel, cards }: { total: number; goalLabel: string; cards: ScoreCardData[] }) {
  const scored = cards.filter((c) => c.score !== null);
  const weakest = scored.length ? scored.reduce((a, b) => (a.score! <= b.score! ? a : b)) : null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      {/* Total */}
      <div className="flex items-center gap-5 mb-5">
        <PresenceScoreRing score={total} label="" size={104} color="#8b5cf6" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{goalLabel} Score</p>
          {weakest ? (
            <p className="text-lg font-black text-white leading-snug mt-1">
              Biggest win: raise your <span style={{ color: weakest.color }}>{weakest.label}</span>
            </p>
          ) : (
            <p className="text-lg font-black text-white leading-snug mt-1">Get your first score below</p>
          )}
          <Link href="/progress" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white mt-1.5">
            <TrendingUp size={12} /> See progress
          </Link>
        </div>
      </div>

      {/* Per-score cards with the fix */}
      <div className="space-y-2.5">
        {cards.map(({ label, score, color, icon: Icon, what, fix, href, cta }) => {
          const v = score !== null ? verdict(score) : null;
          const isWeakest = weakest?.label === label;
          return (
            <Link key={label} href={href} className="block group">
              <div
                className={`rounded-xl border p-3.5 transition-colors ${
                  isWeakest ? 'border-amber-600/50 bg-amber-950/10' : 'border-slate-800 bg-slate-950/40'
                } group-hover:border-slate-600`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}22` }}>
                    {score === null ? <Lock size={15} className="text-slate-500" /> : <Icon size={16} style={{ color }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{label}</p>
                      {v && <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 border ${v.cls}`}>{v.text}</span>}
                    </div>
                    <p className="text-[11px] text-slate-500">{what}</p>
                  </div>
                  <p className="text-2xl font-black text-white tabular-nums">{score ?? '—'}</p>
                </div>

                {score !== null && (
                  <div className="mt-2.5 h-1 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
                  </div>
                )}

                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-300 min-w-0">
                    {score !== null && fix ? (
                      <>
                        <span className="font-bold" style={{ color }}>To raise it: </span>
                        {shorten(fix)}
                      </>
                    ) : (
                      <span className="font-semibold" style={{ color }}>{cta}</span>
                    )}
                  </p>
                  <ArrowRight size={14} className="text-slate-600 group-hover:text-white shrink-0 transition-colors" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
