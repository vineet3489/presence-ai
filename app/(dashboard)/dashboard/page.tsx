import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { compositeScore } from '@/lib/scoring/presenceScore';
import { CompositeScoreRing, PresenceScoreRing } from '@/components/dashboard/PresenceScoreRing';
import { DailyTips } from '@/components/dashboard/DailyTips';
import { WelcomeVoice } from '@/components/dashboard/WelcomeVoice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Mic, Heart, ArrowRight, MessageCircleHeart, Sparkles, Wand2, Zap } from 'lucide-react';
import { AvatarCard } from '@/components/dashboard/AvatarCard';
import type { AnalysisSession, AppearanceResult, VoiceResult } from '@/types';

function shortFix(text: string): string {
  const cleaned = text.replace(/^(consider|try to|make sure to|you should|it would help to|aim to)\s+/i, '');
  const words = cleaned.split(' ');
  return (words.length > 9 ? words.slice(0, 9).join(' ') + '…' : cleaned);
}

function extractFixes(
  ar: AppearanceResult | null,
  vr: VoiceResult | null
): { icon: string; label: string; text: string; link: string; color: string }[] {
  const candidates = [
    ar?.groomingTips?.[0]     && { icon: '✦', label: 'Grooming',   text: shortFix(ar.groomingTips[0]),           link: '/face-scan',   color: 'text-violet-400' },
    ar?.postureCorrections?.[0] && { icon: '◈', label: 'Posture',    text: shortFix(ar.postureCorrections[0]),     link: '/face-scan',   color: 'text-sky-400'    },
    vr?.improvementsList?.[0] && { icon: '◉', label: 'Voice',      text: shortFix(vr.improvementsList[0]),        link: '/voice-check', color: 'text-amber-400'  },
    ar?.hairstyleRecommendations?.[0] && { icon: '◎', label: 'Hair', text: shortFix(ar.hairstyleRecommendations[0]), link: '/face-scan', color: 'text-pink-400'   },
    ar?.expressionTips?.[0]   && { icon: '◇', label: 'Expression', text: shortFix(ar.expressionTips[0]),          link: '/face-scan',   color: 'text-emerald-400'},
  ].filter(Boolean) as { icon: string; label: string; text: string; link: string; color: string }[];
  return candidates.slice(0, 4);
}

function goalHeadline(goal: string): { title: string; sub: string } {
  if (goal?.includes('date')) return { title: 'Fix these to get more dates', sub: 'Ranked by impact on attraction & connection' };
  if (goal?.includes('confident') || goal?.includes('confidence')) return { title: 'What will make you more commanding', sub: 'Ranked by impact on how others perceive you' };
  if (goal?.includes('put-together')) return { title: 'Your style upgrade priorities', sub: 'Quick wins for a sharper first impression' };
  return { title: 'Your action plan this week', sub: 'Based on your latest scans' };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: sessions }] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('analysis_sessions').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
  ]);

  if (!profile?.onboarding_completed) redirect('/onboarding');

  const appearanceSession = sessions?.find((s: AnalysisSession) => s.session_type === 'appearance');
  const voiceSession = sessions?.find((s: AnalysisSession) => s.session_type === 'voice');
  const dateSession = sessions?.find((s: AnalysisSession) => s.session_type === 'date_prep');

  const appearanceScore = appearanceSession?.appearance_score ?? null;
  const voiceScore = voiceSession?.voice_score ?? null;
  const socialScore = dateSession?.social_score ?? null;
  const composite = compositeScore(appearanceScore, voiceScore, socialScore);

  const xp: number = profile?.presence_xp ?? 0;
  const streak: number = profile?.tip_streak ?? 0;
  const goal: string = profile?.goals?.[0] ?? '';

  const fixes = extractFixes(
    appearanceSession?.appearance_result ?? null,
    voiceSession?.voice_result ?? null
  );
  const { title: fixTitle, sub: fixSub } = goalHeadline(goal);

  // Last generated look
  let lastLookUrl: string | null = null;
  try {
    const admin = createAdminClient();
    const { data: signedData, error } = await admin.storage
      .from('face-scans')
      .createSignedUrl(`${user.id}/last-look.jpg`, 3600);
    if (!error && signedData?.signedUrl) lastLookUrl = signedData.signedUrl;
  } catch {}

  const hasAnyScan = !!(appearanceSession || voiceSession);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white">Dashboard</h1>
        <p className="text-slate-500 mt-0.5 text-sm">
          {goal ? `Goal: ${goal}` : 'Welcome back'}
        </p>
      </div>

      {/* Scores */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5 flex flex-col items-center justify-center">
          <CompositeScoreRing score={composite} />
          {composite === 0 && (
            <p className="text-slate-500 text-xs mt-3 text-center">Do a scan to see your score</p>
          )}
        </Card>
        <Card className="p-5">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-4">Breakdown</p>
          <div className="flex justify-around">
            <PresenceScoreRing score={appearanceScore ?? 0} label="Look" color="#8b5cf6" size={90} />
            <PresenceScoreRing score={voiceScore ?? 0} label="Voice" color="#38bdf8" size={90} />
            <PresenceScoreRing score={socialScore ?? 0} label="Social" color="#f472b6" size={90} />
          </div>
        </Card>
      </div>

      {/* Action Plan */}
      <div className="rounded-2xl border border-amber-700/40 bg-gradient-to-br from-amber-950/30 to-slate-900/80 p-5">
        <div className="flex items-center gap-2 mb-1">
          <Zap size={15} className="text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Action Plan</span>
        </div>
        <p className="text-white font-bold text-base mb-0.5">{fixTitle}</p>
        <p className="text-slate-500 text-xs mb-4">{fixSub}</p>

        {fixes.length > 0 ? (
          <div className="space-y-2">
            {fixes.map((fix, i) => (
              <Link href={fix.link} key={i}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-600 transition-colors group">
                  <span className={`text-base shrink-0 ${fix.color}`}>{fix.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{fix.label}</span>
                    <p className="text-sm text-white font-medium leading-snug">{fix.text}</p>
                  </div>
                  <ArrowRight size={13} className="text-slate-600 group-hover:text-white shrink-0 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-slate-500 text-sm mb-3">Do your first scan to unlock your action plan</p>
            <div className="flex gap-3 justify-center">
              <Link href="/face-scan">
                <Button size="sm" className="bg-violet-600 hover:bg-violet-500 gap-2">
                  <Camera size={14} /> Face Scan
                </Button>
              </Link>
              <Link href="/voice-check">
                <Button size="sm" variant="outline" className="gap-2">
                  <Mic size={14} /> Voice Check
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Avatar video */}
      <AvatarCard />

      {/* Style Profile hero — Last Look */}
      <div className="rounded-2xl border border-violet-700/50 bg-gradient-to-br from-violet-950/40 to-slate-900/80 overflow-hidden">
        <div className="flex flex-col md:flex-row items-stretch">
          {lastLookUrl ? (
            <div className="md:w-44 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lastLookUrl} alt="Your ideal look" className="w-full h-44 md:h-full object-cover" />
            </div>
          ) : (
            <div className="md:w-44 shrink-0 h-36 md:h-auto bg-violet-950/40 flex items-center justify-center border-r border-violet-800/30">
              <Wand2 size={28} className="text-violet-700" />
            </div>
          )}
          <div className="flex-1 p-5 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-violet-400" />
                <span className="text-xs text-violet-400 font-bold uppercase tracking-wider">Style Profile</span>
              </div>
              <p className="text-white font-bold text-base leading-tight">
                {lastLookUrl ? 'Your ideal look' : 'See yourself in your ideal look'}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                {lastLookUrl ? 'AI-styled based on your face scan.' : 'Archetype + colors + AI-generated style image.'}
              </p>
            </div>
            <Link href="/style-profile">
              <Button size="sm" className="bg-violet-600 hover:bg-violet-500 gap-2 w-full md:w-auto">
                <Sparkles size={13} />
                {lastLookUrl ? 'View Style Profile' : 'Generate My Look'}
                <ArrowRight size={13} />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/face-scan', icon: Camera, label: 'Face Scan', color: 'text-violet-400', desc: hasAnyScan ? 'Re-scan for latest score' : 'Start here' },
          { href: '/voice-check', icon: Mic, label: 'Voice Check', color: 'text-sky-400', desc: 'Tone, clarity & grammar' },
          { href: '/date-prep', icon: Heart, label: 'Date Prep', color: 'text-pink-400', desc: 'Plan your next date' },
          { href: '/chat-coach', icon: MessageCircleHeart, label: 'Chat Coach', color: 'text-rose-400', desc: 'Analyze your DMs' },
        ].map(({ href, icon: Icon, label, color, desc }) => (
          <Link key={href} href={href}>
            <Card className="p-4 hover:border-slate-600 transition-colors cursor-pointer group h-full">
              <Icon size={20} className={`${color} mb-2`} />
              <p className="font-semibold text-white text-sm group-hover:text-violet-300 transition-colors">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Daily Tips */}
      <Card className="border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Today&apos;s Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <DailyTips initialXp={xp} initialStreak={streak} />
        </CardContent>
      </Card>

      <WelcomeVoice
        userEmail={user.email ?? ''}
        presenceScore={composite}
        sessionCount={sessions?.length ?? 0}
        streak={streak}
      />
    </div>
  );
}
