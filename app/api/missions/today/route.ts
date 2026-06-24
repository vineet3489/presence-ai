import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callClaude } from '@/lib/claude/client';
import { MISSION_ENGINE_SYSTEM_PROMPT } from '@/lib/claude/prompts';
import type { CoachingMemory } from '@/lib/claude/client';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const today = new Date().toISOString().split('T')[0];

    // Return today's mission if already generated
    const { data: existing } = await supabase
      .from('daily_missions')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (existing) return NextResponse.json({ mission: existing });

    // Get user profile + coaching memory
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('primary_goal, goals, age, city, tip_streak, coaching_memory')
      .eq('user_id', user.id)
      .single();

    // Get last 14 days of missions to prevent repetition
    const { data: recentMissions } = await supabase
      .from('daily_missions')
      .select('mission_text, category')
      .eq('user_id', user.id)
      .gte('date', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    const primaryGoal = (profile as Record<string, unknown> | null)?.primary_goal as string ?? 'dating';
    const streak = (profile as Record<string, unknown> | null)?.tip_streak as number ?? 0;
    const memory = (profile as Record<string, unknown> | null)?.coaching_memory as CoachingMemory | null;

    // Day-of-week category guidance
    const dow = new Date().getDay(); // 0=Sun,1=Mon,...,6=Sat
    const dayCategory = ['reflection', 'appearance', 'confidence', 'voice', 'conversation', 'dating', 'grooming'][dow];

    const recentList = (recentMissions ?? []).map(m => m.mission_text).join(' | ');
    const difficultyGuidance = streak >= 14 ? 'hard or very_hard' : streak >= 7 ? 'medium or hard' : streak <= 2 ? 'easy or medium' : 'medium';

    const prompt = `Generate today's mission for this user.

Primary goal: ${primaryGoal}
City: ${profile?.city ?? 'India'}
Age: ${profile?.age ?? 'unknown'}
Current streak: ${streak} days
Today's focus category: ${dayCategory}
Recommended difficulty: ${difficultyGuidance}
Recent missions (do NOT repeat): ${recentList || 'none yet'}

Make the mission specific to ${primaryGoal === 'dating' ? 'dating confidence and social skills' : primaryGoal === 'career' ? 'professional presence and communication' : 'overall confidence and presence'}.`;

    const raw = await callClaude(MISSION_ENGINE_SYSTEM_PROMPT, prompt, 500, memory);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse mission');
    const mission = JSON.parse(jsonMatch[0]);

    const { data: inserted } = await supabase
      .from('daily_missions')
      .insert({
        user_id: user.id,
        date: today,
        category: mission.category,
        difficulty: mission.difficulty,
        mission_text: mission.instruction,
        why_text: mission.why,
        xp_value: mission.xp_value,
        completed: false,
      })
      .select()
      .single();

    return NextResponse.json({ mission: { ...inserted, title: mission.title, requires_reflection: mission.requires_reflection } });
  } catch (err) {
    console.error('[missions/today]', err);
    return NextResponse.json({ error: 'Could not load mission' }, { status: 500 });
  }
}
