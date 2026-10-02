import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Sparkles } from 'lucide-react';
import { POSTS, getPost } from '@/lib/blog';
import { SITE, absoluteUrl } from '@/lib/site';
import { ContentPage, JsonLd, TryFreeCta } from '@/components/marketing/SiteChrome';
import { ArticleBody } from '@/components/marketing/ArticleBody';

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const url = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.published,
      modifiedTime: post.updated,
      images: [SITE.ogImage],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.description },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  const toc = post.body.filter((b): b is Extract<typeof b, { type: 'h2' }> => b.type === 'h2');
  const others = POSTS.filter((p) => p.slug !== post.slug);

  return (
    <ContentPage crumbs={[{ name: 'Blog', href: '/blog' }, { name: post.title, href: `/blog/${post.slug}` }]}>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.description,
          datePublished: post.published,
          dateModified: post.updated,
          mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
          image: absoluteUrl(SITE.ogImage),
          keywords: post.keywords.join(', '),
          author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
          publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: absoluteUrl('/presence-logo.svg') } },
        }}
      />

      <article>
        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-3">{post.category}</p>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">{post.title}</h1>
          <p className="text-lg text-slate-400 mb-4">{post.description}</p>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>By the {SITE.name} team</span>
            <span>·</span>
            <time dateTime={post.updated}>{formatDate(post.updated)}</time>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {post.readMinutes} min read</span>
          </div>
        </header>

        {/* Key takeaways */}
        <div className="rounded-2xl border border-violet-600/50 bg-gradient-to-br from-violet-950/40 to-slate-900 p-5 mb-8">
          <p className="flex items-center gap-2 text-violet-300 font-bold text-sm uppercase tracking-wider mb-3">
            <Sparkles size={14} /> Key takeaways
          </p>
          <ul className="space-y-2">
            {post.takeaways.map((t) => (
              <li key={t} className="flex gap-2.5 text-white font-semibold"><span className="text-violet-400">✓</span>{t}</li>
            ))}
          </ul>
        </div>

        {/* Table of contents */}
        <nav aria-label="Table of contents" className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 mb-10">
          <p className="text-white font-bold text-sm mb-3">In this guide</p>
          <ol className="space-y-1.5 text-sm">
            {toc.map((h) => (
              <li key={h.id}><a href={`#${h.id}`} className="text-slate-400 hover:text-violet-300">{h.text}</a></li>
            ))}
          </ol>
        </nav>

        <ArticleBody blocks={post.body} />
      </article>

      <TryFreeCta title="Want to know how you come across?" />

      {others.length > 0 && (
        <section className="border-t border-slate-800 pt-8">
          <p className="text-white font-bold mb-4">Keep reading</p>
          {others.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="block rounded-2xl border border-slate-800 bg-slate-900/40 p-5 hover:border-slate-600">
              <p className="text-xs text-violet-400 font-bold uppercase tracking-wider mb-1">{p.category}</p>
              <p className="text-white font-bold text-lg">{p.title}</p>
              <p className="text-sm text-slate-400 mt-1">{p.description}</p>
            </Link>
          ))}
        </section>
      )}
    </ContentPage>
  );
}
