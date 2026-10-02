import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { compositeScore } from '@/lib/scoring/presenceScore';
import { MissionCard, MissionStreak } from '@/components/dashboard/MissionCard';
import { DailyTips } from '@/components/dashboard/DailyTips';
import { Button } from '@/components/ui/button';
import {
  Camera, Mic, Heart, Eye, Sparkles, MessageCircleHeart,
  ChevronRight, TrendingUp, Lock, CheckCircle2, Flame,
} from 'lucide-react';
import { BestVersionCard } from '@/components/dashboard/BestVersionCard';
import type { AnalysisSession, AppearanceResult, VoiceResult } from '@/types';
import { ScoreBoard, type ScoreCardData } from '@/components/dashboard/ScoreBoard';
import { IdealSelfCard } from '@/components/dashboard/IdealSelfCard';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: sessions }, { data: latestSim }] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('analysis_sessions').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
    supabase.from('simulation_results')
      .select('swipe_probability, reply_probability, optimizer_result')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ]);

  if (!profile?.onboarding_completed) redirect('/onboarding');

  const appearanceSession = sessions?.find((s: AnalysisSession) => s.session_type === 'appearance');
  const voiceSession = sessions?.find((s: AnalysisSession) => s.session_type === 'voice');
  // Style Profile is cached as a date_prep session tagged style_profile_*; real date coaching carries social_score
  const isStyleProfile = (s: AnalysisSession) =>
    String((s.date_prep_result as unknown as Record<string, unknown> | null)?.type ?? '').startsWith('style_profile');
  const styleSession = sessions?.find((s: AnalysisSession) => s.session_type === 'date_prep' && isStyleProfile(s));
  const dateSession = sessions?.find((s: AnalysisSession) => s.session_type === 'date_prep' && !isStyleProfile(s));

  const appearanceScore = appearanceSession?.appearance_score ?? null;
  const voiceScore = voiceSession?.voice_score ?? null;
  // Social = how people actually react to you: average of swipe + reply odds from the latest Perception Check
  const socialScore = latestSim
    ? Math.round(((latestSim.swipe_probability ?? 0) + (latestSim.reply_probability ?? 0)) / 2)
    : dateSession?.social_score ?? null;
  const dri = compositeScore(appearanceScore, voiceScore, socialScore);

  const appearance = appearanceSession?.appearance_result as AppearanceResult | undefined;
  const voice = voiceSession?.voice_result as VoiceResult | undefined;
  const topFiller = voice?.fillerWords?.slice().sort((a, b) => b.count - a.count)[0];
  const simSuggestion = (latestSim?.optimizer_result as { suggestions?: string[] } | null)?.suggestions?.[0];

  const scoreCards: ScoreCardData[] = [
    {
      label: 'Look', score: appearanceScore, color: '#8b5cf6', icon: Camera,
      what: 'How your face, grooming & style read',
      fix: appearance?.expressionTips?.[0] ?? appearance?.groomingTips?.[0],
      href: '/face-scan', cta: appearanceScore === null ? 'Get it — 30s Face Scan' : 'Re-scan after the fix',
    },
    {
      label: 'Voice', score: voiceScore, color: '#38bdf8', icon: Mic,
      what: 'How confident & clear you sound',
      fix: topFiller && topFiller.count > 1
        ? `Cut "${topFiller.word}" — you said it ${topFiller.count}×`
        : voice?.improvementsList?.[0],
      href: '/voice-check', cta: voiceScore === null ? 'Get it — 30s Voice Check' : 'Re-record after the fix',
    },
    {
      label: 'Social', score: socialScore, color: '#f472b6', icon: Eye,
      what: 'How people react to your profile',
      fix: simSuggestion,
      href: '/perception', cta: socialScore === null ? 'Get it — run a Perception Check' : 'Re-run after the fix',
    },
  ];

  const xp: number = profile?.presence_xp ?? 0;
  const streak: number = profile?.tip_streak ?? 0;
  const primaryGoal: string = (profile as Record<string, unknown>)?.primary_goal as string ?? 'dating';

  const goalLabel = primaryGoal === 'dating' ? 'Dating Readiness' : primaryGoal === 'career' ? 'Career Readiness' : 'Confidence';

  const hasFaceScan = !!appearanceSession;
  const hasVoiceCheck = !!voiceSession;
  const isNewUser = !hasFaceScan && !hasVoiceCheck;

  // Journey step state
  const step1Done = hasFaceScan;
  const step2Done = hasVoiceCheck;
  const step3Done = !!styleSession;
  const activeStep = !step1Done ? 1 : !step2Done ? 2 : !step3Done ? 3 : null;
  const inOnboarding = activeStep !== null;

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

      {/* ── NEW USER: Full FTUE layout ────────────────────────────────────── */}
      {isNewUser ? (
        <>
          {/* Hero unlock card */}
          <div className="rounded-3xl border border-violet-500/50 bg-gradient-to-br from-violet-950/70 via-slate-900 to-slate-950 p-6 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-violet-800/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-violet-400">Step 1 of 3 · First Mission</span>
              </div>
              <h2 className="text-2xl font-black text-white leading-tight mb-2">
                Discover your <span className="text-violet-400">Presence Score</span>
              </h2>
              <p className="text-slate-400 text-sm mb-5 leading-relaxed">
                A 30-second face scan gives you your personalized appearance score, style archetype, grooming guide, and AI coaching — instantly.
              </p>
              <Link href="/face-scan">
                <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold text-base h-12 gap-2 shadow-lg shadow-violet-900/50">
                  <Camera size={18} /> Start Face Scan →
                </Button>
              </Link>
              <div className="flex items-center justify-center gap-3 mt-3 text-[11px] text-slate-600">
                <span>⚡ 30 seconds</span>
                <span>·</span>
                <span>🔒 Private</span>
                <span>·</span>
                <span>✨ Instant AI results</span>
              </div>
            </div>
          </div>

          {/* Locked DRI preview */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{goalLabel} Index</p>
              <span className="text-[10px] text-slate-500 bg-slate-800 border border-slate-700 rounded-full px-2 py-0.5 flex items-center gap-1">
                <Lock size={8} /> Locked
              </span>
            </div>
            <div className="blur-md select-none pointer-events-none">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-5xl font-black text-white">84</span>
                <span className="text-lg text-slate-400">/ 100</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[{ label: 'Look', score: 79 }, { label: 'Voice', score: 81 }, { label: 'Social', score: 73 }].map(({ label, score }) => (
                  <div key={label} className="rounded-xl bg-slate-800/50 border border-slate-700/50 px-3 py-2.5 text-center">
                    <p className="text-lg font-black text-white">{score}</p>
                    <p className="text-[10px] text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-slate-700/50 text-center">
                <p className="text-sm font-semibold text-white">Complete your Face Scan to unlock</p>
                <p className="text-xs text-violet-400 mt-0.5">Takes 30 seconds</p>
              </div>
            </div>
          </div>

          {/* 3-step journey tracker */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">Your Coaching Journey</p>
            <div className="space-y-2">
              {([
                { step: 1, label: 'Face Scan', desc: 'Appearance score · style archetype · grooming guide', href: '/face-scan', done: step1Done },
                { step: 2, label: 'Voice Check', desc: 'Voice confidence score · tone coaching', href: '/voice-check', done: step2Done },
                { step: 3, label: 'Style Profile', desc: 'Your archetype, colors, and ideal look image', href: '/style-profile', done: step3Done },
              ] as const).map(({ step, label, desc, href, done }) => {
                const isActive = activeStep === step;
                return (
                  <Link key={step} href={isActive ? href : '#'} className={isActive ? '' : 'pointer-events-none'}>
                    <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${isActive ? 'bg-violet-900/25 border border-violet-700/50 hover:border-violet-600' : done ? 'bg-slate-800/30 border border-slate-700/30' : 'opacity-35'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${done ? 'bg-emerald-600 text-white' : isActive ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                        {done ? <CheckCircle2 size={14} /> : step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${done ? 'text-emerald-400' : isActive ? 'text-white' : 'text-slate-500'}`}>{label}</p>
                        <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
                      </div>
                      {isActive && <ChevronRight size={14} className="text-violet-400 shrink-0" />}
                      {!isActive && !done && <Lock size={11} className="text-slate-700 shrink-0" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-3 py-1">
            <div className="flex -space-x-2">
              {['🧑🏻', '👨🏽', '🧔🏼', '👦🏾', '🧑🏾'].map((emoji, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-sm">{emoji}</div>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              <span className="text-white font-semibold">4,200+ men</span> are levelling up with PresenceAI
            </p>
          </div>

          {/* What you'll unlock — teaser grid */}
          <div>
            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider mb-2 px-1">Unlocks after your scan</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { label: 'Style Archetype', preview: '"Dark Academic"', icon: Sparkles, color: 'text-violet-400' },
                { label: 'Perception Score', preview: 'Swipe 62% · Reply 74%', icon: Eye, color: 'text-pink-400' },
                { label: 'Voice Score', preview: '78 / 100', icon: Mic, color: 'text-sky-400' },
                { label: 'Bio Rewrites', preview: '3 tones, ready to use', icon: TrendingUp, color: 'text-amber-400' },
              ] as const).map(({ label, preview, icon: Icon, color }) => (
                <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 relative overflow-hidden">
                  <div className="blur-sm select-none pointer-events-none">
                    <Icon size={14} className={`${color} mb-1.5`} />
                    <p className="text-[11px] text-slate-400 font-semibold">{label}</p>
                    <p className="text-sm text-white font-bold mt-0.5">{preview}</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-slate-900/70 rounded-lg px-2 py-1 flex items-center gap-1">
                      <Lock size={9} className="text-slate-500" />
                      <p className="text-[10px] text-slate-500">Scan to unlock</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily coaching tip — immediate value, no scan needed */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Flame size={13} className="text-amber-400" />
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Free Daily Tip</p>
            </div>
            <DailyTips initialXp={xp} initialStreak={streak} />
          </div>
        </>
      ) : (
        <>
          {/* ── RETURNING USER: show next-step banner if still in onboarding ── */}
          {inOnboarding && (
            <div className="rounded-3xl border border-violet-500/50 bg-gradient-to-br from-violet-950/70 via-slate-900 to-slate-950 p-5 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-violet-400">Your next step · {activeStep} of 3</span>
                </div>
                <p className="text-xl font-black text-white leading-tight mb-4">
                  {activeStep === 1 ? 'Scan your face to get your Look score' : activeStep === 2 ? 'Record 30 seconds to get your Voice score' : 'Unlock your Style Profile & ideal look'}
                </p>
                <Link href={activeStep === 1 ? '/face-scan' : activeStep === 2 ? '/voice-check' : '/style-profile'}>
                  <Button className="w-full bg-violet-600 hover:bg-violet-500 font-bold h-11 gap-2">
                    {activeStep === 1 ? <Camera size={16} /> : activeStep === 2 ? <Mic size={16} /> : <Sparkles size={16} />}
                    {activeStep === 1 ? 'Start Face Scan' : activeStep === 2 ? 'Start Voice Check' : 'Open Style Profile'} →
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Scores + how to raise each */}
          <ScoreBoard total={dri} goalLabel={goalLabel} cards={scoreCards} />

          {/* Ideal self — image + avatar */}
          <IdealSelfCard hasStyleProfile={step3Done} />

          {/* Today's mission */}
          <MissionCard />

          {/* Best Version — compact tiles */}
          <BestVersionCard />

          {/* Tools */}
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2 px-1">Tools</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { href: '/perception', icon: Eye, label: 'Perception', color: 'text-rose-400' },
                { href: '/face-scan', icon: Camera, label: 'Face Scan', color: 'text-violet-400' },
                { href: '/voice-check', icon: Mic, label: 'Voice', color: 'text-sky-400' },
                { href: '/style-profile', icon: Sparkles, label: 'Style', color: 'text-amber-400' },
                { href: '/chat-coach', icon: MessageCircleHeart, label: 'Chat Coach', color: 'text-pink-400' },
                { href: '/date-prep', icon: Heart, label: 'Date Prep', color: 'text-red-400' },
              ].map(({ href, icon: Icon, label, color }) => (
                <Link key={href} href={href}>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/50 py-3 flex flex-col items-center gap-1.5 hover:border-slate-600 transition-colors">
                    <Icon size={18} className={color} />
                    <p className="text-xs font-semibold text-white">{label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Daily coaching tips */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-4">Daily Coaching</p>
            <DailyTips initialXp={xp} initialStreak={streak} />
          </div>
        </>
      )}
    </div>
  );
}
