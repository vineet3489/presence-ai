import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callClaude } from '@/lib/claude/client';
import { COACH_MESSAGE_SYSTEM_PROMPT } from '@/lib/claude/prompts';
import type { CoachingMemory } from '@/lib/claude/client';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('coaching_memory, tip_streak, presence_xp, primary_goal')
    .eq('user_id', user.id)
    .single();

  const memory = (profile as Record<string, unknown> | null)?.coaching_memory as CoachingMemory | null;
  const streak = (profile as Record<string, unknown> | null)?.tip_streak as number ?? 0;

  const prompt = `User stats: streak ${streak} days, goal: ${(profile as Record<string, unknown> | null)?.primary_goal ?? 'dating'}.
Generate a 1-2 sentence coach message for this week.`;

  const message = await callClaude(COACH_MESSAGE_SYSTEM_PROMPT, prompt, 120, memory);
  return NextResponse.json({ message: message.trim() });
}
