import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Play, CheckCircle2, ChevronRight, Flame, TrendingUp, Eye, ScanFace, Mic, Sparkles, MessageCircleHeart, Heart } from 'lucide-react';
import { PERSONAS } from '@/lib/personas';
import { PresenceLogo } from '@/components/ui/PresenceLogo';

/* ── Mock visuals ── */

function MockPerceptionPreview() {
  return (
    <div className="relative mx-auto w-56">
      {/* Phone frame */}
      <div className="rounded-[2.5rem] border-4 border-slate-700 bg-slate-900 overflow-hidden shadow-2xl shadow-violet-950/40">
        {/* Screen */}
        <div className="bg-slate-950 aspect-[9/16] relative flex flex-col justify-end pb-6 px-4">
          {/* Dark background with subtle glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
            <div className="absolute inset-x-0 top-10 flex justify-center">
              <div className="w-32 h-32 rounded-full bg-violet-500/10 blur-2xl" />
            </div>
          </div>

          {/* Persona badge */}
          <div className="relative z-10 flex items-center justify-center gap-1.5 bg-black/50 rounded-full px-2.5 py-1 mx-auto mb-4 mt-8">
            <span className="text-[10px] text-white font-semibold">23F, Delhi is viewing your profile…</span>
          </div>

          {/* Stat readouts */}
          <div className="relative z-10 grid grid-cols-2 gap-2 mb-4">
            <div className="bg-black/60 backdrop-blur rounded-xl px-3 py-2.5 text-center border border-slate-700/50">
              <p className="text-lg font-black text-emerald-400">62%</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-wide">Swipe</p>
            </div>
            <div className="bg-black/60 backdrop-blur rounded-xl px-3 py-2.5 text-center border border-slate-700/50">
              <p className="text-lg font-black text-sky-400">74%</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-wide">Reply</p>
            </div>
          </div>

          {/* Narrative snippet */}
          <div className="relative z-10 bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-slate-700/50 mb-3">
            <p className="text-xs text-white leading-relaxed italic">
              &ldquo;Your first photo reads a little guarded — a warmer smile would help…&rdquo;
            </p>
          </div>

          {/* Watermark */}
          <div className="relative z-10 flex items-center gap-1.5 bg-black/50 rounded-full px-2.5 py-1 mx-auto">
            <div className="w-3 h-3 rounded-full bg-violet-500" />
            <span className="text-[9px] text-slate-300 font-semibold">PresenceAI</span>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -left-8 top-12 bg-emerald-500/90 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl shadow-lg whitespace-nowrap">
        ✓ AI persona simulation
      </div>
      <div className="absolute -right-10 top-28 bg-violet-600/90 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl shadow-lg whitespace-nowrap">
        {PERSONAS.length} real personas
      </div>
      <div className="absolute -left-10 bottom-16 bg-amber-500/90 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl shadow-lg whitespace-nowrap">
        +18% after 1 change
      </div>
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
              Try free <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-20 md:pt-24">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">

          {/* Left copy */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-700/50 bg-violet-900/20 px-4 py-1.5 text-xs text-violet-300 font-semibold mb-6">
              <Play size={11} className="fill-violet-400 text-violet-400" />
              See your first impression before you send it
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.08] mb-5">
              See how people<br />
              actually<br />
              <span className="gradient-text">see you.</span>
            </h1>

            <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
              Get your <span className="text-white font-bold">swipe odds</span>, the{' '}
              <span className="text-white font-bold">one fix</span> that raises them, and a coach for your
              look, voice, and texts.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start mb-8">
              <Link href="/login">
                <Button size="lg" className="bg-violet-600 hover:bg-violet-500 gap-2 text-base px-8 h-14">
                  <Play size={16} className="fill-white text-white" />
                  Run My Perception Check
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="gap-2 h-14 text-base">
                  Sign in
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-slate-400">
              {['Free daily checks', 'Ready in ~2 minutes', 'Built for Indian men'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — perception check phone mockup */}
          <div className="flex-1 flex justify-center">
            <MockPerceptionPreview />
          </div>
        </div>
      </section>

      {/* ── PROOF STRIP ── */}
      <div className="border-y border-slate-800/60 bg-slate-900/40 py-5 px-5">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-center">
          {[
            { num: `${PERSONAS.length} personas`, desc: 'simulate real reactions' },
            { num: '90 days', desc: 'structured coaching plan' },
            { num: '7 AI tools', desc: 'perception · voice · style · practice' },
            { num: '₹79', desc: 'per week · cancel anytime' },
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

      {/* ── PRICING STRIP ── */}
      <section className="py-16 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-slate-500 text-sm mb-6">Simple pricing. Cancel anytime.</p>
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
            {[
              { label: 'Weekly', price: '₹149', period: '/week', note: 'Try it out' },
              { label: 'Monthly', price: '₹499', period: '/month', note: 'Most popular', highlight: true },
              { label: 'Annual', price: '₹1,999', period: '/year', note: 'Save 67%' },
            ].map(({ label, price, period, note, highlight }) => (
              <div key={label} className={`rounded-2xl border p-4 text-center ${highlight ? 'border-violet-600 bg-violet-950/30' : 'border-slate-800 bg-slate-900/50'}`}>
                {highlight && <p className="text-[10px] text-violet-400 font-bold uppercase tracking-wider mb-1">Best value</p>}
                <p className="text-white font-bold text-sm">{label}</p>
                <p className={`text-2xl font-black mt-1 ${highlight ? 'text-violet-300' : 'text-white'}`}>{price}</p>
                <p className="text-xs text-slate-500">{period}</p>
                <p className="text-[10px] text-slate-500 mt-1">{note}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-4">3-day free trial · UPI AutoPay · Cancel before Day 4, pay nothing</p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-5 text-center border-t border-slate-800/60">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            See how people<br />
            <span className="gradient-text">actually see you. Free.</span>
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Upload a photo and bio. Get your first perception check free, today. Takes 2 minutes.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-violet-600 hover:bg-violet-500 gap-2 text-base px-10 py-6">
              <Play size={16} className="fill-white text-white" />
              Run My Perception Check <ArrowRight size={18} />
            </Button>
          </Link>
          <p className="text-xs text-slate-600 mt-4">Free daily checks · No credit card required</p>
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
