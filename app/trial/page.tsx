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
  const trialStartedAt = profile?.trial_started_at;

  // If user already has valid access, send them into the app
  const now = Date.now();
  if (status === 'active') {
    const endsAt = profile?.subscription_ends_at;
    if (!endsAt || new Date(endsAt).getTime() > now) redirect('/dashboard');
  }
  if (status === 'trial' && trialStartedAt) {
    const trialEnd = new Date(trialStartedAt).getTime() + 3 * 24 * 60 * 60 * 1000;
    if (trialEnd > now) redirect('/dashboard');
  }

  const isFirstTrial = status === 'none' || !trialStartedAt;

  return <TrialCheckout isFirstTrial={isFirstTrial} />;
}
