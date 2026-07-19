import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callClaude } from '@/lib/claude/client';
import { DATE_PREP_SYSTEM_PROMPT, buildDatePrepPrompt } from '@/lib/claude/prompts';
import { scoreDatePrep } from '@/lib/scoring/presenceScore';
import type { DatePrepData, DatePrepResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body: DatePrepData = await request.json();

    const { data: profile } = await supabase
      .from('user_profiles').select('*').eq('user_id', user.id).single();

    const prompt = buildDatePrepPrompt(body, profile);
    const raw = await callClaude(DATE_PREP_SYSTEM_PROMPT, prompt, 2500);

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse Claude response');
    const result: DatePrepResult = JSON.parse(jsonMatch[0]);

    const score = scoreDatePrep();

    const { data: session } = await supabase
      .from('analysis_sessions')
      .insert({
        user_id: user.id,
        session_type: 'date_prep',
        date_prep_data: body,
        date_prep_result: result,
        social_score: score,
      })
      .select()
      .single();

    return NextResponse.json({ result, score, sessionId: session?.id });
  } catch (err) {
    console.error('[date-coaching]', err);
    return NextResponse.json({ error: 'Coaching generation failed. Please try again.' }, { status: 500 });
  }
}
