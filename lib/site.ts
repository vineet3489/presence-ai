export const SITE = {
  name: 'PresenceAI',
  url: 'https://mypresence.in',
  email: 'support@mypresence.in',
  tagline: 'See how people actually see you',
  description:
    'Personality and presence coaching for men. Find out how you come across on dating apps and in person, get the one fix that matters, and build confidence for first dates — free to try.',
  ogImage: '/hero/model-after.jpg',
} as const;

export function absoluteUrl(path = '/') {
  return `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`;
}
