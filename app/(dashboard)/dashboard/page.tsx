import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { compositeScore } from '@/lib/scoring/presenceScore';
import { MissionCard, MissionStreak } from '@/components/dashboard/MissionCard';
import { DailyTips } from '@/components/dashboard/DailyTips';
import { Button } from '@/components/ui/button';
import { Camera, Mic, Heart, MessageCircleHeart, Sparkles, Shirt, ChevronRight, TrendingUp } from 'lucide-react';
import { AvatarCard } from '@/components/dashboard/AvatarCard';
import { BestVersionCard } from '@/components/dashboard/BestVersionCard';
import type { AnalysisSession } from '@/types';

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
  const dri = compositeScore(appearanceScore, voiceScore, socialScore);

  const xp: number = profile?.presence_xp ?? 0;
  const streak: number = profile?.tip_streak ?? 0;
  const primaryGoal: string = (profile as Record<string, unknown>)?.primary_goal as string ?? 'dating';
  const hasScans = !!(appearanceSession || voiceSession);
  // Paywall disabled for testing — treat all users as subscribed so blur doesn't block
  const isSubscribed = true; // profile?.subscription_status === 'active' || profile?.subscription_status === 'trial';

  const goalLabel = primaryGoal === 'dating' ? 'Dating Readiness' : primaryGoal === 'career' ? 'Career Readiness' : 'Confidence';

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="text-right">
          <MissionStreak streak={streak} />
        </div>
      </div>

      {/* TODAY'S MISSION — hero card */}
      <MissionCard onXpUpdate={() => {}} />

      {/* Dating Readiness Index */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{goalLabel} Index</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-black text-white">{dri || '—'}</span>
              {dri > 0 && <span className="text-sm text-slate-400">/ 100</span>}
            </div>
          </div>
          <Link href="/progress">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <TrendingUp size={12} /> Progress
            </Button>
          </Link>
        </div>
        {!hasScans ? (
          <div className="rounded-xl bg-violet-950/30 border border-violet-800/30 px-4 py-3">
            <p className="text-xs text-violet-300 mb-2">Complete your first scan to unlock your score.</p>
            <div className="flex gap-2">
              <Link href="/face-scan">
                <Button size="sm" className="bg-violet-600 hover:bg-violet-500 gap-1.5 text-xs">
                  <Camera size={12} /> Face Scan
                </Button>
              </Link>
              <Link href="/voice-check">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <Mic size={12} /> Voice Check
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Look', score: appearanceScore, color: '#8b5cf6' },
              { label: 'Voice', score: voiceScore, color: '#38bdf8' },
              { label: 'Social', score: socialScore, color: '#f472b6' },
            ].map(({ label, score, color }) => (
              <div key={label} className="rounded-xl bg-slate-800/50 border border-slate-700/50 px-3 py-2.5 text-center">
                <p className="text-lg font-black text-white">{score ?? '—'}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
                {score && <div className="mt-1 h-0.5 rounded-full bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
                </div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Avatar */}
      <AvatarCard subscribed={isSubscribed} />

      {/* Best Version breakdown */}
      <BestVersionCard />

      {/* Date Tonight hero card */}
      <Link href="/date-prep">
        <div className="rounded-2xl border border-pink-700/50 bg-gradient-to-br from-pink-950/40 to-slate-900/80 p-5 flex items-center gap-4 hover:border-pink-600/60 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-pink-900/40 border border-pink-700/40 flex items-center justify-center shrink-0">
            <Heart size={22} className="text-pink-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold">Have a date?</p>
            <p className="text-slate-400 text-sm mt-0.5">Outfit · conversation starters · pre-date checklist — all in one</p>
          </div>
          <ChevronRight size={16} className="text-slate-600 group-hover:text-pink-400 transition-colors" />
        </div>
      </Link>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { href: '/face-scan', icon: Camera, label: 'Face Scan', color: 'text-violet-400', desc: hasScans ? 'Re-scan' : 'Start here' },
          { href: '/voice-check', icon: Mic, label: 'Voice Check', color: 'text-sky-400', desc: 'Tone & clarity' },
          { href: '/date-prep', icon: Heart, label: 'Date Prep', color: 'text-pink-400', desc: 'Plan your date' },
          { href: '/chat-coach', icon: MessageCircleHeart, label: 'Chat Coach', color: 'text-rose-400', desc: 'Analyze your DMs' },
        ].map(({ href, icon: Icon, label, color, desc }) => (
          <Link key={href} href={href}>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 hover:border-slate-600 transition-colors group h-full">
              <Icon size={18} className={`${color} mb-2`} />
              <p className="font-semibold text-white text-sm group-hover:text-violet-300 transition-colors">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Style Profile teaser */}
      <Link href="/style-profile">
        <div className="rounded-2xl border border-violet-700/50 bg-gradient-to-br from-violet-950/40 to-slate-900/80 p-5 flex items-center gap-4 hover:border-violet-600/60 transition-colors group">
          <Sparkles size={20} className="text-violet-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">Style Profile + Avatar</p>
            <p className="text-slate-400 text-xs mt-0.5">Your archetype, ideal look, and AI avatar video</p>
          </div>
          <ChevronRight size={16} className="text-slate-600 group-hover:text-violet-400 transition-colors" />
        </div>
      </Link>

      {/* Outfit Builder */}
      <Link href="/outfit-builder">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 flex items-center gap-4 hover:border-slate-600 transition-colors group">
          <Shirt size={20} className="text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">Outfit Builder</p>
            <p className="text-slate-400 text-xs mt-0.5">3 outfit options for any occasion</p>
          </div>
          <ChevronRight size={16} className="text-slate-600 group-hover:text-amber-400 transition-colors" />
        </div>
      </Link>

      {/* Daily coaching tips */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-4">Daily Coaching</p>
        <DailyTips initialXp={xp} initialStreak={streak} />
      </div>

    </div>
  );
}
