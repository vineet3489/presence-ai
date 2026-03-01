'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MessageSquare, AlertCircle, Dumbbell, Star } from 'lucide-react';
import type { VoiceResult } from '@/types';

interface Props {
  result: VoiceResult;
  score: number;
}

export function TranscriptViewer({ result, score }: Props) {
  return (
    <div className="space-y-6">
      {/* Score Header */}
      <div className="flex flex-wrap gap-4 rounded-2xl border border-sky-800/40 bg-sky-900/10 p-5">
        <div className="flex flex-col items-center min-w-16">
          <span className="text-4xl font-black text-white">{score}</span>
          <span className="text-xs text-slate-400">/100</span>
        </div>
        <div className="flex-1 min-w-40">
          <p className="text-sm font-medium text-white mb-1">Voice Score</p>
          <Progress value={score} className="h-2 mb-3" />
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Clarity: {result.clarityScore}/100</Badge>
            <Badge variant="secondary">{result.paceWpm} wpm</Badge>
            {result.fillerWordCount > 0 && (
              <Badge variant="warning">{result.fillerWordCount} fillers</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Tone */}
      <Card>
        <CardContent className="pt-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tone Assessment</p>
          <p className="text-slate-300 text-sm">{result.toneAssessment}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="feedback">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feedback" className="text-xs gap-1">
            <MessageSquare size={13} /> Feedback
          </TabsTrigger>
          <TabsTrigger value="grammar" className="text-xs gap-1">
            <AlertCircle size={13} /> Grammar
          </TabsTrigger>
          <TabsTrigger value="exercises" className="text-xs gap-1">
            <Dumbbell size={13} /> Exercises
          </TabsTrigger>
          <TabsTrigger value="coaching" className="text-xs gap-1">
            <Star size={13} /> Coaching
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feedback">
          <div className="space-y-4">
            {result.strengthsList.length > 0 && (
              <Card>
                <CardContent className="pt-5">
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">Strengths</p>
                  <div className="space-y-2">
                    {result.strengthsList.map((s, i) => (
                      <div key={i} className="flex gap-2.5 text-sm text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                        {s}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">Areas to Improve</p>
                <div className="space-y-2">
                  {result.improvementsList.map((s, i) => (
                    <div key={i} className="flex gap-2.5 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                      {s}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {result.fillerWords.length > 0 && (
              <Card>
                <CardContent className="pt-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Filler Words Detected ({result.fillerWordCount} total)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.fillerWords.map((f) => (
                      <Badge key={f.word} variant="warning">
                        "{f.word}" × {f.count}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="grammar">
          <Card>
            <CardContent className="pt-5">
              {result.grammarIssues.length === 0 ? (
                <p className="text-emerald-400 text-sm">No grammar issues found — great job!</p>
              ) : (
                <div className="space-y-4">
                  {result.grammarIssues.map((issue, i) => (
                    <div key={i} className="border border-slate-800 rounded-lg p-4">
                      <p className="text-xs text-slate-500 mb-1">Original</p>
                      <p className="text-red-400 text-sm line-through mb-2">"{issue.original}"</p>
                      <p className="text-xs text-slate-500 mb-1">Better phrasing</p>
                      <p className="text-emerald-400 text-sm mb-2">"{issue.suggestion}"</p>
                      <p className="text-xs text-slate-500 italic">{issue.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exercises">
          <div className="space-y-3">
            {result.exercises.map((ex, i) => (
              <Card key={i}>
                <CardContent className="pt-5">
                  <div className="flex gap-3">
                    <span className="w-7 h-7 rounded-full bg-violet-600/20 text-violet-400 text-sm font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-slate-300 text-sm leading-relaxed">{ex}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
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
