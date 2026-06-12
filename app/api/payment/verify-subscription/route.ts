import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = await req.json() as {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  };

  // Signature for subscriptions: HMAC(payment_id + "|" + subscription_id)
  const expected = crypto
    .createHmac('sha256', (process.env.RAZORPAY_KEY_SECRET ?? '').trim())
    .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
    .digest('hex');

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({
      subscription_status: 'trial',
      trial_started_at: new Date().toISOString(),
      razorpay_subscription_id,
    })
    .eq('user_id', user.id);

  if (error) {
    console.error('[verify-subscription] DB error:', error);
    return NextResponse.json({ error: 'Failed to activate trial' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
