import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { POSTS } from '@/lib/blog';
import { ContentPage, TryFreeCta } from '@/components/marketing/SiteChrome';

export const metadata: Metadata = {
  title: 'Blog — Personality Development, Confidence & First Date Tips',
  description:
    'Practical guides on personality development, confidence, grooming, and first dates for men. Simple habits that change how people see you.',
  alternates: { canonical: '/blog' },
};

export default function BlogIndexPage() {
  return (
    <ContentPage crumbs={[{ name: 'Blog', href: '/blog' }]}>
      <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-3">
        Show up better.
      </h1>
      <p className="text-lg text-slate-400 mb-10">
        Practical guides on personality, confidence, grooming, and dating — small changes that make a real difference.
      </p>

      <div className="space-y-4">
        {POSTS.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="group block rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-violet-600/60 transition-colors"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-2">{p.category}</p>
            <h2 className="text-xl md:text-2xl font-black text-white leading-snug mb-2 group-hover:text-violet-200">{p.title}</h2>
            <p className="text-slate-400 mb-4">{p.description}</p>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1"><Clock size={12} /> {p.readMinutes} min read</span>
              <span className="flex items-center gap-1 text-violet-300 font-semibold">Read guide <ArrowRight size={13} /></span>
            </div>
          </Link>
        ))}
      </div>

      <TryFreeCta />
    </ContentPage>
  );
}
