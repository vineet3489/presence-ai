import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { callClaude } from '@/lib/claude/client';
import { MISSION_ENGINE_SYSTEM_PROMPT } from '@/lib/claude/prompts';
import type { CoachingMemory } from '@/lib/claude/client';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminClient();
    const today = new Date().toISOString().split('T')[0];

    // Use admin client to read — avoids RLS issues, also handles both tip_text and mission_text columns
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rows } = await (admin as any)
      .from('daily_missions')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('created_at', { ascending: false })
      .limit(5);

    // Normalise: table may have tip_text (old) or mission_text (new) column
    const existing = rows?.[0] ? normalise(rows[0]) : null;

    // Delete ALL bad rows for today (null text, duplicates)
    const badRows = (rows || []).filter((r: Record<string, unknown>) => !r.mission_text && !r.tip_text);
    if (badRows.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any).from('daily_missions').delete()
        .in('id', badRows.map((r: Record<string, unknown>) => r.id));
    }
    // Delete extra duplicate rows beyond the first
    if ((rows?.length || 0) > 1) {
      const extras = rows.slice(1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any).from('daily_missions').delete()
        .in('id', extras.map((r: Record<string, unknown>) => r.id));
    }

    if (existing?.mission_text) {
      return NextResponse.json({ mission: existing });
    }

    // Generate new mission
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('primary_goal, goals, age, city, tip_streak, coaching_memory')
      .eq('user_id', user.id)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: recentMissions } = await (admin as any)
      .from('daily_missions')
      .select('mission_text, tip_text, category')
      .eq('user_id', user.id)
      .gte('date', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    const primaryGoal = (profile as Record<string, unknown> | null)?.primary_goal as string ?? 'dating';
    const streak = (profile as Record<string, unknown> | null)?.tip_streak as number ?? 0;
    const memory = (profile as Record<string, unknown> | null)?.coaching_memory as CoachingMemory | null;

    const dow = new Date().getDay();
    const dayCategory = ['reflection', 'appearance', 'confidence', 'voice', 'conversation', 'dating', 'grooming'][dow];
    const recentList = (recentMissions ?? [])
      .map((m: Record<string, unknown>) => m.mission_text || m.tip_text)
      .filter(Boolean).join(' | ');
    const difficultyGuidance = streak >= 14 ? 'hard or very_hard' : streak >= 7 ? 'medium or hard' : streak <= 2 ? 'easy or medium' : 'medium';

    const prompt = `Generate today's mission for this user.

Primary goal: ${primaryGoal}
City: ${(profile as Record<string, unknown> | null)?.city ?? 'India'}
Age: ${(profile as Record<string, unknown> | null)?.age ?? 'unknown'}
Current streak: ${streak} days
Today's focus category: ${dayCategory}
Recommended difficulty: ${difficultyGuidance}
Recent missions (do NOT repeat): ${recentList || 'none yet'}

Make the mission specific to ${primaryGoal === 'dating' ? 'dating confidence and social skills' : primaryGoal === 'career' ? 'professional presence and communication' : 'overall confidence and presence'}.`;

    const raw = await callClaude(MISSION_ENGINE_SYSTEM_PROMPT, prompt, 500, memory);
    console.log('[missions/today] claude raw:', raw.slice(0, 300));

    const jsonMatch = raw.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) throw new Error('Claude did not return JSON');
    const parsed = JSON.parse(jsonMatch[0]);

    const missionText = (parsed.instruction || parsed.mission || parsed.text || parsed.action || '').trim();
    if (!missionText) throw new Error(`Claude JSON missing instruction. Keys: ${Object.keys(parsed).join(',')}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inserted, error: insertErr } = await (admin as any)
      .from('daily_missions')
      .insert({
        user_id: user.id,
        date: today,
        category: parsed.category || 'confidence',
        difficulty: parsed.difficulty || 'easy',
        mission_text: missionText,
        why_text: parsed.why || parsed.why_text || '',
        xp_value: parsed.xp_value || 10,
        completed: false,
      })
      .select()
      .single();

    if (insertErr) {
      console.error('[missions/today] insert error:', insertErr);
      // Return a synthetic mission even if DB insert fails
      return NextResponse.json({
        mission: {
          id: 'temp',
          user_id: user.id,
          date: today,
          mission_text: missionText,
          why_text: parsed.why || '',
          category: parsed.category || 'confidence',
          difficulty: parsed.difficulty || 'easy',
          xp_value: parsed.xp_value || 10,
          completed: false,
          title: parsed.title,
          requires_reflection: parsed.requires_reflection,
        },
      });
    }

    return NextResponse.json({
      mission: { ...inserted, title: parsed.title, requires_reflection: parsed.requires_reflection },
    });

  } catch (err) {
    console.error('[missions/today] error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// Normalise row — handle both tip_text (legacy) and mission_text (new) column names
function normalise(row: Record<string, unknown>): Record<string, unknown> {
  return {
    ...row,
    mission_text: (row.mission_text || row.tip_text || '') as string,
  };
}
