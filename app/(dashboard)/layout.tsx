import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileNav } from '@/components/dashboard/MobileNav';

function hasActiveAccess(profile: {
  subscription_status: string | null;
  trial_started_at: string | null;
  subscription_ends_at: string | null;
} | null): boolean {
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

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed, subscription_status, trial_started_at, subscription_ends_at')
    .eq('user_id', user.id)
    .single();

  if (!profile?.onboarding_completed) redirect('/onboarding');
  // PAYWALL DISABLED FOR TESTING
  // if (!hasActiveAccess(profile)) redirect('/trial');

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
