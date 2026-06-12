import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const KEY_ID = process.env.RAZORPAY_KEY_ID!;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;
const rzpAuth = () => 'Basic ' + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');

// Cached per cold-start — user should set RAZORPAY_PLAN_ID in env after first run
let _cachedPlanId: string | null = null;

async function getOrCreatePlan(): Promise<string> {
  if (process.env.RAZORPAY_PLAN_ID) return process.env.RAZORPAY_PLAN_ID;
  if (_cachedPlanId) return _cachedPlanId;

  const res = await fetch('https://api.razorpay.com/v1/plans', {
    method: 'POST',
    headers: { Authorization: rzpAuth(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      period: 'monthly',
      interval: 1,
      item: {
        name: 'PresenceAI Monthly',
        amount: 34900,
        unit_amount: 34900,
        currency: 'INR',
        description: 'Full access to PresenceAI — appearance, voice & date coaching',
      },
    }),
  });

  if (!res.ok) throw new Error(`Plan creation failed: ${await res.text()}`);
  const data = await res.json() as { id: string };
  _cachedPlanId = data.id;
  console.log(`[Razorpay] Created plan ${_cachedPlanId} — add RAZORPAY_PLAN_ID=${_cachedPlanId} to Vercel env vars`);
  return _cachedPlanId;
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!KEY_ID || !KEY_SECRET) return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 });

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_status, trial_started_at, razorpay_subscription_id')
    .eq('user_id', user.id)
    .single();

  const isFirstTrial = !profile?.trial_started_at;

  try {
    const planId = await getOrCreatePlan();

    const body: Record<string, unknown> = {
      plan_id: planId,
      customer_notify: 1,
      quantity: 1,
      total_count: 120, // ~10 years of monthly renewals
      notes: { user_id: user.id },
    };

    if (isFirstTrial) {
      body.trial_length = 3; // 3-day free trial before first charge
    }

    const res = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: { Authorization: rzpAuth(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[create-subscription] Razorpay error:', err);
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
    }

    const sub = await res.json() as { id: string };
    return NextResponse.json({ subscriptionId: sub.id, key: KEY_ID, isFirstTrial });
  } catch (err) {
    console.error('[create-subscription]', err);
    return NextResponse.json({ error: 'Subscription setup failed' }, { status: 500 });
  }
}
