import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

// App screens are private to signed-in users — keep crawlers on the public content.
const PRIVATE = [
  '/api/', '/dashboard', '/perception', '/face-scan', '/voice-check', '/style-profile', '/date-prep',
  '/chat-coach', '/roleplay', '/outfit-builder', '/progress', '/report', '/settings', '/onboarding',
  '/trial', '/upgrade', '/login', '/signup', '/auth/', '/avatar-preview',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: PRIVATE }],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
