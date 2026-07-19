'use client';

import { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus, Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WeeklyReportData } from '@/types';

function Delta({ curr, prev, label, color }: { curr: number | null; prev: number | null; label: string; color: string }) {
  if (curr === null) return (
    <div className="text-center">
      <div className="text-2xl font-black text-slate-600">—</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );

  const delta = curr !== null && prev !== null ? Math.round(curr - prev) : null;

  return (
    <div className="text-center">
      <div className={`text-2xl font-black ${color}`}>{Math.round(curr)}</div>
      {delta !== null && (
        <div className={`flex items-center justify-center gap-0.5 text-xs mt-0.5 ${
          delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-slate-500'
        }`}>
          {delta > 0 ? <TrendingUp size={10} /> : delta < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
          {delta > 0 ? '+' : ''}{delta}
        </div>
      )}
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

export default function ReportPage() {
  const [report, setReport] = useState<WeeklyReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/weekly-report')
      .then((r) => r.json())
      .then((data) => setReport(data))
      .finally(() => setLoading(false));
  }, []);

  async function handleShare() {
    if (!report) return;
    setSharing(true);

    const text = `My PresenceAI Weekly Report\n\n` +
      `Appearance: ${report.weekAvgAppearance !== null ? Math.round(report.weekAvgAppearance) : '—'}/100\n` +
      `Voice: ${report.weekAvgVoice !== null ? Math.round(report.weekAvgVoice) : '—'}/100\n` +
      `Social IQ: ${report.weekAvgSocial !== null ? Math.round(report.weekAvgSocial) : '—'}/100\n` +
      `Sessions: ${report.sessionCount} · Streak: ${report.streak} days\n\n` +
      `"${report.coachSummary}"\n\npresence-ai-jet.vercel.app`;

    if (navigator.share) {
      await navigator.share({ title: 'My Presence Report', text }).catch(() => null);
    } else {
      await navigator.clipboard.writeText(text);
      alert('Report copied to clipboard!');
    }
    setSharing(false);
  }

  if (loading) {
    return (
      <div className="p-8 max-w-2xl mx-auto flex items-center justify-center min-h-64">
        <Loader2 size={24} className="animate-spin text-violet-400" />
      </div>
    );
  }

  if (!report) return null;

  const hasData = report.weekAvgAppearance !== null || report.weekAvgVoice !== null || report.weekAvgSocial !== null;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Weekly Report</h1>
          <p className="text-slate-400 mt-1">Last 7 days vs the 7 before</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleShare} disabled={sharing} className="gap-2">
          {sharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
          Share
        </Button>
      </div>

      {/* Score card */}
      <div ref={cardRef} className="border border-violet-700/40 rounded-2xl p-6 bg-slate-900 mb-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wide">Week ending</span>
            <div className="text-sm font-semibold text-white mt-0.5">
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500">{report.sessionCount} sessions</span>
            <div className="text-sm font-semibold text-violet-300 mt-0.5">{report.streak}🔥 streak</div>
          </div>
        </div>

        {hasData ? (
          <div className="flex justify-around">
            <Delta curr={report.weekAvgAppearance} prev={report.prevAvgAppearance} label="Appearance" color="text-violet-400" />
            <Delta curr={report.weekAvgVoice} prev={report.prevAvgVoice} label="Voice" color="text-sky-400" />
            <Delta curr={report.weekAvgSocial} prev={report.prevAvgSocial} label="Social IQ" color="text-pink-400" />
          </div>
        ) : (
          <p className="text-slate-500 text-sm text-center py-4">
            No sessions this week yet. Run a scan to see your scores here.
          </p>
        )}
      </div>

      {/* Coach summary */}
      <div className="space-y-4">
        <div className="border border-slate-700 rounded-2xl p-5 bg-slate-900">
          <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-2">Coach's Read</h3>
          <p className="text-white text-sm leading-relaxed">{report.coachSummary}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border border-green-700/30 rounded-2xl p-4 bg-green-900/10">
            <h3 className="text-xs uppercase tracking-wide text-green-400 mb-2">Top Improvement</h3>
            <p className="text-slate-200 text-sm">{report.topImprovement}</p>
          </div>
          <div className="border border-amber-700/30 rounded-2xl p-4 bg-amber-900/10">
            <h3 className="text-xs uppercase tracking-wide text-amber-400 mb-2">Focus Next Week</h3>
            <p className="text-slate-200 text-sm">{report.focusArea}</p>
          </div>
        </div>

        {/* XP */}
        <div className="border border-slate-700 rounded-2xl p-5 bg-slate-900 flex items-center justify-between">
          <div>
            <h3 className="text-xs uppercase tracking-wide text-slate-500">Total XP Earned</h3>
            <div className="text-3xl font-black text-violet-400 mt-1">{report.xp} XP</div>
          </div>
          <div className="text-right">
            <h3 className="text-xs uppercase tracking-wide text-slate-500">Current Streak</h3>
            <div className="text-3xl font-black text-orange-400 mt-1">{report.streak} 🔥</div>
          </div>
        </div>
      </div>
    </div>
  );
}
