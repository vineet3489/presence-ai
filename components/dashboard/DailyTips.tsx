'use client';

import { useEffect, useState } from 'react';
import { Mic, Sparkles, Heart, Check, Flame, Loader2, Star } from 'lucide-react';

interface Tip {
  id: string;
  category: 'voice' | 'aura' | 'dating';
  tip_text: string;
  completed: boolean;
}

const CATEGORY = {
  voice: {
    icon: Mic,
    label: 'Voice Training',
    color: 'text-sky-400',
    bg: 'bg-sky-950/60',
    border: 'border-sky-800/50',
    glow: 'shadow-sky-900/40',
    ring: 'ring-sky-500',
  },
  aura: {
    icon: Sparkles,
    label: 'Aura Enhancer',
    color: 'text-violet-400',
    bg: 'bg-violet-950/60',
    border: 'border-violet-800/50',
    glow: 'shadow-violet-900/40',
    ring: 'ring-violet-500',
  },
  dating: {
    icon: Heart,
    label: 'Dating Tip',
    color: 'text-pink-400',
    bg: 'bg-pink-950/60',
    border: 'border-pink-800/50',
    glow: 'shadow-pink-900/40',
    ring: 'ring-pink-500',
  },
};

interface Props {
  initialXp: number;
  initialStreak: number;
}

export function DailyTips({ initialXp, initialStreak }: Props) {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [xp, setXp] = useState(initialXp);
  const [streak, setStreak] = useState(initialStreak);
  const [completing, setCompleting] = useState<string | null>(null);
  const [xpBurst, setXpBurst] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/daily-tips')
      .then((r) => r.json())
      .then((data) => {
        setTips(data.tips ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function markDone(tipId: string) {
    setCompleting(tipId);
    try {
      const res = await fetch(`/api/daily-tips/${tipId}/complete`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setTips((prev) => prev.map((t) => (t.id === tipId ? { ...t, completed: true } : t)));
        setXp(data.xp);
        setStreak(data.streak);
        setXpBurst(tipId);
        setTimeout(() => setXpBurst(null), 1800);
      }
    } finally {
      setCompleting(null);
    }
  }

  const doneCount = tips.filter((t) => t.completed).length;
  const allDone = doneCount === 3 && tips.length === 3;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 gap-2 text-slate-500">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Loading today&apos;s tips…</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Flame size={15} className={streak > 0 ? 'text-orange-400' : 'text-slate-600'} />
          <span className="text-sm font-semibold text-white">{streak} day streak</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Star size={13} className="text-violet-400" />
          <span className="text-sm font-bold text-violet-400">{xp} XP</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-700"
          style={{ width: `${(doneCount / 3) * 100}%` }}
        />
      </div>

      {allDone && (
        <div className="flex items-center gap-2 text-xs text-green-400 font-semibold bg-green-950/40 border border-green-800/40 rounded-lg px-3 py-2">
          <Check size={13} />
          All done for today — streak maintained!
        </div>
      )}

      {/* Tip cards */}
      {tips.map((tip, i) => {
        const cfg = CATEGORY[tip.category];
        const Icon = cfg.icon;
        const isBursting = xpBurst === tip.id;

        return (
          <div
            key={tip.id}
            className={`relative rounded-xl border p-4 transition-all duration-300 ${cfg.bg} ${cfg.border} ${
              tip.completed ? 'opacity-50' : `hover:shadow-lg hover:${cfg.glow}`
            }`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start gap-3">
              {/* Category icon */}
              <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${cfg.bg} border ${cfg.border} mt-0.5`}>
                <Icon size={14} className={cfg.color} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold uppercase tracking-widest mb-1.5 ${cfg.color}`}>
                  {cfg.label}
                </p>
                <p className="text-slate-200 text-sm leading-relaxed">{tip.tip_text}</p>
              </div>

              {/* Done button */}
              <div className="shrink-0 relative">
                {tip.completed ? (
                  <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                    <Check size={14} className="text-green-400" />
                  </div>
                ) : (
                  <button
                    onClick={() => markDone(tip.id)}
                    disabled={completing === tip.id}
                    title="Mark as done"
                    className={`group w-8 h-8 rounded-full border border-slate-700 hover:border-green-500 hover:bg-green-500/10 flex items-center justify-center transition-all duration-200 disabled:opacity-40`}
                  >
                    {completing === tip.id ? (
                      <Loader2 size={12} className="animate-spin text-slate-400" />
                    ) : (
                      <Check size={14} className="text-slate-600 group-hover:text-green-400 transition-colors" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* XP burst */}
            {isBursting && (
              <div className="absolute top-2 right-2 text-xs font-black text-green-400 animate-in fade-in slide-in-from-bottom-2 duration-300 pointer-events-none">
                +5 XP
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
