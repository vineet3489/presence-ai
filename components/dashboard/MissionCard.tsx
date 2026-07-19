'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, CheckCircle2, ArrowRight, Flame } from 'lucide-react';

interface Mission {
  id: string;
  title?: string;
  mission_text: string;
  why_text?: string;
  category: string;
  difficulty: string;
  xp_value: number;
  completed: boolean;
  reflection_text?: string;
  coach_response?: string;
  requires_reflection?: boolean;
}

const DIFF_COLORS: Record<string, string> = {
  easy: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
  medium: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
  hard: 'text-orange-400 bg-orange-950/40 border-orange-800/40',
  very_hard: 'text-red-400 bg-red-950/40 border-red-800/40',
};

const DIFF_XP: Record<string, number> = { easy: 10, medium: 25, hard: 40, very_hard: 50 };

export function MissionCard({ onXpUpdate }: { onXpUpdate?: (xp: number, streak: number) => void }) {
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [reflection, setReflection] = useState('');
  const [submittingReflection, setSubmittingReflection] = useState(false);
  const [coachResponse, setCoachResponse] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch('/api/missions/today')
      .then(r => r.json())
      .then(d => { setMission(d.mission ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleComplete() {
    if (!mission) return;
    setCompleting(true);
    const res = await fetch(`/api/missions/${mission.id}/complete`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      onXpUpdate?.(data.xp, data.streak);
      const needsReflection = data.requiresReflection && !mission.reflection_text;
      if (needsReflection) {
        setMission(m => m ? { ...m, completed: true } : m);
        setShowReflection(true);
      } else {
        setMission(m => m ? { ...m, completed: true } : m);
        setDone(true);
      }
    }
    setCompleting(false);
  }

  async function handleReflect() {
    if (!mission || !reflection.trim()) return;
    setSubmittingReflection(true);
    const res = await fetch(`/api/missions/${mission.id}/reflect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reflection }),
    });
    const data = await res.json();
    if (res.ok) {
      setCoachResponse(data.coachResponse);
      setDone(true);
    }
    setSubmittingReflection(false);
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 flex items-center gap-3 h-32">
        <Loader2 size={16} className="animate-spin text-slate-600" />
        <span className="text-sm text-slate-500">Loading today&apos;s mission…</span>
      </div>
    );
  }

  if (!mission) return null;

  const diffLabel = mission.difficulty?.replace('_', ' ') ?? 'easy';
  const xp = mission.xp_value ?? DIFF_XP[mission.difficulty] ?? 10;

  // Completed + reflection submitted → show coach response
  if (done || (mission.completed && mission.coach_response)) {
    return (
      <div className="rounded-2xl border border-emerald-800/40 bg-emerald-950/20 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="text-sm font-bold text-emerald-400">Mission complete — +{xp} XP</span>
        </div>
        <p className="text-sm text-white font-medium">{mission.mission_text}</p>
        {(coachResponse || mission.coach_response) && (
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 px-4 py-3">
            <p className="text-[10px] text-violet-400 font-bold uppercase tracking-wider mb-1">Your coach</p>
            <p className="text-sm text-slate-300 leading-relaxed">{coachResponse || mission.coach_response}</p>
          </div>
        )}
        <p className="text-xs text-slate-600">Come back tomorrow for your next mission.</p>
      </div>
    );
  }

  // Reflection step
  if (showReflection) {
    return (
      <div className="rounded-2xl border border-violet-800/40 bg-slate-900/60 p-5 space-y-4">
        <div>
          <p className="text-sm font-bold text-white mb-1">How did it go?</p>
          <p className="text-xs text-slate-500">2–3 sentences. Your coach will respond personally.</p>
        </div>
        <textarea
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          placeholder="What happened? How did it feel? What would you do differently?"
          rows={3}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 resize-none"
        />
        <Button
          onClick={handleReflect}
          disabled={submittingReflection || !reflection.trim()}
          className="w-full gap-2"
        >
          {submittingReflection ? <Loader2 size={14} className="animate-spin" /> : null}
          Submit Reflection
        </Button>
      </div>
    );
  }

  // Active mission
  return (
    <div className="rounded-2xl border border-amber-700/40 bg-gradient-to-br from-amber-950/30 to-slate-900/80 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap size={15} className="text-amber-400 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Today&apos;s Mission</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-bold uppercase tracking-wider border rounded-full px-2 py-0.5 ${DIFF_COLORS[mission.difficulty ?? 'easy']}`}>
            {diffLabel}
          </span>
          <span className="text-[10px] text-amber-400 font-bold">+{xp} XP</span>
        </div>
      </div>

      <div>
        <p className="text-white font-semibold text-base leading-snug">{mission.mission_text}</p>
        {mission.why_text && (
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{mission.why_text}</p>
        )}
      </div>

      <Button
        onClick={handleComplete}
        disabled={completing}
        className="w-full bg-amber-600 hover:bg-amber-500 text-white gap-2"
      >
        {completing
          ? <Loader2 size={14} className="animate-spin" />
          : <><CheckCircle2 size={14} /> Mark Done <ArrowRight size={13} /></>
        }
      </Button>
    </div>
  );
}

export function MissionStreak({ streak }: { streak: number }) {
  return (
    <div className="flex items-center gap-2">
      <Flame size={16} className={streak > 0 ? 'text-orange-400' : 'text-slate-600'} />
      <span className="text-sm font-bold text-white">{streak} day streak</span>
      {streak >= 7 && <span className="text-[10px] bg-orange-900/40 text-orange-400 border border-orange-800/40 rounded-full px-2 py-0.5">🔥 On fire</span>}
    </div>
  );
}
