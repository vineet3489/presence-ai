import { NextResponse } from 'next/server';
import { callClaude } from '@/lib/claude/client';
import { PRE_DATE_CHECKLIST_SYSTEM_PROMPT, buildPreDateChecklistPrompt } from '@/lib/claude/prompts';
import { createClient } from '@/lib/supabase/server';
import type { PreDateChecklistData } from '@/types';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data: PreDateChecklistData = await req.json();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const raw = await callClaude(
    PRE_DATE_CHECKLIST_SYSTEM_PROMPT,
    buildPreDateChecklistPrompt(data, profile),
    1200
  );

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return NextResponse.json({ error: 'Failed to generate checklist' }, { status: 500 });

  return NextResponse.json({ result: JSON.parse(jsonMatch[0]) });
}
