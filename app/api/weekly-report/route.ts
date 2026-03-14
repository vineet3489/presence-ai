import { NextResponse } from 'next/server';
import { callClaude } from '@/lib/claude/client';
import { WEEKLY_REPORT_SYSTEM_PROMPT, buildWeeklyReportPrompt } from '@/lib/claude/prompts';
import { createClient } from '@/lib/supabase/server';
import type { AnalysisSession } from '@/types';

function avg(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null);
  return valid.length ? valid.reduce((s, v) => s + v, 0) / valid.length : null;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [{ data: thisWeekSessions }, { data: lastWeekSessions }, { data: profile }] = await Promise.all([
    supabase
      .from('analysis_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', weekAgo.toISOString()),
    supabase
      .from('analysis_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', twoWeeksAgo.toISOString())
      .lt('created_at', weekAgo.toISOString()),
    supabase
      .from('user_profiles')
      .select('presence_xp, tip_streak')
      .eq('user_id', user.id)
      .single(),
  ]);

  const tw = (thisWeekSessions || []) as AnalysisSession[];
  const lw = (lastWeekSessions || []) as AnalysisSession[];

  const reportData = {
    weekAvgAppearance: avg(tw.map((s) => s.appearance_score)),
    weekAvgVoice: avg(tw.map((s) => s.voice_score)),
    weekAvgSocial: avg(tw.map((s) => s.social_score)),
    prevAvgAppearance: avg(lw.map((s) => s.appearance_score)),
    prevAvgVoice: avg(lw.map((s) => s.voice_score)),
    prevAvgSocial: avg(lw.map((s) => s.social_score)),
    sessionCount: tw.length,
    xp: profile?.presence_xp ?? 0,
    streak: profile?.tip_streak ?? 0,
  };

  const raw = await callClaude(
    WEEKLY_REPORT_SYSTEM_PROMPT,
    buildWeeklyReportPrompt(reportData),
    400
  );

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const aiInsights = jsonMatch ? JSON.parse(jsonMatch[0]) : {
    coachSummary: 'Keep showing up — consistency is the skill.',
    topImprovement: 'Complete more sessions to see your top improvement.',
    focusArea: 'Run at least one scan, voice check, or date prep this week.',
  };

  return NextResponse.json({ ...reportData, ...aiInsights });
}
