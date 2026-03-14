import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
  }

  // Grant 7 days of access
  const subscriptionEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('user_profiles')
    .update({
      subscription_status: 'active',
      subscription_ends_at: subscriptionEndsAt,
    })
    .eq('user_id', user.id);

  if (error) {
    console.error('Supabase update error:', error);
    return NextResponse.json({ error: 'Failed to activate subscription' }, { status: 500 });
  }

  return NextResponse.json({ success: true, subscriptionEndsAt });
}
