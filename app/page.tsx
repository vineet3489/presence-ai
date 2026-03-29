import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Camera, Mic, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

/* ─── Mock output cards shown in the hero / feature sections ─── */

function MockActionPlan() {
  const fixes = [
    { icon: '✦', label: 'Grooming', color: '#a78bfa', text: 'Clean up the beard line — it\'s softening your jaw' },
    { icon: '◈', label: 'Posture', color: '#38bdf8', text: 'Drop your shoulders — you\'re carrying tension visibly' },
    { icon: '◉', label: 'Voice', color: '#fbbf24', text: 'Cut the "um"s — pause instead, you\'ll sound 10× sharper' },
  ];
  return (
    <div className="rounded-2xl border border-amber-700/40 bg-gradient-to-br from-amber-950/40 to-slate-900 p-5 w-full max-w-sm shadow-2xl">
      <div className="flex items-center gap-2 mb-3">
        <Zap size={14} className="text-amber-400" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Your Action Plan</span>
      </div>
      <p className="text-white font-bold text-sm mb-4">Fix these to get more dates</p>
      <div className="space-y-2">
        {fixes.map((f, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-sm shrink-0" style={{ color: f.color }}>{f.icon}</span>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{f.label}</p>
              <p className="text-xs text-white font-medium leading-snug">{f.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockStyleCard() {
  return (
    <div className="rounded-2xl border border-violet-700/50 bg-gradient-to-br from-violet-950/50 to-slate-900 overflow-hidden w-full max-w-[220px] shadow-2xl">
      {/* Gradient placeholder for the look image */}
      <div className="h-52 bg-gradient-to-br from-violet-900/60 via-slate-800 to-slate-900 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/30 to-slate-700 border-2 border-violet-500/40" />
          <div className="w-8 h-16 rounded-lg bg-gradient-to-b from-violet-500/20 to-slate-700/40 border border-violet-500/20" />
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <span className="text-[10px] text-violet-300 font-semibold bg-violet-900/60 border border-violet-700/40 rounded-full px-2 py-0.5">AI Generated · Your exact face</span>
        </div>
      </div>
      <div className="p-3">
        <p className="text-[10px] text-violet-400 font-bold uppercase tracking-wider mb-0.5">Your Archetype</p>
        <p className="text-white font-bold text-sm">The Sharp Minimalist</p>
        <p className="text-slate-500 text-xs mt-0.5">Navy · Charcoal · Bone</p>
      </div>
    </div>
  );
}

function MockScoreCard() {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 flex items-center gap-4 w-full max-w-xs shadow-xl">
      <div className="relative w-16 h-16 shrink-0">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="26" fill="none" stroke="#1e1b4b" strokeWidth="5" />
          <circle cx="32" cy="32" r="26" fill="none" stroke="#8b5cf6" strokeWidth="5"
            strokeLinecap="round" strokeDasharray="163.4" strokeDashoffset="40.8" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-black text-white">75</span>
        </div>
      </div>
      <div>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Presence Score</p>
        <p className="text-violet-300 font-bold text-sm">Strong</p>
        <p className="text-slate-400 text-xs mt-1">+12 pts last week</p>
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
        <span className="text-xl font-black gradient-text">PresenceAI</span>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">Sign in</Button>
          </Link>
          <Link href="/login">
            <Button size="sm" className="bg-violet-600 hover:bg-violet-500 gap-1.5">
              Get started free <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-20 md:pt-24">
        <div className="flex flex-col md:flex-row items-center gap-12">

          {/* Left copy */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-700/50 bg-violet-900/20 px-4 py-1.5 text-xs text-violet-300 font-semibold mb-6">
              <Zap size={12} />
              Know exactly what to fix — in 60 seconds
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.08] mb-5">
              Stop guessing.<br />
              <span className="gradient-text">See your fixes.</span><br />
              Look the part.
            </h1>

            <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
              Upload a photo → get 3 specific things to fix.
              AI styles you in your ideal look.
              Walk into every room — and every date — with an unfair advantage.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start mb-8">
              <Link href="/login">
                <Button size="lg" className="bg-violet-600 hover:bg-violet-500 gap-2 text-base px-8">
                  Scan my look free <ArrowRight size={16} />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-slate-400">
              {['No credit card', 'Results in 30 seconds', 'AI built for Indian men'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — mock output preview */}
          <div className="flex-1 flex flex-col items-center gap-4 w-full">
            <div className="flex gap-4 items-start justify-center w-full">
              <MockStyleCard />
              <div className="flex flex-col gap-4 pt-6">
                <MockActionPlan />
                <MockScoreCard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF STRIP ── */}
      <div className="border-y border-slate-800/60 bg-slate-900/40 py-5 px-5">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-center">
          {[
            { num: '3 fixes', desc: 'found in every scan' },
            { num: '60 sec', desc: 'to your first result' },
            { num: 'AI look', desc: 'styled just for you' },
            { num: '100%', desc: 'based on your face' },
          ].map(({ num, desc }) => (
            <div key={num}>
              <p className="text-2xl font-black gradient-text">{num}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── STYLE CHECK FEATURE (hero feature) ── */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="flex flex-col md:flex-row items-center gap-12">

          {/* Visual */}
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <div className="rounded-2xl border border-violet-700/40 bg-gradient-to-br from-violet-950/60 to-slate-900 p-6 w-72">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-violet-400" />
                  <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">Style Profile</span>
                </div>
                {/* Fake look image */}
                <div className="rounded-xl h-48 bg-gradient-to-br from-violet-900/60 via-slate-800/80 to-indigo-900/40 flex items-center justify-center mb-3 border border-violet-800/30 overflow-hidden relative">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-600/10 to-transparent" />
                  <div className="flex flex-col items-center gap-1.5 z-10">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-400/30 to-slate-600 border-2 border-violet-500/40" />
                    <div className="w-10 h-20 rounded-lg bg-gradient-to-b from-slate-600/60 to-slate-800/40 border border-slate-600/30" />
                  </div>
                  <div className="absolute bottom-2 inset-x-2 text-center">
                    <span className="text-[10px] text-violet-300 bg-violet-900/70 border border-violet-700/40 rounded-full px-2 py-0.5">Generated from your face scan</span>
                  </div>
                </div>
                <p className="text-white font-bold">The Sharp Minimalist</p>
                <p className="text-slate-400 text-xs mt-1">Navy · Charcoal · Bone · Cognac</p>
                <div className="flex gap-1 mt-2">
                  {['#1a2a4a', '#374151', '#e8e0d4', '#9d4b2a'].map(c => (
                    <div key={c} className="w-5 h-5 rounded-full border border-white/10" style={{ background: c }} />
                  ))}
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                Your exact face ✓
              </div>
            </div>
          </div>

          {/* Copy */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-700/40 bg-violet-900/20 px-3 py-1 text-xs text-violet-400 font-semibold mb-4">
              <Sparkles size={11} /> Style Check
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-5">
              See yourself in your<br />
              <span className="gradient-text">ideal look</span> — AI-styled<br />
              for your exact face
            </h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              Upload one photo. Presence AI identifies your face shape, skin tone, and vibe —
              then generates a full style archetype with colors, outfits, and an AI image of
              <em className="text-white not-italic font-semibold"> you</em> in your ideal look.
              Not a random model. You.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Your personal style archetype (e.g. The Sharp Minimalist)',
                'Exact colors that work for your skin tone',
                'AI-generated image of you in your ideal outfit',
                'Hair, grooming & expression coaching',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <ChevronRight size={15} className="text-violet-400 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/login">
              <Button className="bg-violet-600 hover:bg-violet-500 gap-2">
                <Camera size={16} /> Get my style profile free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── ACTION PLAN FEATURE ── */}
      <section className="border-y border-slate-800/60 bg-slate-900/30 py-20 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center gap-12">

          {/* Visual */}
          <div className="flex-1 flex justify-center">
            <MockActionPlan />
          </div>

          {/* Copy */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-700/40 bg-amber-900/20 px-3 py-1 text-xs text-amber-400 font-semibold mb-4">
              <Zap size={11} /> Action Plan
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-5">
              Not a generic report.<br />
              <span className="text-amber-400">3 specific fixes</span><br />
              ranked by impact.
            </h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              Most apps just give you a score. Presence AI tells you
              <em className="text-white not-italic font-semibold"> exactly what to change</em> —
              grooming, posture, expression, voice — ranked by what will actually move the needle on
              your dates and social life.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Fixes pulled from your real face scan + voice check',
                'Framed by your goal — dates, confidence, or full glow-up',
                'Links directly to the drill or tutorial to fix it',
                'Updates every time you re-scan',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <ChevronRight size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/login">
              <Button variant="outline" className="gap-2 border-amber-700/50 text-amber-300 hover:bg-amber-900/20">
                <Zap size={15} /> See my action plan
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── VOICE CHECK FEATURE ── */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="flex flex-col md:flex-row items-center gap-12">

          {/* Visual */}
          <div className="flex-1 flex justify-center">
            <div className="rounded-2xl border border-sky-800/40 bg-gradient-to-br from-sky-950/50 to-slate-900 p-5 w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-4xl font-black text-white">72</p>
                  <p className="text-sky-400 text-xs font-bold uppercase tracking-wider">Confident</p>
                </div>
                <div className="text-right space-y-1">
                  <span className="block px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">134 wpm · Perfect pace</span>
                  <span className="block px-2.5 py-1 rounded-full bg-amber-900/40 border border-amber-800/50 text-xs text-amber-300">8 filler words</span>
                  <span className="block px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">Clarity 81/100</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Fix these</p>
                {[
                  { bar: '#f59e0b', text: 'Cut the "um"s — pause instead of filling silence' },
                  { bar: '#38bdf8', text: 'End sentences with confidence, not a question tone' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="w-0.5 shrink-0 rounded-full bg-amber-500" style={{ minHeight: '1.2rem', background: item.bar }} />
                    <p className="text-xs text-white">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Copy */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-700/40 bg-sky-900/20 px-3 py-1 text-xs text-sky-400 font-semibold mb-4">
              <Mic size={11} /> Voice Check
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-5">
              Find out why people<br />
              <span className="text-sky-400">aren&apos;t fully listening</span><br />
              to you.
            </h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              Record 30 seconds of yourself. Presence AI detects filler words,
              grammar issues, pace problems, and tone — then gives you specific
              drills to fix them before your next conversation.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                '"Um", "like", "basically" — detected and counted',
                'Grammar issues caught and corrected',
                'Tone assessment: confident vs. uncertain vs. rushed',
                'Drills to practice in under 5 minutes',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <ChevronRight size={15} className="text-sky-400 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/login">
              <Button variant="outline" className="gap-2 border-sky-700/50 text-sky-300 hover:bg-sky-900/20">
                <Mic size={15} /> Check my voice
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="border-t border-slate-800/60 bg-slate-900/30 py-16 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-2">How it works</h2>
          <p className="text-slate-500 text-sm mb-10">Three steps. Sixty seconds. Real results.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Upload a photo', desc: 'One selfie or portrait. Clear, good light. That\'s it.', color: 'text-violet-400', border: 'border-violet-800/40' },
              { step: '02', title: 'Get your fixes', desc: 'Your action plan, style archetype, color palette, and AI-generated ideal look. Instant.', color: 'text-amber-400', border: 'border-amber-800/40' },
              { step: '03', title: 'Level up', desc: 'Re-scan weekly. Watch your Presence Score climb as you apply the coaching.', color: 'text-emerald-400', border: 'border-emerald-800/40' },
            ].map(({ step, title, desc, color, border }) => (
              <div key={step} className={`rounded-2xl border ${border} bg-slate-900/50 p-6 text-left`}>
                <p className={`text-4xl font-black mb-3 ${color}`}>{step}</p>
                <p className="text-white font-bold text-base mb-2">{title}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-5 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Your ideal look.<br />
            <span className="gradient-text">Your 3 fixes. Free.</span>
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Takes 60 seconds. No credit card. No fluff — just output.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-violet-600 hover:bg-violet-500 gap-2 text-base px-10 py-6">
              Scan my look for free <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800/60 py-6 text-center text-sm text-slate-600">
        <p>© {new Date().getFullYear()} PresenceAI · Built for the ones who want to show up better</p>
        <div className="flex gap-4 justify-center mt-2">
          <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
