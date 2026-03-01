import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callClaude } from '@/lib/claude/client';
import { VOICE_SYSTEM_PROMPT, buildVoicePrompt } from '@/lib/claude/prompts';
import { scoreVoice } from '@/lib/scoring/presenceScore';
import { countFillerWords } from '@/lib/utils';
import type { VoiceResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { transcript, durationSeconds } = body;

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    const voiceData = { transcript, durationSeconds: durationSeconds || 60 };
    const prompt = buildVoicePrompt(voiceData);
    const raw = await callClaude(VOICE_SYSTEM_PROMPT, prompt, 2000);

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse Claude response');
    const result: VoiceResult = JSON.parse(jsonMatch[0]);

    // Override filler words with our own accurate count
    const fillerWords = countFillerWords(transcript);
    result.fillerWords = fillerWords;
    result.fillerWordCount = fillerWords.reduce((sum, f) => sum + f.count, 0);

    const score = scoreVoice(result);

    const { data: session } = await supabase
      .from('analysis_sessions')
      .insert({
        user_id: user.id,
        session_type: 'voice',
        voice_data: voiceData,
        voice_result: result,
        voice_score: score,
      })
      .select()
      .single();

    return NextResponse.json({ result, score, sessionId: session?.id });
  } catch (err) {
    console.error('[analyze-voice]', err);
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
  }
}
