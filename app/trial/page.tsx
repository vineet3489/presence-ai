import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TrialCheckout } from './TrialCheckout';

export default async function TrialPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_status, trial_started_at, subscription_ends_at')
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

  // First trial = never started before (status is 'none')
  // Returning/expired user sees subscribe screen (no extra free trial)
  const isFirstTrial = status === 'none' || status === null;

  return <TrialCheckout isFirstTrial={isFirstTrial} />;
}
