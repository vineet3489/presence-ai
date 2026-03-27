'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Shirt, Activity, Zap } from 'lucide-react';
import type { AppearanceResult } from '@/types';

interface Props {
  result: AppearanceResult;
  score: number;
}

const COLOR_MAP: Record<string, string> = {
  terracotta: '#c8633a', burgundy: '#800020', olive: '#708238',
  navy: '#1a2a6c', rust: '#b7410e', sage: '#9caf88', teal: '#008080',
  camel: '#c19a6b', cream: '#fffdd0', blush: '#ffb6c1', emerald: '#50c878',
  cobalt: '#0047ab', mustard: '#ffdb58', charcoal: '#36454f', ivory: '#fffff0',
  tan: '#d2b48c', beige: '#f5f5dc', maroon: '#800000', coral: '#ff7f50',
  peach: '#ffdab9', lavender: '#e6e6fa', chocolate: '#7b3f00', khaki: '#c3b091',
  black: '#222', white: '#f8f8f8', grey: '#808080', gray: '#808080',
  pink: '#ffc0cb', red: '#dc143c', blue: '#4169e1', green: '#228b22',
  yellow: '#ffd700', orange: '#ff8c00', purple: '#8b5cf6', brown: '#8b4513',
  gold: '#ffd700', silver: '#c0c0c0', indigo: '#4b0082', violet: '#7f00ff',
};

function swatchColor(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

const SKIN_TONE_COLORS: Record<string, string> = {
  fair: '#fde8d8', light: '#f9d5b3', medium: '#d4a576',
  olive: '#c8a96e', tan: '#b8825a', deep: '#7d4f2a',
};

function scoreTier(s: number): { label: string; color: string } {
  if (s >= 88) return { label: 'Elite Presence', color: '#f59e0b' };
  if (s >= 74) return { label: 'Strong', color: '#8b5cf6' };
  if (s >= 58) return { label: 'Solid', color: '#38bdf8' };
  if (s >= 40) return { label: 'Building', color: '#34d399' };
  return { label: 'Raw Material', color: '#94a3b8' };
}

function SkinToneChip({ tone }: { tone: string }) {
  const color = SKIN_TONE_COLORS[tone.toLowerCase()] ?? '#c8a96e';
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-700 text-xs text-slate-300 font-medium">
      <span className="w-3 h-3 rounded-full border border-white/20" style={{ background: color }} />
      {tone} skin
    </span>
  );
}

function Tip({ text, accent }: { text: string; accent: string }) {
  // Extract first ~8 words as a punchy headline, rest as context
  const words = text.split(' ');
  const headline = words.slice(0, 7).join(' ');
  const rest = words.slice(7).join(' ');
  return (
    <div className="flex gap-3 px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
      <div className="w-1 shrink-0 rounded-full mt-1" style={{ background: accent, minHeight: '1.2rem' }} />
      <div>
        <p className="text-white text-sm font-semibold leading-snug">{headline}</p>
        {rest && <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{rest}</p>}
      </div>
    </div>
  );
}

function ColorSwatch({ text }: { text: string }) {
  const color = swatchColor(text);
  const words = text.split(' ');
  const headline = words.slice(0, 5).join(' ');
  const rest = words.slice(5).join(' ');
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
      <div
        className="w-8 h-8 rounded-lg shrink-0 border border-white/10 mt-0.5"
        style={color ? { background: color } : { background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
      />
      <div>
        <p className="text-white text-sm font-semibold leading-snug">{headline}</p>
        {rest && <p className="text-slate-500 text-xs mt-0.5">{rest}</p>}
      </div>
    </div>
  );
}

function VerdictCard({ text }: { text: string }) {
  // Split into sentences for punchy display
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  const verdict = sentences[0] ?? text;
  const insights = sentences.slice(1);

  return (
    <div className="space-y-3">
      {/* Big verdict */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-950/60 to-slate-900 border border-violet-700/40 p-5">
        <p className="text-xs text-violet-400 font-semibold uppercase tracking-widest mb-2">The Verdict</p>
        <p className="text-white text-base font-semibold leading-relaxed">{verdict}</p>
      </div>
      {/* Punchy insights */}
      {insights.length > 0 && (
        <div className="space-y-2">
          {insights.map((s, i) => (
            <div key={i} className="flex gap-3 px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-violet-400 font-black text-sm shrink-0">→</span>
              <p className="text-slate-300 text-sm leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AppearanceResults({ result, score }: Props) {
  const tier = scoreTier(score);

  return (
    <div className="space-y-5">
      {/* Score header */}
      <div className="rounded-2xl border border-violet-800/40 bg-gradient-to-br from-violet-950/60 to-slate-900 p-5">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex flex-col items-center min-w-[72px]">
            <span className="text-5xl font-black text-white leading-none">{score}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: tier.color }}>
              {tier.label}
            </span>
          </div>
          <div className="flex-1 min-w-40">
            <Progress value={score} className="h-2 mb-3" />
            <div className="flex gap-2 flex-wrap items-center">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium">
                {result.faceShape} face
              </span>
              <SkinToneChip tone={result.skinTone} />
            </div>
          </div>
          <div className="flex gap-5 text-center">
            <div>
              <p className="text-2xl font-black text-white">{result.expressionScore}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Expression</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">{result.postureScore}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Posture</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="verdict">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="verdict" className="gap-1 text-xs"><Zap size={12} /> Verdict</TabsTrigger>
          <TabsTrigger value="face" className="gap-1 text-xs"><Sparkles size={12} /> Face</TabsTrigger>
          <TabsTrigger value="style" className="gap-1 text-xs"><Shirt size={12} /> Colors</TabsTrigger>
          <TabsTrigger value="posture" className="gap-1 text-xs"><Activity size={12} /> Posture</TabsTrigger>
        </TabsList>

        <TabsContent value="verdict" className="mt-4">
          <VerdictCard text={result.overallCoaching} />
        </TabsContent>

        <TabsContent value="face" className="space-y-3 mt-4">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-400">Hairstyle</p>
          <div className="space-y-2">
            {result.hairstyleRecommendations.map((tip, i) => (
              <Tip key={i} text={tip} accent="#8b5cf6" />
            ))}
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-violet-300 pt-1">Expression</p>
          <div className="space-y-2">
            {result.expressionTips.map((tip, i) => (
              <Tip key={i} text={tip} accent="#a78bfa" />
            ))}
          </div>
          {result.groomingTips.length > 0 && (
            <>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-500 pt-1">Grooming</p>
              <div className="space-y-2">
                {result.groomingTips.map((tip, i) => (
                  <Tip key={i} text={tip} accent="#6d28d9" />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="style" className="space-y-3 mt-4">
          <p className="text-xs font-bold uppercase tracking-widest text-sky-400">Colors That Work For You</p>
          <div className="space-y-2">
            {result.clothingColors.map((c, i) => (
              <ColorSwatch key={i} text={c} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="posture" className="space-y-3 mt-4">
          <div className="rounded-xl bg-sky-950/40 border border-sky-800/40 p-4 flex items-center gap-5">
            <div>
              <p className="text-4xl font-black text-white">{result.postureScore}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Posture</p>
            </div>
            <div className="flex-1">
              <Progress value={result.postureScore} className="h-2" />
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 pt-1">Fix These</p>
          <div className="space-y-2">
            {result.postureCorrections.map((tip, i) => (
              <Tip key={i} text={tip} accent="#059669" />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
