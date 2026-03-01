import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function countFillerWords(transcript: string): { word: string; count: number }[] {
  const fillers = ['um', 'uh', 'like', 'you know', 'basically', 'literally',
    'right', 'i mean', 'kind of', 'sort of', 'actually', 'honestly'];
  const lower = transcript.toLowerCase();
  return fillers
    .map((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const count = (lower.match(regex) || []).length;
      return { word, count };
    })
    .filter((f) => f.count > 0)
    .sort((a, b) => b.count - a.count);
}
