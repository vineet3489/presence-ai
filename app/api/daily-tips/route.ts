import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callClaude } from '@/lib/claude/client';
import { DAILY_TIPS_SYSTEM_PROMPT, buildDailyTipsPrompt } from '@/lib/claude/prompts';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const today = new Date().toISOString().split('T')[0];

    // Return existing tips if already generated today
    const { data: existing } = await supabase
      .from('daily_tips')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('created_at');

    if (existing && existing.length === 3) {
      return NextResponse.json({ tips: existing });
    }

    // Delete partial tips for today (edge case) and regenerate
    if (existing && existing.length > 0) {
      await supabase.from('daily_tips').delete().eq('user_id', user.id).eq('date', today);
    }

    const { data: profile } = await supabase
      .from('user_profiles').select('*').eq('user_id', user.id).single();

    const prompt = buildDailyTipsPrompt(profile);
    const raw = await callClaude(DAILY_TIPS_SYSTEM_PROMPT, prompt, 800);

    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Could not parse tips from Claude');
    const tips: { category: string; tip: string }[] = JSON.parse(jsonMatch[0]);

    const rows = tips.map((t) => ({
      user_id: user.id,
      date: today,
      category: t.category,
      tip_text: t.tip,
    }));

    const { data: inserted } = await supabase
      .from('daily_tips').insert(rows).select();

    return NextResponse.json({ tips: inserted ?? [] });
  } catch (err) {
    console.error('[daily-tips]', err);
    return NextResponse.json({ error: 'Could not load tips.' }, { status: 500 });
  }
}
