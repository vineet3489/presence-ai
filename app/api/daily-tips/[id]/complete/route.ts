import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const XP_PER_TIP = 5;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Mark tip complete
    const { data: tip, error: tipErr } = await supabase
      .from('daily_tips')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('completed', false) // idempotent guard
      .select()
      .single();

    if (tipErr || !tip) {
      return NextResponse.json({ error: 'Tip not found or already completed.' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if all 3 tips for today are now done
    const { data: todaysTips } = await supabase
      .from('daily_tips')
      .select('completed')
      .eq('user_id', user.id)
      .eq('date', today);

    const allDone = todaysTips?.every((t) => t.completed) && todaysTips.length === 3;

    // Fetch current profile stats
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('presence_xp, tip_streak, last_tip_date')
      .eq('user_id', user.id)
      .single();

    const currentXp = (profile?.presence_xp ?? 0) + XP_PER_TIP;
    let newStreak = profile?.tip_streak ?? 0;

    if (allDone) {
      const lastDate = profile?.last_tip_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === yesterdayStr) {
        newStreak = newStreak + 1;
      } else if (lastDate !== today) {
        newStreak = 1;
      }
      // If lastDate === today, all tips were already done earlier — streak unchanged

      await supabase
        .from('user_profiles')
        .update({ presence_xp: currentXp, tip_streak: newStreak, last_tip_date: today })
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('user_profiles')
        .update({ presence_xp: currentXp })
        .eq('user_id', user.id);
    }

    return NextResponse.json({ xp: currentXp, streak: newStreak, allDone });
  } catch (err) {
    console.error('[daily-tips/complete]', err);
    return NextResponse.json({ error: 'Could not complete tip.' }, { status: 500 });
  }
}
