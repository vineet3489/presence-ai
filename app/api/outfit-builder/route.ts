import { NextResponse } from 'next/server';
import { callClaude } from '@/lib/claude/client';
import { OUTFIT_BUILDER_SYSTEM_PROMPT, buildOutfitBuilderPrompt } from '@/lib/claude/prompts';
import { createClient } from '@/lib/supabase/server';
import type { OutfitBuilderData } from '@/types';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data: OutfitBuilderData = await req.json();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const raw = await callClaude(
    OUTFIT_BUILDER_SYSTEM_PROMPT,
    buildOutfitBuilderPrompt(data, profile),
    1500
  );

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return NextResponse.json({ error: 'Failed to generate outfit suggestions' }, { status: 500 });

  return NextResponse.json({ result: JSON.parse(jsonMatch[0]) });
}
