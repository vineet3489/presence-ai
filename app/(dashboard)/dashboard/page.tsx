import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { compositeScore } from '@/lib/scoring/presenceScore';
import { CompositeScoreRing, PresenceScoreRing } from '@/components/dashboard/PresenceScoreRing';
import { DailyTips } from '@/components/dashboard/DailyTips';
import { WelcomeVoice } from '@/components/dashboard/WelcomeVoice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Mic, Heart, ArrowRight, MessageCircleHeart } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { AnalysisSession } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: sessions }] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('analysis_sessions').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
  ]);

  if (!profile?.onboarding_completed) redirect('/onboarding');

  const appearanceSession = sessions?.find((s: AnalysisSession) => s.session_type === 'appearance');
  const voiceSession = sessions?.find((s: AnalysisSession) => s.session_type === 'voice');
  const dateSession = sessions?.find((s: AnalysisSession) => s.session_type === 'date_prep');

  const appearanceScore = appearanceSession?.appearance_score ?? null;
  const voiceScore = voiceSession?.voice_score ?? null;
  const socialScore = dateSession?.social_score ?? null;
  const composite = compositeScore(appearanceScore, voiceScore, socialScore);

  const SESSION_LABELS: Record<string, string> = {
    appearance: 'Face Scan', voice: 'Voice Check', date_prep: 'Date Prep', chat_coach: 'Chat Coach',
  };

  const xp: number = profile?.presence_xp ?? 0;
  const streak: number = profile?.tip_streak ?? 0;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Your Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back — here&apos;s where you stand</p>
        </div>
      </div>

      {/* Presence Score + Pillars */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 flex flex-col items-center justify-center">
          <CompositeScoreRing score={composite} />
          {composite === 0 && (
            <p className="text-slate-500 text-sm mt-4 text-center">
              Complete your first analysis to see your score
            </p>
          )}
        </Card>

        <Card className="p-6">
          <CardTitle className="mb-6 text-base">Score Breakdown</CardTitle>
          <div className="flex justify-around">
            <PresenceScoreRing score={appearanceScore ?? 0} label="Appearance" color="#8b5cf6" size={100} />
            <PresenceScoreRing score={voiceScore ?? 0} label="Voice" color="#38bdf8" size={100} />
            <PresenceScoreRing score={socialScore ?? 0} label="Social IQ" color="#f472b6" size={100} />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { href: '/face-scan', icon: Camera, label: 'Scan My Look', color: 'text-violet-400', desc: 'Style & appearance coaching' },
          { href: '/voice-check', icon: Mic, label: 'Voice Check', color: 'text-sky-400', desc: 'Clarity, tone & grammar' },
          { href: '/date-prep', icon: Heart, label: 'Date Prep', color: 'text-pink-400', desc: 'Personalized date coaching' },
          { href: '/chat-coach', icon: MessageCircleHeart, label: 'Chat Coach', color: 'text-rose-400', desc: 'Analyze your DMs' },
        ].map(({ href, icon: Icon, label, color, desc }) => (
          <Link key={href} href={href}>
            <Card className="p-5 hover:border-slate-600 transition-colors cursor-pointer group">
              <Icon size={22} className={`${color} mb-3`} />
              <p className="font-semibold text-white text-sm group-hover:text-violet-300 transition-colors">{label}</p>
              <p className="text-xs text-slate-500 mt-1">{desc}</p>
              <ArrowRight size={14} className="text-slate-600 group-hover:text-violet-400 mt-3 transition-colors" />
            </Card>
          </Link>
        ))}
      </div>

      {/* Daily Tips + Recent Sessions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Today&apos;s Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <DailyTips initialXp={xp} initialStreak={streak} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {!sessions?.length ? (
              <div className="text-center py-4">
                <p className="text-slate-500 text-sm">No sessions yet.</p>
                <Link href="/face-scan">
                  <Button variant="ghost" size="sm" className="mt-2 text-violet-400">
                    Run your first scan →
                  </Button>
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {sessions.map((s: AnalysisSession) => (
                  <li key={s.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{SESSION_LABELS[s.session_type] ?? s.session_type}</Badge>
                      <span className="text-slate-500 text-xs">{formatDate(s.created_at)}</span>
                    </div>
                    <span className="text-violet-400 font-semibold">
                      {s.appearance_score ?? s.voice_score ?? s.social_score ?? '—'}/100
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <WelcomeVoice
        userEmail={user.email ?? ''}
        presenceScore={composite}
        sessionCount={sessions?.length ?? 0}
        streak={streak}
      />
    </div>
  );
}
