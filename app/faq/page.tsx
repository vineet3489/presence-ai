import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import { ContentPage, JsonLd, TryFreeCta } from '@/components/marketing/SiteChrome';
import { ALL_FAQS, FAQ_GROUPS, faqJsonLd } from '@/lib/faq';

export const metadata: Metadata = {
  title: 'FAQ — Free Trial, Pricing, Privacy & How It Works',
  description:
    'Answers about the PresenceAI free trial, ₹79/week pricing, cancelling, privacy, and how Perception Check, Face Scan, and Voice Check work.',
  alternates: { canonical: '/faq' },
};

export default function FaqPage() {
  return (
    <ContentPage crumbs={[{ name: 'FAQ', href: '/faq' }]}>
      <JsonLd data={faqJsonLd(ALL_FAQS)} />
      <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-3">Frequently asked questions</h1>
      <p className="text-lg text-slate-400 mb-10">Everything about the free trial, pricing, privacy, and how it works.</p>

      {FAQ_GROUPS.map((g) => (
        <section key={g.title} className="mb-10">
          <h2 className="text-xl font-black text-white mb-3">{g.title}</h2>
          <div className="space-y-2">
            {g.items.map(({ q, a }) => (
              <details key={q} className="group rounded-xl border border-slate-800 bg-slate-900/40 px-5 py-4">
                <summary className="flex items-center justify-between gap-3 cursor-pointer list-none text-white font-semibold">
                  {q}
                  <ChevronRight size={16} className="text-slate-500 transition-transform group-open:rotate-90 shrink-0" />
                </summary>
                <p className="text-slate-400 mt-2 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}

      <TryFreeCta />
    </ContentPage>
  );
}
