import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Play, CheckCircle2, ChevronRight, Flame, TrendingUp, Eye, ScanFace, Mic, Sparkles, MessageCircleHeart, Heart, Lock, ShieldCheck, XCircle } from 'lucide-react';
import { PERSONAS } from '@/lib/personas';
import { MemberCount, Testimonials, Transformation, PainSection, ScienceSection, ExampleResult } from '@/components/landing/ProofSections';

// Member count is read from the DB — refresh hourly rather than per request
export const revalidate = 3600;
import { PresenceLogo } from '@/components/ui/PresenceLogo';

/* ── Mock visuals ── */

function HeroVisual() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="grid grid-cols-[0.8fr_1fr] gap-3 items-end">
        {/* Before */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 aspect-[4/5] opacity-90">
          <Image src="/hero/model-before.jpg" alt="Everyday selfie" fill sizes="200px" className="object-cover grayscale-[30%]" priority />
          <span className="absolute top-2 left-2 text-[10px] font-bold bg-slate-950/80 text-slate-300 rounded-full px-2 py-0.5">Before</span>
          <div className="absolute bottom-2 inset-x-2 rounded-lg bg-slate-950/85 px-2 py-1.5 text-center">
            <p className="text-lg font-black text-amber-400 leading-none">31%</p>
            <p className="text-[9px] text-slate-400 uppercase tracking-wide">Swipe odds</p>
          </div>
        </div>

        {/* After */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-violet-500 aspect-[4/5] shadow-2xl shadow-violet-900/50">
          <Image src="/hero/model-after.jpg" alt="Same man, styled as his Ideal Look" fill sizes="260px" className="object-cover" priority />
          <span className="absolute top-2 left-2 text-[10px] font-bold bg-violet-600 text-white rounded-full px-2 py-0.5">Ideal Look</span>
          <div className="absolute bottom-2 inset-x-2 rounded-lg bg-slate-950/85 px-2 py-1.5 text-center">
            <p className="text-2xl font-black text-emerald-400 leading-none">74%</p>
            <p className="text-[9px] text-slate-400 uppercase tracking-wide">Swipe odds</p>
          </div>
        </div>
      </div>

      {/* The fix */}
      <div className="relative -mt-3 mx-3 rounded-2xl border border-amber-600/60 bg-slate-950/95 backdrop-blur p-3.5 shadow-xl">
        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
          <Zap size={10} /> What changed
        </p>
        <div className="flex flex-wrap gap-1.5">
          {['Side-part crop', 'Ivory linen shirt', 'Gold aviators', 'Chin up, warm smile'].map((t) => (
            <span key={t} className="text-[11px] font-semibold text-white bg-slate-800 border border-slate-700 rounded-full px-2.5 py-1">{t}</span>
          ))}
        </div>
      </div>
      <p className="text-[10px] text-slate-600 text-center mt-2">Illustration — AI-generated model, not a real user. Numbers are illustrative.</p>
    </div>
  );
}

function MockMissionCard() {
  return (
    <div className="rounded-2xl border border-amber-700/40 bg-gradient-to-br from-amber-950/40 to-slate-900 p-5 w-full max-w-sm shadow-2xl">
      <div className="flex items-center gap-2 mb-1">
        <Zap size={13} className="text-amber-400" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Today&apos;s Mission · Wednesday</span>
      </div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-white font-bold text-sm">Voice Challenge</p>
        <span className="text-[10px] text-amber-400 bg-amber-900/40 border border-amber-800/30 rounded-full px-2 py-0.5 font-bold">+25 XP</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Record yourself ordering a coffee. No fillers. Confident tone. Send us the clip.
      </p>
      <p className="text-[10px] text-slate-500 mb-3">
        Your filler rate is 8%. Real-world pressure is where it drops to 2%.
      </p>
      <div className="w-full h-9 rounded-xl bg-amber-600/80 flex items-center justify-center gap-2">
        <CheckCircle2 size={13} className="text-white" />
        <span className="text-xs text-white font-semibold">Mark Done</span>
      </div>
    </div>
  );
}

function MockRoadmap() {
  const weeks = [
    { n: 1, label: 'Appearance Foundation', done: true },
    { n: 2, label: 'Voice & Presence', done: true },
    { n: 3, label: 'Confidence & Body Language', current: true },
    { n: 4, label: 'Conversation Skills', locked: true },
  ];
  return (
    <div className="rounded-2xl border border-violet-700/40 bg-gradient-to-br from-violet-950/40 to-slate-900 p-5 w-full max-w-sm shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">90-Day Plan</p>
          <p className="text-white font-bold text-sm mt-0.5">Dating Goal · Week 3</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-white">72</p>
          <p className="text-[10px] text-emerald-400 font-bold">+4 this week ↑</p>
        </div>
      </div>
      <div className="space-y-2">
        {weeks.map(w => (
          <div key={w.n} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
            w.current
              ? 'border-violet-500/60 bg-violet-900/30'
              : w.done
              ? 'border-emerald-800/30 bg-emerald-950/10'
              : 'border-slate-800 bg-slate-900/30 opacity-50'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${
              w.done ? 'bg-emerald-500 text-white' : w.current ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-600'
            }`}>
              {w.done ? '✓' : w.n}
            </div>
            <p className={`text-xs font-medium ${w.done ? 'text-emerald-400' : w.current ? 'text-white' : 'text-slate-600'}`}>
              {w.label}
            </p>
            {w.current && <span className="ml-auto text-[9px] text-violet-400 font-bold bg-violet-900/50 rounded-full px-1.5 py-0.5">NOW</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">

      {/* Nav */}
      <nav className="border-b border-slate-800/60 px-5 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <PresenceLogo href="/" size="sm" />
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">Sign in</Button>
          </Link>
          <Link href="/login">
            <Button size="sm" className="bg-violet-600 hover:bg-violet-500 gap-1.5">
              Try it free <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-5 pt-8 pb-12 md:pt-14 md:pb-16">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">

          {/* Left copy */}
          <div className="flex-1 text-center md:text-left">
            <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-violet-700/50 bg-violet-900/20 px-4 py-1.5 text-xs text-violet-300 font-semibold mb-4">
              <Play size={11} className="fill-violet-400 text-violet-400" />
              See your first impression before you send it
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.05] mb-4">
              See how people actually <span className="gradient-text">see you.</span>
            </h1>

            <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-6 max-w-xl">
              Get your <span className="text-white font-bold">swipe odds</span>, the{' '}
              <span className="text-white font-bold">one fix</span> that raises them, and a coach for your
              look, voice, and texts.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start mb-5">
              <Link href="/login">
                <Button size="lg" className="bg-violet-600 hover:bg-violet-500 gap-2 text-base px-8 h-14">
                  <Play size={16} className="fill-white text-white" />
                  Try it free
                </Button>
              </Link>
              <Link href="/login" className="hidden sm:block">
                <Button size="lg" variant="outline" className="gap-2 h-14 text-base">
                  Sign in
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-slate-400">
              {['First check free — no card', 'Results in 2 minutes', 'Photos stay private'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500" /> {t}
                </span>
              ))}
            </div>
            <MemberCount />
          </div>

          {/* Right — perception check phone mockup */}
          <div className="flex-1 flex justify-center">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* ── PROOF STRIP ── */}
      <div className="border-y border-slate-800/60 bg-slate-900/40 py-5 px-5">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-center">
          {[
            { num: `${PERSONAS.length} personas`, desc: 'simulate real reactions' },
            { num: '2 min', desc: 'to your first result' },
            { num: '3 days', desc: 'full access, free' },
            { num: '₹79', desc: 'per week after · cancel anytime' },
          ].map(({ num, desc }) => (
            <div key={num}>
              <p className="text-2xl font-black gradient-text">{num}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>


      {/* ── WHAT YOU GET ── */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">What you get</h2>
          <p className="text-slate-400">Every tool answers one question. In under 2 minutes.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Eye, color: 'text-violet-400', border: 'border-violet-700/50', bg: 'bg-violet-950/30', name: 'Perception Check', q: 'Would they swipe right?', a: 'Swipe & reply odds + the #1 fix', hero: true },
            { icon: ScanFace, color: 'text-sky-400', border: 'border-sky-800/40', bg: 'bg-sky-950/20', name: 'Face Scan', q: 'What actually suits me?', a: 'Haircut, colors, grooming for your face' },
            { icon: Mic, color: 'text-emerald-400', border: 'border-emerald-800/40', bg: 'bg-emerald-950/20', name: 'Voice Check', q: 'Do I sound confident?', a: 'Filler words counted + drills to fix them' },
            { icon: Sparkles, color: 'text-amber-400', border: 'border-amber-800/40', bg: 'bg-amber-950/20', name: 'Style Profile', q: 'What\'s my look?', a: 'Your archetype, what to wear, your ideal look' },
            { icon: MessageCircleHeart, color: 'text-pink-400', border: 'border-pink-800/40', bg: 'bg-pink-950/20', name: 'Chat Coach', q: 'What do I text back?', a: 'Their interest level + 3 ready replies' },
            { icon: Heart, color: 'text-rose-400', border: 'border-rose-800/40', bg: 'bg-rose-950/20', name: 'Date Prep', q: 'How do I nail the date?', a: 'Outfit, opener, and topics they\'ll love' },
          ].map(({ icon: Icon, color, border, bg, name, q, a, hero }) => (
            <div key={name} className={`rounded-2xl border ${border} ${bg} p-6 ${hero ? 'ring-1 ring-violet-500/40' : ''}`}>
              <div className="flex items-center gap-2 mb-3">
                <Icon size={18} className={color} />
                <span className={`text-xs font-bold uppercase tracking-wider ${color}`}>{name}</span>
              </div>
              <p className="text-white font-black text-xl leading-snug mb-1.5">{q}</p>
              <p className="text-slate-400 text-sm">→ {a}</p>
            </div>
          ))}
        </div>
      </section>

      <PainSection />
      <ScienceSection />

      <ExampleResult />
      <Transformation />
      <Testimonials />

      {/* ── MISSION FEATURE ── */}
      <section className="border-y border-slate-800/60 bg-slate-900/30 py-20 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="flex-1 flex justify-center">
            <MockMissionCard />
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-700/40 bg-amber-900/20 px-3 py-1 text-xs text-amber-400 font-semibold mb-4">
              <Zap size={11} /> Daily Missions
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-5">
              One mission.<br />
              <span className="text-amber-400">Every day.</span><br />
              Always specific to you.
            </h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              Not a tip to read — a real action, aimed at your weakest area.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Mon → Grooming or appearance challenge',
                'Wed → Voice challenge (record yourself)',
                'Fri → Dating or conversation challenge',
                'Sun → Weekly reflection + next week unlocks',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <ChevronRight size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/login">
              <Button className="bg-amber-600 hover:bg-amber-500 gap-2">
                <Flame size={15} /> Start my 90-day plan
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── ROADMAP FEATURE ── */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 flex justify-center">
            <MockRoadmap />
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-700/40 bg-violet-900/20 px-3 py-1 text-xs text-violet-400 font-semibold mb-4">
              <TrendingUp size={11} /> 90-Day Roadmap
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-5">
              A structured plan<br />
              <span className="gradient-text">built around your goal</span><br />
              — not a feature list.
            </h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              Pick your goal — dating, career, or confidence. Get a week-by-week plan and watch your score climb.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Dating goal: 8-week plan from grooming to approaching',
                'Career goal: appearance → voice → interview practice',
                'Monthly reassessment: before/after score comparison',
                'Roadmap adjusts based on your progress each week',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <ChevronRight size={15} className="text-violet-400 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/login">
              <Button variant="outline" className="gap-2 border-violet-700/50 text-violet-300 hover:bg-violet-900/20">
                See my roadmap <ArrowRight size={15} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="border-t border-slate-800/60 bg-slate-900/30 py-16 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-2">How it works</h2>
          <p className="text-slate-500 text-sm mb-10">Perception check in 2 minutes. Coaching for 90 days.</p>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Upload photo + bio', desc: 'Pick a persona. See swipe odds, reply odds, and their honest first read.', color: 'text-violet-400', border: 'border-violet-800/40' },
              { step: '02', title: 'Get the fix', desc: 'Photo and bio suggestions built for exactly what that persona reacts to.', color: 'text-amber-400', border: 'border-amber-800/40' },
              { step: '03', title: 'Apply & re-run', desc: 'See the before/after — swipe and reply odds moving in real numbers.', color: 'text-sky-400', border: 'border-sky-800/40' },
              { step: '04', title: 'Keep improving', desc: 'Daily missions and coaching build on what your perception checks reveal.', color: 'text-emerald-400', border: 'border-emerald-800/40' },
            ].map(({ step, title, desc, color, border }) => (
              <div key={step} className={`rounded-2xl border ${border} bg-slate-900/50 p-5 text-left`}>
                <p className={`text-3xl font-black mb-3 ${color}`}>{step}</p>
                <p className="text-white font-bold text-sm mb-1.5">{title}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 px-5">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2">Try everything free for 3 days</h2>
            <p className="text-slate-400">Then less than a coffee a week.</p>
          </div>
          <div className="rounded-3xl border border-violet-600/60 bg-gradient-to-br from-violet-950/50 to-slate-900 p-6 shadow-2xl shadow-violet-950/40">
            <div className="flex items-baseline justify-center gap-2 mb-1">
              <span className="text-5xl font-black text-white">₹0</span>
              <span className="text-slate-400">today</span>
            </div>
            <p className="text-center text-slate-300 mb-6">then <span className="text-white font-bold">₹79/week</span> · cancel anytime</p>

            <div className="space-y-3 mb-6">
              {[
                { day: 'Today', text: 'Add card or UPI — ₹0 charged', dot: 'bg-emerald-500' },
                { day: 'Days 1–3', text: 'Every tool, unlimited', dot: 'bg-violet-500' },
                { day: 'Day 4', text: '₹79/week starts — or cancel before & pay nothing', dot: 'bg-slate-500' },
              ].map(({ day, text, dot }) => (
                <div key={day} className="flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${dot} mt-1.5 shrink-0`} />
                  <p className="text-sm text-slate-300"><span className="text-white font-bold">{day}</span> — {text}</p>
                </div>
              ))}
            </div>

            <ul className="grid grid-cols-2 gap-x-3 gap-y-2 mb-6">
              {['Unlimited Perception Checks', 'Face Scan', 'Voice Check', 'Your Ideal Look', 'Chat Coach', 'Date Prep'].map((f) => (
                <li key={f} className="flex items-center gap-1.5 text-xs text-slate-300">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>

            <Link href="/login">
              <Button size="lg" className="w-full h-14 bg-violet-600 hover:bg-violet-500 text-base font-bold gap-2">
                Try it free <ArrowRight size={18} />
              </Button>
            </Link>
            <p className="text-[11px] text-slate-500 text-center mt-3">Cards · UPI AutoPay · Secured by Razorpay</p>
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="border-y border-slate-800/60 bg-slate-900/30 py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-white text-center mb-10">Built to be trusted</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Lock, title: 'Private by design', desc: 'Only you can see your photos and results. We never sell your data.' },
              { icon: ShieldCheck, title: 'Secure payments', desc: 'Checkout runs on Razorpay. We never see your card number.' },
              { icon: XCircle, title: 'Cancel in 2 taps', desc: 'Settings → Cancel. No calls, no emails, no catch.' },
              { icon: Heart, title: 'Honest, never harsh', desc: 'We don\'t rate your looks. We show what changes how people respond.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                <Icon size={20} className="text-emerald-400 mb-3" />
                <p className="text-white font-bold text-sm mb-1">{title}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 px-5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-white text-center mb-8">Questions</h2>
          <div className="space-y-2">
            {[
              { q: 'Will I be charged today?', a: 'No. You pay ₹0 today. Your first ₹79 charge is on Day 4 — only if you don\'t cancel.' },
              { q: 'How do I cancel?', a: 'Settings → Cancel subscription. It takes 10 seconds, and you keep access until the period ends.' },
              { q: 'Can I try it without a card?', a: 'Yes. Your first Perception Check is free — no card needed. Add a card only when you want everything unlocked.' },
              { q: 'Are these real people reacting?', a: 'They\'re AI personas modelled on how real people swipe — different ages, cities and tastes. Fast, private, and nobody you know sees your photo.' },
              { q: 'Is my photo safe?', a: 'Your photos are visible only to you. You can ask us to delete your account and all data at any time.' },
            ].map(({ q, a }) => (
              <details key={q} className="group rounded-xl border border-slate-800 bg-slate-900/40 px-5 py-4">
                <summary className="flex items-center justify-between cursor-pointer list-none text-white font-semibold text-sm">
                  {q}
                  <ChevronRight size={16} className="text-slate-500 transition-transform group-open:rotate-90 shrink-0" />
                </summary>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-5 text-center border-t border-slate-800/60">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            See how people<br />
            <span className="gradient-text">actually see you.</span>
          </h2>
          <p className="text-slate-400 text-lg mb-8">Your first check takes 2 minutes. It&apos;s free.</p>
          <Link href="/login">
            <Button size="lg" className="bg-violet-600 hover:bg-violet-500 gap-2 text-base px-10 py-6">
              <Play size={16} className="fill-white text-white" />
              Try it free <ArrowRight size={18} />
            </Button>
          </Link>
          <p className="text-xs text-slate-500 mt-4">First check free · Full access 3 days free · then ₹79/week · cancel anytime</p>
        </div>
      </section>

      <footer className="border-t border-slate-800/60 py-6 text-center text-sm text-slate-600">
        <p>© {new Date().getFullYear()} PresenceAI · Built for men who want to show up better</p>
        <div className="flex gap-4 justify-center mt-2">
          <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
