import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { formatDate } from '@/lib/utils';
import type { AnalysisSession } from '@/types';

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: sessions } = await supabase
    .from('analysis_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  const SESSION_LABELS: Record<string, string> = {
    appearance: 'Face Scan', voice: 'Voice Check', date_prep: 'Date Prep',
  };
  const SESSION_COLORS: Record<string, string> = {
    appearance: 'text-violet-400', voice: 'text-sky-400', date_prep: 'text-pink-400',
  };

  // Build chart data — one point per session
  const chartData = (sessions || []).map((s: AnalysisSession) => ({
    date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    appearance: s.appearance_score ?? undefined,
    voice: s.voice_score ?? undefined,
    social: s.social_score ?? undefined,
  }));

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Progress</h1>
        <p className="text-slate-400 mt-1">Track how your presence scores evolve over time</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Score History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-violet-400 inline-block" />Appearance</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-sky-400 inline-block" />Voice</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-pink-400 inline-block" />Social IQ</span>
          </div>
          <ProgressChart data={chartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {!sessions?.length ? (
            <p className="text-slate-500 text-sm py-4 text-center">No sessions yet. Start with a Face Scan or Voice Check.</p>
          ) : (
            <div className="space-y-3">
              {[...sessions].reverse().map((s: AnalysisSession) => {
                const score = s.appearance_score ?? s.voice_score ?? s.social_score;
                const coachingSnippet = s.appearance_result?.overallCoaching ||
                  s.voice_result?.overallCoaching ||
                  s.date_prep_result?.overallCoaching;
                return (
                  <div key={s.id} className="border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{SESSION_LABELS[s.session_type]}</Badge>
                        <span className="text-xs text-slate-500">{formatDate(s.created_at)}</span>
                      </div>
                      {score !== null && score !== undefined && (
                        <span className={`text-lg font-black ${SESSION_COLORS[s.session_type]}`}>
                          {Math.round(score)}/100
                        </span>
                      )}
                    </div>
                    {coachingSnippet && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {coachingSnippet.slice(0, 180)}...
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
