'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Shirt, Activity, Star } from 'lucide-react';
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

function SkinToneChip({ tone }: { tone: string }) {
  const color = SKIN_TONE_COLORS[tone.toLowerCase()] ?? '#c8a96e';
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-700 text-xs text-slate-300 font-medium">
      <span className="w-3 h-3 rounded-full border border-white/20" style={{ background: color }} />
      {tone} skin
    </span>
  );
}

function ScoreCircle({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-14 h-14 rounded-full border-[3px] flex items-center justify-center text-base font-black text-white"
        style={{ borderColor: color }}
      >
        {value}
      </div>
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}

function TipCard({ text, index, accent }: { text: string; index: number; accent: string }) {
  return (
    <div
      className="flex gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <span
        className="shrink-0 w-6 h-6 rounded-full text-xs font-black flex items-center justify-center text-white mt-0.5"
        style={{ background: accent }}
      >
        {index + 1}
      </span>
      <p className="text-slate-200 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function ColorSwatch({ text, index }: { text: string; index: number }) {
  const color = swatchColor(text);
  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className="w-10 h-10 rounded-lg shrink-0 border border-white/10 mt-0.5"
        style={color ? { background: color } : { background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
      />
      <p className="text-slate-200 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function SectionLabel({ label, color }: { label: string; color: string }) {
  return <p className="text-xs font-bold uppercase tracking-widest" style={{ color }}>{label}</p>;
}

export function AppearanceResults({ result, score }: Props) {
  return (
    <div className="space-y-5">
      {/* Score header */}
      <div className="rounded-2xl border border-violet-800/40 bg-gradient-to-br from-violet-950/60 to-slate-900 p-5">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex flex-col items-center min-w-[64px]">
            <span className="text-5xl font-black text-white leading-none">{score}</span>
            <span className="text-xs text-slate-400 mt-1">/ 100</span>
          </div>
          <div className="flex-1 min-w-40">
            <p className="text-sm font-semibold text-white mb-2">Appearance Score</p>
            <Progress value={score} className="h-2 mb-3" />
            <div className="flex gap-2 flex-wrap items-center">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium">
                {result.faceShape} face
              </span>
              <SkinToneChip tone={result.skinTone} />
            </div>
          </div>
          <div className="flex gap-4">
            <ScoreCircle label="Expression" value={result.expressionScore} color="#8b5cf6" />
            <ScoreCircle label="Posture" value={result.postureScore} color="#38bdf8" />
          </div>
        </div>
      </div>

      <Tabs defaultValue="face">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="face" className="gap-1 text-xs"><Sparkles size={13} /> Face</TabsTrigger>
          <TabsTrigger value="style" className="gap-1 text-xs"><Shirt size={13} /> Colors</TabsTrigger>
          <TabsTrigger value="posture" className="gap-1 text-xs"><Activity size={13} /> Posture</TabsTrigger>
          <TabsTrigger value="coaching" className="gap-1 text-xs"><Star size={13} /> Full Read</TabsTrigger>
        </TabsList>

        <TabsContent value="face" className="space-y-4 mt-4">
          <SectionLabel label="Hairstyle" color="#8b5cf6" />
          <div className="space-y-2">
            {result.hairstyleRecommendations.map((tip, i) => (
              <TipCard key={i} text={tip} index={i} accent="#8b5cf6" />
            ))}
          </div>
          <SectionLabel label="Expression" color="#a78bfa" />
          <div className="space-y-2">
            {result.expressionTips.map((tip, i) => (
              <TipCard key={i} text={tip} index={i} accent="#a78bfa" />
            ))}
          </div>
          {result.groomingTips.length > 0 && (
            <>
              <SectionLabel label="Grooming" color="#6d28d9" />
              <div className="space-y-2">
                {result.groomingTips.map((tip, i) => (
                  <TipCard key={i} text={tip} index={i} accent="#6d28d9" />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="style" className="space-y-4 mt-4">
          <SectionLabel label="Best Colors for Your Skin Tone" color="#38bdf8" />
          <div className="space-y-2">
            {result.clothingColors.map((c, i) => (
              <ColorSwatch key={i} text={c} index={i} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="posture" className="space-y-4 mt-4">
          <div className="rounded-xl bg-sky-950/40 border border-sky-800/40 p-4 flex items-center gap-4">
            <div className="text-4xl font-black text-white">{result.postureScore}</div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 mb-1.5">Posture Score</p>
              <Progress value={result.postureScore} className="h-2" />
            </div>
          </div>
          <SectionLabel label="Corrections" color="#34d399" />
          <div className="space-y-2">
            {result.postureCorrections.map((tip, i) => (
              <TipCard key={i} text={tip} index={i} accent="#059669" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coaching" className="mt-4">
          <div className="rounded-2xl bg-gradient-to-br from-violet-950/40 to-slate-900 border border-violet-800/30 p-5">
            <p className="text-slate-200 leading-relaxed text-sm whitespace-pre-line">
              {result.overallCoaching}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
