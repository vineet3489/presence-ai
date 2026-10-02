import type { MetadataRoute } from 'next';
import { POSTS } from '@/lib/blog';
import { absoluteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: { path: string; priority: number; freq: 'weekly' | 'monthly' | 'yearly' }[] = [
    { path: '/', priority: 1, freq: 'weekly' },
    { path: '/blog', priority: 0.9, freq: 'weekly' },
    { path: '/faq', priority: 0.7, freq: 'monthly' },
    { path: '/about', priority: 0.6, freq: 'monthly' },
    { path: '/privacy', priority: 0.3, freq: 'yearly' },
    { path: '/terms', priority: 0.3, freq: 'yearly' },
  ];

  return [
    ...staticPages.map(({ path, priority, freq }) => ({
      url: absoluteUrl(path),
      changeFrequency: freq,
      priority,
    })),
    ...POSTS.map((p) => ({
      url: absoluteUrl(`/blog/${p.slug}`),
      lastModified: p.updated,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
