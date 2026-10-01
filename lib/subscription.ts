import { SKIP_SUBSCRIPTION_GATE } from '@/lib/featureFlags';

export function hasActiveAccess(profile: {
  subscription_status: string | null;
  trial_started_at: string | null;
  subscription_ends_at: string | null;
} | null): boolean {
  if (SKIP_SUBSCRIPTION_GATE) return true;
  if (!profile) return false;
  const now = Date.now();

  if (profile.subscription_status === 'active') {
    // If subscription_ends_at not set yet (webhook pending), give benefit of the doubt
    return !profile.subscription_ends_at || new Date(profile.subscription_ends_at).getTime() > now;
  }

  if (profile.subscription_status === 'trial') {
    // If trial_started_at is missing, user just authorised mandate — give access now
    if (!profile.trial_started_at) return true;
    const trialEnd = new Date(profile.trial_started_at).getTime() + 3 * 24 * 60 * 60 * 1000;
    return trialEnd > now;
  }

  return false;
}
