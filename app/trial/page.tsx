import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TrialCheckout } from './TrialCheckout';

export default async function TrialPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_status, trial_started_at, subscription_ends_at, razorpay_subscription_id')
    .eq('user_id', user.id)
    .single();

  const status = profile?.subscription_status ?? 'none';
  const now = Date.now();

  // Already has valid access — send them in
  if (status === 'active') {
    const endsAt = profile?.subscription_ends_at;
    if (!endsAt || new Date(endsAt).getTime() > now) redirect('/dashboard');
  }
  if (status === 'trial' && profile?.trial_started_at) {
    const trialEnd = new Date(profile.trial_started_at).getTime() + 3 * 24 * 60 * 60 * 1000;
    if (trialEnd > now) redirect('/dashboard');
  }

  // Show free trial offer if they've never actually subscribed via Razorpay.
  // 'trial' set by old onboarding bug (no Razorpay) counts as first trial too.
  const hasRealSubscription = !!(profile as { razorpay_subscription_id?: string | null } | null)
    ?.razorpay_subscription_id;
  const isFirstTrial = status === 'none' || status === null || (status === 'trial' && !hasRealSubscription);

  return <TrialCheckout isFirstTrial={isFirstTrial} />;
}
