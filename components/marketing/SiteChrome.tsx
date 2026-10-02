import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PresenceLogo } from '@/components/ui/PresenceLogo';
import { SITE, absoluteUrl } from '@/lib/site';

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

const NAV = [
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'About' },
];

export function SiteHeader() {
  return (
    <header className="border-b border-slate-800/60">
      <nav className="px-5 py-4 flex items-center justify-between max-w-6xl mx-auto gap-4" aria-label="Main">
        <PresenceLogo href="/" size="sm" />
        <div className="flex items-center gap-1 sm:gap-2">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} className="hidden sm:block text-sm text-slate-400 hover:text-white px-3 py-1.5">
              {label}
            </Link>
          ))}
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">Sign in</Button>
          </Link>
          <Link href="/login">
            <Button size="sm" className="bg-violet-600 hover:bg-violet-500 gap-1.5">
              Try it free <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800/60 py-10 px-5 text-sm text-slate-500">
      <div className="max-w-6xl mx-auto grid gap-8 sm:grid-cols-3">
        <div>
          <PresenceLogo href="/" size="sm" />
          <p className="mt-3 text-xs leading-relaxed max-w-xs">
            Helping men understand how they come across — and get better at it, one small change at a time.
          </p>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Learn</p>
          <ul className="space-y-2">
            <li><Link href="/blog" className="hover:text-slate-300">Blog</Link></li>
            <li><Link href="/blog/how-to-shine-as-a-person" className="hover:text-slate-300">How to shine as a person</Link></li>
            <li><Link href="/blog/how-to-look-presentable-on-a-first-date" className="hover:text-slate-300">First date checklist</Link></li>
            <li><Link href="/faq" className="hover:text-slate-300">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Company</p>
          <ul className="space-y-2">
            <li><Link href="/about" className="hover:text-slate-300">About us</Link></li>
            <li><Link href="/privacy" className="hover:text-slate-300">Privacy policy</Link></li>
            <li><Link href="/terms" className="hover:text-slate-300">Terms of service</Link></li>
            <li><span>{SITE.email}</span></li>
          </ul>
        </div>
      </div>
      <p className="max-w-6xl mx-auto mt-8 text-xs text-slate-600">© {new Date().getFullYear()} {SITE.name}</p>
    </footer>
  );
}

export interface Crumb { name: string; href: string }

/** Visible breadcrumbs + BreadcrumbList structured data. Home is added automatically. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ name: 'Home', href: '/' }, ...items];
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: all.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.name,
            item: absoluteUrl(c.href),
          })),
        }}
      />
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500 mb-6">
        <ol className="flex flex-wrap items-center gap-1">
          {all.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={12} className="text-slate-700" />}
              {i === all.length - 1 ? (
                <span aria-current="page" className="text-slate-300">{c.name}</span>
              ) : (
                <Link href={c.href} className="hover:text-slate-300">{c.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

/** Shell for every public content page: header, breadcrumbs, readable column, footer. */
export function ContentPage({ crumbs, children, wide = false }: { crumbs: Crumb[]; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader />
      <main className={`mx-auto px-5 py-10 ${wide ? 'max-w-5xl' : 'max-w-3xl'}`}>
        <Breadcrumbs items={crumbs} />
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export function TryFreeCta({ title = 'See how you come across — free', sub = 'Upload a photo and bio. Get your swipe odds and the one fix that matters, in 2 minutes.' }: { title?: string; sub?: string }) {
  return (
    <aside className="my-10 rounded-2xl border border-violet-600/50 bg-gradient-to-br from-violet-950/50 to-slate-900 p-6 text-center">
      <p className="text-xl font-black text-white mb-1.5">{title}</p>
      <p className="text-sm text-slate-400 mb-4">{sub}</p>
      <Link href="/login">
        <Button className="bg-violet-600 hover:bg-violet-500 gap-2 h-11 px-6 font-bold">
          Try it free <ArrowRight size={15} />
        </Button>
      </Link>
      <p className="text-[11px] text-slate-500 mt-2">First check free — no card needed</p>
    </aside>
  );
}
