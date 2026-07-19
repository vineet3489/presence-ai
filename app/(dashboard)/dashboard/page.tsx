import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { compositeScore } from '@/lib/scoring/presenceScore';
import { MissionCard, MissionStreak } from '@/components/dashboard/MissionCard';
import { DailyTips } from '@/components/dashboard/DailyTips';
import { Button } from '@/components/ui/button';
import {
  Camera, Mic, Heart, MessageCircleHeart, Sparkles, Shirt,
  ChevronRight, TrendingUp, Lock, CheckCircle2, Flame,
} from 'lucide-react';
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
  const isSubscribed = true;

  const goalLabel = primaryGoal === 'dating' ? 'Dating Readiness' : primaryGoal === 'career' ? 'Career Readiness' : 'Confidence';

  const hasFaceScan = !!appearanceSession;
  const hasVoiceCheck = !!voiceSession;
  const isNewUser = !hasFaceScan && !hasVoiceCheck;
  const hasScans = hasFaceScan || hasVoiceCheck;

  // Journey step state
  const step1Done = hasFaceScan;
  const step2Done = hasVoiceCheck;
  const step3Done = !!dateSession;
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
                { step: 3, label: 'Style Profile + AI Avatar', desc: 'Ideal look image · talking AI video of you', href: '/style-profile', done: step3Done },
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
                { label: 'AI Avatar Video', preview: 'You, scripted + styled', icon: Camera, color: 'text-pink-400' },
                { label: 'Voice Score', preview: '78 / 100', icon: Mic, color: 'text-sky-400' },
                { label: 'Outfit Picks', preview: '3 looks built for you', icon: Shirt, color: 'text-amber-400' },
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
            <Link href={activeStep === 1 ? '/face-scan' : activeStep === 2 ? '/voice-check' : '/style-profile'}>
              <div className="rounded-2xl border border-violet-700/50 bg-gradient-to-r from-violet-950/50 to-slate-900 p-4 flex items-center gap-3 group hover:border-violet-600/70 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shrink-0">
                  {activeStep === 1 ? <Camera size={16} className="text-white" /> : activeStep === 2 ? <Mic size={16} className="text-white" /> : <Sparkles size={16} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">Step {activeStep} of 3</p>
                  <p className="text-sm font-semibold text-white truncate">
                    {activeStep === 1 ? 'Do your Face Scan to unlock your score' : activeStep === 2 ? 'Voice Check — unlock your voice coaching' : 'Generate your Style Profile + AI Avatar'}
                  </p>
                </div>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-violet-400 shrink-0 transition-colors" />
              </div>
            </Link>
          )}

          {/* Today's mission */}
          <MissionCard />

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
              { href: '/face-scan', icon: Camera, label: 'Face Scan', color: 'text-violet-400', desc: hasFaceScan ? 'Re-scan' : 'Start here' },
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
        </>
      )}
    </div>
  );
}
