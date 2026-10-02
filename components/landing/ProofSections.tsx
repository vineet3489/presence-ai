import fs from 'fs';
import path from 'path';
import Image from 'next/image';
import { Zap, Users, Quote, Brain, Clock, ArrowRight } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';

/* ── Social proof — REAL data only ─────────────────────────────────────────
 * Fabricated user counts / testimonials are deceptive advertising (CCPA dark-pattern
 * guidelines, Meta ad policy). Everything below is driven by real data and hides
 * itself until there's enough of it to be persuasive.
 */

/** Show the live member count once it's big enough to be social proof. */
const MEMBER_COUNT_MIN = 100;

/** Paste REAL user quotes here (with their permission). Section stays hidden while empty. */
const TESTIMONIALS: { quote: string; name: string; detail: string }[] = [
  // { quote: 'Changed my first photo like it said — matches doubled in a week.', name: 'Rahul', detail: '27, Bangalore' },
];

export async function MemberCount() {
  let count = 0;
  try {
    const { count: c } = await createAdminClient()
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });
    count = c ?? 0;
  } catch {
    return null;
  }
  if (count < MEMBER_COUNT_MIN) return null;

  const shown = count >= 1000 ? Math.floor(count / 100) * 100 : Math.floor(count / 10) * 10;
  return (
    <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-slate-300 mt-6">
      <Users size={15} className="text-violet-400" />
      <span><span className="text-white font-black">{shown.toLocaleString('en-IN')}+ men</span> are levelling up with PresenceAI</span>
    </div>
  );
}

export function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;
  return (
    <section className="max-w-6xl mx-auto px-5 py-20">
      <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-10">What users changed</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name + t.quote} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <Quote size={20} className="text-violet-400 mb-3" />
            <blockquote className="text-white font-semibold leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</blockquote>
            <figcaption className="text-sm text-slate-400">{t.name} · {t.detail}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/** Real before/after. Drop public/landing/before.jpg + after.jpg (with consent) and it appears. */
export function Transformation() {
  const dir = path.join(process.cwd(), 'public', 'landing');
  const has = (f: string) => fs.existsSync(path.join(dir, f));
  if (!has('before.jpg') || !has('after.jpg')) return null;

  return (
    <section className="max-w-4xl mx-auto px-5 py-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-2">Same face. Better first impression.</h2>
        <p className="text-slate-400">Real user · hair, outfit, and posture from his PresenceAI plan</p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-6 items-center">
        {[
          { src: '/landing/before.jpg', label: 'Before', cls: 'border-slate-700' },
          { src: '/landing/after.jpg', label: 'His Ideal Look', cls: 'border-violet-500 shadow-2xl shadow-violet-900/40' },
        ].map(({ src, label, cls }) => (
          <div key={src} className={`relative rounded-2xl overflow-hidden border-2 ${cls} aspect-[4/5]`}>
            <Image src={src} alt={label} fill sizes="(max-width: 768px) 50vw, 400px" className="object-cover" />
            <span className="absolute top-3 left-3 text-xs font-bold bg-slate-950/80 text-white rounded-full px-3 py-1">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Emotion ─────────────────────────────────────────────────────────────── */

export function PainSection() {
  const pains = [
    'You swipe for hours. The matches don\'t come.',
    'You match — then the chat dies after "hey".',
    'You know you\'re a good guy. Your profile doesn\'t show it.',
    'Your friends say "you look fine". Fine doesn\'t get replies.',
  ];
  return (
    <section className="max-w-3xl mx-auto px-5 py-20 text-center">
      <h2 className="text-3xl md:text-4xl font-black text-white mb-8">Sound familiar?</h2>
      <div className="space-y-3 text-left">
        {pains.map((p) => (
          <div key={p} className="rounded-xl border border-slate-800 bg-slate-900/40 px-5 py-4 text-slate-200 text-base md:text-lg">
            {p}
          </div>
        ))}
      </div>
      <p className="text-xl md:text-2xl font-black text-white mt-10 leading-snug">
        It&apos;s not you. It&apos;s <span className="gradient-text">how you come across</span> —<br className="hidden md:block" />
        and that&apos;s fixable in a weekend.
      </p>
    </section>
  );
}

/* ── Logic ───────────────────────────────────────────────────────────────── */

export function ScienceSection() {
  return (
    <section className="border-y border-slate-800/60 bg-slate-900/30 py-16 px-5">
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 items-stretch">
        <div className="md:col-span-1 rounded-2xl border border-violet-700/50 bg-violet-950/30 p-6 flex flex-col justify-center">
          <Clock size={22} className="text-violet-400 mb-3" />
          <p className="text-5xl font-black text-white">0.1s</p>
          <p className="text-slate-300 mt-2">is all it takes for people to judge how trustworthy and attractive a face looks.</p>
          <p className="text-[11px] text-slate-500 mt-3">Willis &amp; Todorov, Princeton — <i>Psychological Science</i>, 2006</p>
        </div>
        <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
          {[
            { icon: Brain, title: 'First impressions are fast', desc: 'Your photo is judged before your bio is even read. Small changes — expression, framing, fit — shift that snap judgment.' },
            { icon: Zap, title: 'Most fixes are small', desc: 'A warmer smile, a better first photo, a sharper bio line. You don\'t need a new face — you need the right tweaks.' },
            { icon: Users, title: 'Different people, different reads', desc: 'What works on a 22-year-old in Pune can flop with a 28-year-old in Mumbai. Test against the people you actually want.' },
            { icon: ArrowRight, title: 'Measure, fix, re-measure', desc: 'See your odds, apply the fix, re-run. You stop guessing and start seeing what works.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
              <Icon size={18} className="text-violet-400 mb-2" />
              <p className="text-white font-bold text-sm mb-1">{title}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Value: what a result actually looks like ────────────────────────────── */

export function ExampleResult() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-2">What you get in 2 minutes</h2>
        <p className="text-slate-400">A real result screen <span className="text-slate-500">(sample data)</span></p>
      </div>
      <div className="max-w-md mx-auto space-y-3">
        <div className="rounded-2xl border border-amber-600/50 bg-gradient-to-br from-amber-900/30 to-slate-900 p-5">
          <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1.5">Do this now</p>
          <p className="text-xl font-black text-white leading-snug">Swap photo 1 for a solo shot — chin up, warmer smile.</p>
        </div>
        <div className="rounded-2xl border border-violet-700/40 bg-gradient-to-br from-violet-950/30 to-slate-900/80 p-5">
          <p className="text-xs text-violet-400 font-semibold uppercase tracking-wider mb-3">How 25F, Mumbai sees you</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[{ l: 'Swipe', v: '58%' }, { l: 'Reply', v: '71%' }, { l: 'Strength', v: '64' }].map(({ l, v }) => (
              <div key={l} className="rounded-xl bg-slate-800/50 border border-slate-700/50 py-3 text-center">
                <p className="text-2xl font-black text-white">{v}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">{l}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-300 italic border-l-2 border-violet-500/60 pl-3">&ldquo;Seems genuine and kind — but the group photo first makes me work to find him.&rdquo;</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <p className="text-sm font-semibold text-white mb-2">Better bio — confident</p>
          <p className="text-white leading-relaxed">Product guy by day, home-chef by night. My dal makhani has a fan club. Looking for someone to argue about the best biryani in town with.</p>
        </div>
      </div>
    </section>
  );
}
