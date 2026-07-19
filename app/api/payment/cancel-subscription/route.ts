import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const KEY_ID = (process.env.RAZORPAY_KEY_ID ?? '').trim();
const KEY_SECRET = (process.env.RAZORPAY_KEY_SECRET ?? '').trim();
const rzpAuth = () => 'Basic ' + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_status, razorpay_subscription_id')
    .eq('user_id', user.id)
    .single();

  const subscriptionId = (profile as { razorpay_subscription_id?: string | null } | null)
    ?.razorpay_subscription_id;

  // Cancel on Razorpay if a subscription ID exists
  if (subscriptionId && KEY_ID && KEY_SECRET) {
    try {
      await fetch(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: { Authorization: rzpAuth(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancel_at_cycle_end: 0 }), // immediate
      });
    } catch (e) {
      console.error('[cancel-subscription] Razorpay cancel error:', e);
    }
  }

  // Mark as expired in DB regardless (source of truth for access)
  await supabase
    .from('user_profiles')
    .update({ subscription_status: 'expired' })
    .eq('user_id', user.id);

  return NextResponse.json({ success: true });
}
