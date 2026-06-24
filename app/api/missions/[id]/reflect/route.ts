import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callClaude } from '@/lib/claude/client';
import { REFLECTION_COACH_SYSTEM_PROMPT } from '@/lib/claude/prompts';
import type { CoachingMemory } from '@/lib/claude/client';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { reflection } = await req.json() as { reflection: string };

  if (!reflection?.trim()) {
    return NextResponse.json({ error: 'Reflection text required' }, { status: 400 });
  }

  const { data: mission } = await supabase
    .from('daily_missions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!mission) return NextResponse.json({ error: 'Mission not found' }, { status: 404 });

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('coaching_memory')
    .eq('user_id', user.id)
    .single();

  const memory = (profile as Record<string, unknown> | null)?.coaching_memory as CoachingMemory | null;

  const prompt = `Mission: "${mission.mission_text}"
User's reflection: "${reflection}"

Give ONE coaching sentence in response.`;

  const coachResponse = await callClaude(REFLECTION_COACH_SYSTEM_PROMPT, prompt, 100, memory);

  // Save reflection + coach response
  await supabase
    .from('daily_missions')
    .update({ reflection_text: reflection.trim(), coach_response: coachResponse.trim() })
    .eq('id', id);

  // Update coaching memory
  const currentMemory: CoachingMemory = memory ?? { patterns: {}, history: [], coach_observations: [] };
  const history = currentMemory.history ?? [];
  history.push({
    date: new Date().toISOString().split('T')[0],
    type: `mission_${mission.category}`,
    score: 0,
    key_insight: coachResponse.slice(0, 120),
  });
  if (history.length > 50) history.splice(0, history.length - 50); // cap at 50 entries

  await supabase
    .from('user_profiles')
    .update({ coaching_memory: { ...currentMemory, history } })
    .eq('user_id', user.id);

  return NextResponse.json({ coachResponse: coachResponse.trim() });
}
