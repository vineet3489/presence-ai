import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any;

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ?? '';
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (webhookSecret) {
    const expected = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');
    if (expected !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  } else {
    console.warn('[webhook] RAZORPAY_WEBHOOK_SECRET not set — skipping signature check');
  }

  const event = JSON.parse(rawBody) as {
    event: string;
    payload: { subscription?: { entity: Record<string, unknown> } };
  };

  const entity = event.payload?.subscription?.entity;
  if (!entity) return NextResponse.json({ ok: true });

  const subscriptionId = entity.id as string;
  const admin = createAdminClient() as AnyTable;

  switch (event.event) {
    case 'subscription.charged': {
      // Charge succeeded — mark active, set subscription_ends_at to current period end
      const currentEnd = entity.current_end as number | undefined;
      const endsAt = currentEnd
        ? new Date(currentEnd * 1000).toISOString()
        : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();
      await admin
        .from('user_profiles')
        .update({ subscription_status: 'active', subscription_ends_at: endsAt })
        .eq('razorpay_subscription_id', subscriptionId);
      break;
    }
    case 'subscription.halted':
    case 'subscription.cancelled':
    case 'subscription.completed':
      await admin
        .from('user_profiles')
        .update({ subscription_status: 'expired' })
        .eq('razorpay_subscription_id', subscriptionId);
      break;
    case 'subscription.authenticated':
      // Mandate authorized — backup for cases where the client-side handler fails
      await admin
        .from('user_profiles')
        .update({
          subscription_status: 'trial',
          trial_started_at: new Date().toISOString(),
          razorpay_subscription_id: subscriptionId,
        })
        .eq('razorpay_subscription_id', subscriptionId)
        .is('trial_started_at', null); // only update if not already set
      break;
  }

  return NextResponse.json({ ok: true });
}
