import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const KEY_ID = process.env.RAZORPAY_KEY_ID!;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;
const rzpAuth = () => 'Basic ' + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');

// Cached per cold-start — set RAZORPAY_PLAN_ID in Vercel env after first creation (check logs)
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
        amount: 34900,   // ₹349 in paise
        currency: 'INR',
        description: 'Full access to PresenceAI',
      },
    }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Razorpay plan creation failed (${res.status}): ${text}`);

  const data = JSON.parse(text) as { id: string };
  _cachedPlanId = data.id;
  // IMPORTANT: copy this plan ID into Vercel env as RAZORPAY_PLAN_ID to avoid recreating on cold starts
  console.log(`[Razorpay] Plan created: RAZORPAY_PLAN_ID=${_cachedPlanId}`);
  return _cachedPlanId;
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!KEY_ID || !KEY_SECRET) {
    return NextResponse.json({ error: 'Razorpay keys not configured on server' }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('razorpay_subscription_id')
    .eq('user_id', user.id)
    .single();

  // Offer trial to anyone who has never completed a Razorpay subscription
  const isFirstTrial = !profile?.razorpay_subscription_id;

  try {
    const planId = await getOrCreatePlan();

    const body: Record<string, unknown> = {
      plan_id: planId,
      customer_notify: 1,
      quantity: 1,
      total_count: 120,
      notes: { user_id: user.id },
    };

    if (isFirstTrial) {
      // start_at = 3 days from now — mandate authorized today, first charge on day 4
      body.start_at = Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60;
    }

    const res = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: { Authorization: rzpAuth(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error('[create-subscription] Razorpay error:', text);
      return NextResponse.json({ error: `Razorpay: ${text}` }, { status: 500 });
    }

    const sub = JSON.parse(text) as { id: string };
    return NextResponse.json({ subscriptionId: sub.id, key: KEY_ID, isFirstTrial });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[create-subscription]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
