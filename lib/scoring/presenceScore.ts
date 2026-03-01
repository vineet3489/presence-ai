import type { AppearanceResult, VoiceResult } from '@/types';

export function scoreAppearance(result: AppearanceResult): number {
  const expression = result.expressionScore * 0.3;
  const posture = result.postureScore * 0.3;
  // More recommendations = lower baseline score (more to improve)
  const recommendationPenalty = Math.max(0, (result.hairstyleRecommendations.length - 1) * 2);
  const base = 65 + (expression + posture) * 0.4 / 10 - recommendationPenalty;
  return Math.min(100, Math.max(30, Math.round(base)));
}

export function scoreVoice(result: VoiceResult): number {
  const clarity = result.clarityScore * 0.4;
  const fillerPenalty = Math.min(20, result.fillerWordCount * 2);
  const grammarPenalty = Math.min(10, result.grammarIssues.length * 2);
  const base = clarity + 60 - fillerPenalty - grammarPenalty;
  return Math.min(100, Math.max(20, Math.round(base)));
}

export function scoreDatePrep(): number {
  // Date prep is scored as social intelligence — completing it = baseline score
  return 72;
}

export function compositeScore(
  appearance: number | null,
  voice: number | null,
  social: number | null
): number {
  const scores = [appearance, voice, social].filter((s): s is number => s !== null);
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}
