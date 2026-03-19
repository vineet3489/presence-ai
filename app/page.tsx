import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Camera, Mic, Heart, ArrowRight, Star, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold gradient-text">PresenceAI</span>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/login">
            <Button size="sm">Get Started Free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-6 py-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-800/50 bg-violet-900/20 px-4 py-1.5 text-sm text-violet-300 mb-8">
          <Star size={14} />
          AI-powered personal presence coaching
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
          Show up as your{' '}
          <span className="gradient-text">best self</span>
          <br />every single day
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload a photo, record your voice, prep for a date — and get personalized AI coaching
          on how to look, speak, and carry yourself with genuine confidence.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="gap-2">
              Start for free <ArrowRight size={18} />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline">See how it works</Button>
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="features" className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Three pillars of presence</h2>
        <p className="text-slate-400 text-center mb-12">Most apps do one thing. PresenceAI coaches you across the full picture.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              Icon: Camera, color: 'text-violet-400', dot: 'bg-violet-400',
              border: 'border-violet-800/40', bg: 'bg-violet-900/20',
              title: 'Visual Presence',
              desc: 'Upload a photo and get specific coaching on face shape, hairstyle, skin-tone-matched colors, and posture. Like a real stylist — instant.',
              bullets: ['Face shape & hairstyle advice', 'Clothing color matching', 'Posture corrections', 'Expression coaching'],
            },
            {
              Icon: Mic, color: 'text-sky-400', dot: 'bg-sky-400',
              border: 'border-sky-800/40', bg: 'bg-sky-900/20',
              title: 'Voice & Communication',
              desc: 'Record yourself speaking and get scored on filler words, grammar, pace, and tone. Receive specific exercises to improve.',
              bullets: ['Filler word detection', 'Grammar coaching', 'Pace & clarity score', 'Influence & tone tips'],
            },
            {
              Icon: Heart, color: 'text-pink-400', dot: 'bg-pink-400',
              border: 'border-pink-800/40', bg: 'bg-pink-900/20',
              title: 'Date Prep & Social IQ',
              desc: 'Tell us about yourself and who you\'re meeting. Get a personalized plan: what to wear, how to open, conversation starters.',
              bullets: ['Personalized conversation starters', 'What to wear for the occasion', 'Body language tips', 'Nervousness strategy'],
            },
          ].map(({ Icon, color, dot, border, bg, title, desc, bullets }) => (
            <div key={title} className={`rounded-2xl border p-6 ${bg} ${border}`}>
              <Icon size={32} className={`${color} mb-4`} />
              <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">{desc}</p>
              <ul className="space-y-1.5">
                {bullets.map((b) => (
                  <li key={b} className="text-sm text-slate-300 flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Progress section */}
      <section className="border-t border-slate-800 py-20 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <TrendingUp size={40} className="text-violet-400 mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Track your presence score over time</h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              Every session updates your Presence Score — a composite of appearance, voice, and social intelligence.
              Watch it climb as you apply the coaching.
            </p>
            <Link href="/login">
              <Button>Start tracking free <ArrowRight size={16} className="ml-1" /></Button>
            </Link>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="rotate-[-90deg] w-full h-full">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="url(#scoreGrad)" strokeWidth="10"
                  strokeDasharray="251.2" strokeDashoffset="62.8" strokeLinecap="round" />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white">75</span>
                <span className="text-xs text-slate-400">Presence Score</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-slate-800 py-16 px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to level up your presence?</h2>
        <p className="text-slate-400 mb-8">Free to start. No credit card required.</p>
        <Link href="/login">
          <Button size="lg">Get started free <ArrowRight size={18} className="ml-1" /></Button>
        </Link>
      </section>

      <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-600">
        <p>© {new Date().getFullYear()} PresenceAI</p>
        <div className="flex gap-4 justify-center mt-2">
          <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
