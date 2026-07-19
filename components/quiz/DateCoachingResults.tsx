'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Shirt, MessageCircle, Hand, AlertTriangle, Zap, Star } from 'lucide-react';
import type { DatePrepResult } from '@/types';

interface Props {
  result: DatePrepResult;
}

export function DateCoachingResults({ result }: Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-pink-800/40 bg-pink-900/10 p-5">
        <p className="text-xs font-semibold text-pink-400 uppercase tracking-wider mb-1">Date Prep Complete</p>
        <p className="text-slate-300 text-sm leading-relaxed">{result.overallCoaching}</p>
      </div>

      <Section icon={Shirt} label="What to Wear" color="text-violet-400">
        <p className="text-slate-300 text-sm leading-relaxed">{result.whatToWear}</p>
      </Section>

      <Section icon={MessageCircle} label="How to Open" color="text-sky-400">
        <p className="text-slate-300 text-sm leading-relaxed">{result.howToOpen}</p>
      </Section>

      <Section icon={Star} label="Conversation Starters" color="text-amber-400">
        <ol className="space-y-2">
          {result.conversationStarters.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-300">
              <span className="w-5 h-5 rounded-full bg-amber-600/20 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </Section>

      <Section icon={Hand} label="Body Language Tips" color="text-emerald-400">
        <div className="space-y-2">
          {result.bodyLanguageTips.map((tip, i) => (
            <div key={i} className="flex gap-2.5 text-sm text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
              {tip}
            </div>
          ))}
        </div>
      </Section>

      <Section icon={Zap} label="Handling Nerves" color="text-pink-400">
        <p className="text-slate-300 text-sm leading-relaxed">{result.nervousnessStrategy}</p>
      </Section>

      {result.thingsToAvoid.length > 0 && (
        <Section icon={AlertTriangle} label="Things to Avoid" color="text-red-400">
          <div className="space-y-2">
            {result.thingsToAvoid.map((tip, i) => (
              <div key={i} className="flex gap-2.5 text-sm text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
                {tip}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({
  icon: Icon, label, color, children,
}: {
  icon: React.ElementType; label: string; color: string; children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center gap-2 mb-3">
          <Icon size={16} className={color} />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
