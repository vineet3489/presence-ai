import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callClaudeWithImage } from '@/lib/claude/client';
import { APPEARANCE_SYSTEM_PROMPT, buildAppearancePrompt } from '@/lib/claude/prompts';
import { scoreAppearance } from '@/lib/scoring/presenceScore';
import type { AppearanceResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { imageBase64, mediaType = 'image/jpeg' } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Fetch user profile for personalization
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const prompt = buildAppearancePrompt(profile);
    const raw = await callClaudeWithImage(
      APPEARANCE_SYSTEM_PROMPT,
      prompt,
      imageBase64,
      mediaType,
      2000
    );

    // Parse JSON from Claude response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse Claude response');
    const result: AppearanceResult = JSON.parse(jsonMatch[0]);
    const score = scoreAppearance(result);

    // Save session to DB
    const { data: session, error: dbError } = await supabase
      .from('analysis_sessions')
      .insert({
        user_id: user.id,
        session_type: 'appearance',
        appearance_result: result,
        appearance_score: score,
      })
      .select()
      .single();

    if (dbError) console.error('DB save error:', dbError);

    return NextResponse.json({ result, score, sessionId: session?.id });
  } catch (err) {
    console.error('[analyze-appearance]', err);
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
  }
}
