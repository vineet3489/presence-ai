import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callClaude } from '@/lib/claude/client';
import { CHAT_COACH_SYSTEM_PROMPT, buildChatCoachPrompt } from '@/lib/claude/prompts';
import type { ChatCoachData, ChatCoachResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body: ChatCoachData = await request.json();

    if (!body.chatText || body.chatText.trim().length < 50) {
      return NextResponse.json({ error: 'Chat is too short to analyze. Paste more of the conversation.' }, { status: 400 });
    }

    const prompt = buildChatCoachPrompt(body);
    const raw = await callClaude(CHAT_COACH_SYSTEM_PROMPT, prompt, 3000);

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse Claude response');
    const result: ChatCoachResult = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ result });
  } catch (err) {
    console.error('[chat-coach]', err);
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
  }
}
