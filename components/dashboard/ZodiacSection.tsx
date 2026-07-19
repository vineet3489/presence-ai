'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Star } from 'lucide-react';

interface ZodiacInsights {
  tagline: string;
  coreTraits: string[];
  socialStrength: string;
  blindSpot: string;
  dailyPresenceTip: string;
  phraseToOwn: string;
}

interface ZodiacData {
  zodiac: string | null;
  emoji: string;
  insights: ZodiacInsights;
  noDob?: boolean;
}

export function ZodiacSection() {
  const [data, setData] = useState<ZodiacData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/zodiac')
      .then(r => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 flex items-center gap-3">
        <Loader2 size={16} className="animate-spin text-slate-600" />
        <span className="text-sm text-slate-500">Loading your star sign…</span>
      </div>
    );
  }

  // No DOB set → prompt user to add it
  if (!data || data.noDob || !data.zodiac) {
    return (
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Star size={14} className="text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Zodiac Insights</span>
        </div>
        <p className="text-sm text-slate-300 font-medium mb-1">Unlock your star-sign personality read</p>
        <p className="text-xs text-slate-500 mb-3">Add your date of birth in Settings to get zodiac-based personality coaching.</p>
        <Link href="/settings" className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-2">
          Add in Settings →
        </Link>
      </div>
    );
  }

  const { zodiac, emoji, insights } = data;

  return (
    <div className="rounded-2xl border border-amber-700/30 bg-gradient-to-br from-amber-950/20 to-slate-900/80 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Star size={13} className="text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Zodiac · {zodiac}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emoji}</span>
            <p className="text-white font-bold text-base leading-tight">{insights.tagline}</p>
          </div>
        </div>
      </div>

      {/* Core traits */}
      <div className="flex flex-wrap gap-2">
        {insights.coreTraits?.map((trait, i) => (
          <span key={i} className="text-xs bg-amber-900/30 border border-amber-800/40 text-amber-300 rounded-full px-2.5 py-1">
            {trait}
          </span>
        ))}
      </div>

      {/* Social strength + blind spot */}
      <div className="grid grid-cols-1 gap-2">
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 px-4 py-3">
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">Your natural power</p>
          <p className="text-xs text-slate-300 leading-relaxed">{insights.socialStrength}</p>
        </div>
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 px-4 py-3">
          <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-1">Watch out for</p>
          <p className="text-xs text-slate-300 leading-relaxed">{insights.blindSpot}</p>
        </div>
      </div>

      {/* Phrase to own */}
      {insights.phraseToOwn && (
        <div className="rounded-xl border border-amber-800/30 bg-amber-950/20 px-4 py-3">
          <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1">Your phrase for today</p>
          <p className="text-sm text-white font-medium leading-relaxed">&ldquo;{insights.phraseToOwn}&rdquo;</p>
        </div>
      )}

      {/* Daily tip */}
      {insights.dailyPresenceTip && (
        <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-3">{insights.dailyPresenceTip}</p>
      )}
    </div>
  );
}
