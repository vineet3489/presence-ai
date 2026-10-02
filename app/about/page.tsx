import type { Metadata } from 'next';
import { Heart, Eye, ShieldCheck, Sprout } from 'lucide-react';
import { ContentPage, JsonLd, TryFreeCta } from '@/components/marketing/SiteChrome';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About Us — Why We Built PresenceAI',
  description:
    'PresenceAI was built to genuinely help people understand how they come across and grow in confidence — with honest, kind, practical feedback.',
  alternates: { canonical: '/about' },
};

const VALUES = [
  { icon: Eye, title: 'Honest, never harsh', text: 'We never rate your looks. We show how you come across and what changes it — always paired with a fix you can act on.' },
  { icon: Sprout, title: 'Small steps, real growth', text: 'One change at a time. A better photo, a calmer voice, a sharper first line. Small wins compound.' },
  { icon: ShieldCheck, title: 'Private by default', text: 'Your photos, recordings, and results are yours. Only you can see them, and you can delete them anytime.' },
  { icon: Heart, title: 'You, not someone else', text: 'The goal isn\'t to turn you into a different person. It\'s to remove what hides the person you already are.' },
];

export default function AboutPage() {
  return (
    <ContentPage crumbs={[{ name: 'About us', href: '/about' }]}>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: `About ${SITE.name}`,
          url: `${SITE.url}/about`,
          mainEntity: { '@type': 'Organization', name: SITE.name, url: SITE.url, email: SITE.email },
        }}
      />

      <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
        We built this to <span className="gradient-text">genuinely help.</span>
      </h1>

      <div className="space-y-5 text-[17px] leading-relaxed text-slate-300">
        <p>
          Most people never find out how they actually come across. Friends are too kind to say it. Strangers just
          swipe left, stop replying, or don&apos;t call back — and you&apos;re left guessing what went wrong.
        </p>
        <p>
          That guessing is exhausting. Good, kind, interesting people lose confidence because of things that are
          small and completely fixable: a photo that reads guarded when they&apos;re actually warm, a voice that
          rushes when they&apos;re nervous, an outfit that doesn&apos;t fit their shoulders.
        </p>
        <p className="text-white font-semibold text-xl">
          PresenceAI exists to replace that guessing with clear, kind, honest feedback — and a next step you can
          take today.
        </p>
        <p>
          We started with dating because that&apos;s where first impressions feel highest-stakes and feedback is
          rarest. But the skills carry everywhere: interviews, new teams, family functions, a first coffee with
          someone you like.
        </p>
      </div>

      <h2 className="text-2xl font-black text-white mt-12 mb-5">What we believe</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {VALUES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <Icon size={20} className="text-violet-400 mb-3" />
            <p className="text-white font-bold mb-1">{title}</p>
            <p className="text-sm text-slate-400 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-black text-white mt-12 mb-3">Talk to us</h2>
      <p className="text-slate-300">
        We read every message. Questions, feedback, or a story about what changed for you:{' '}
        <span className="text-white font-semibold">{SITE.email}</span>
      </p>

      <TryFreeCta />
    </ContentPage>
  );
}
