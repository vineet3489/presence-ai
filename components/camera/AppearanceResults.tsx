'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Shirt, Activity, Star } from 'lucide-react';
import type { AppearanceResult } from '@/types';

interface Props {
  result: AppearanceResult;
  score: number;
}

export function AppearanceResults({ result, score }: Props) {
  return (
    <div className="space-y-6">
      {/* Score header */}
      <div className="flex items-center gap-4 rounded-2xl border border-violet-800/40 bg-violet-900/10 p-5">
        <div className="flex flex-col items-center min-w-16">
          <span className="text-4xl font-black text-white">{score}</span>
          <span className="text-xs text-slate-400">/100</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white mb-1">Appearance Score</p>
          <Progress value={score} className="h-2 mb-2" />
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">Face: {result.faceShape}</Badge>
            <Badge variant="secondary">Skin: {result.skinTone}</Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="face">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="face" className="gap-1 text-xs">
            <Sparkles size={14} /> Face
          </TabsTrigger>
          <TabsTrigger value="style" className="gap-1 text-xs">
            <Shirt size={14} /> Style
          </TabsTrigger>
          <TabsTrigger value="posture" className="gap-1 text-xs">
            <Activity size={14} /> Posture
          </TabsTrigger>
          <TabsTrigger value="coaching" className="gap-1 text-xs">
            <Star size={14} /> Coaching
          </TabsTrigger>
        </TabsList>

        <TabsContent value="face">
          <div className="space-y-4">
            <Section title="Hairstyle Recommendations">
              {result.hairstyleRecommendations.map((tip, i) => (
                <BulletItem key={i} text={tip} color="violet" />
              ))}
            </Section>
            <Section title="Expression Tips">
              {result.expressionTips.map((tip, i) => (
                <BulletItem key={i} text={tip} color="violet" />
              ))}
            </Section>
            {result.groomingTips.length > 0 && (
              <Section title="Grooming">
                {result.groomingTips.map((tip, i) => (
                  <BulletItem key={i} text={tip} color="violet" />
                ))}
              </Section>
            )}
          </div>
        </TabsContent>

        <TabsContent value="style">
          <Section title="Best Clothing Colors for Your Skin Tone">
            {result.clothingColors.map((c, i) => (
              <BulletItem key={i} text={c} color="sky" />
            ))}
          </Section>
        </TabsContent>

        <TabsContent value="posture">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-black text-white">{result.postureScore}</span>
              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-1">Posture Score</p>
                <Progress value={result.postureScore} className="h-1.5" />
              </div>
            </div>
            <Section title="Corrections">
              {result.postureCorrections.map((tip, i) => (
                <BulletItem key={i} text={tip} color="emerald" />
              ))}
            </Section>
          </div>
        </TabsContent>

        <TabsContent value="coaching">
          <Card>
            <CardContent className="pt-6">
              <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">
                {result.overallCoaching}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{title}</p>
        <div className="space-y-2">{children}</div>
      </CardContent>
    </Card>
  );
}

function BulletItem({ text, color }: { text: string; color: string }) {
  const dotColor = color === 'violet' ? 'bg-violet-400' :
    color === 'sky' ? 'bg-sky-400' : 'bg-emerald-400';
  return (
    <div className="flex gap-2.5 text-sm text-slate-300">
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0 mt-1.5`} />
      <span>{text}</span>
    </div>
  );
}
