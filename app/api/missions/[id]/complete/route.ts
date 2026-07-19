import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const { data: mission } = await supabase
    .from('daily_missions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!mission) return NextResponse.json({ error: 'Mission not found' }, { status: 404 });

  const xp = mission.xp_value ?? 10;

  // Mark complete + award XP
  await supabase.from('daily_missions').update({ completed: true }).eq('id', id);

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('presence_xp, tip_streak')
    .eq('user_id', user.id)
    .single();

  const newXp = (profile?.presence_xp ?? 0) + xp;
  const newStreak = (profile?.tip_streak ?? 0) + 1;
  await supabase.from('user_profiles').update({ presence_xp: newXp, tip_streak: newStreak }).eq('user_id', user.id);

  const requiresReflection = ['medium', 'hard', 'very_hard'].includes(mission.difficulty ?? 'easy');

  return NextResponse.json({ xp: newXp, streak: newStreak, requiresReflection });
}
