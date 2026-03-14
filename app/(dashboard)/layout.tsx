import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed, trial_started_at, subscription_status, subscription_ends_at')
    .eq('user_id', user.id)
    .single();

  if (!profile?.onboarding_completed) redirect('/onboarding');

  // Check subscription / trial access
  const now = new Date();
  const status = profile?.subscription_status;

  const isActive =
    status === 'active' &&
    profile?.subscription_ends_at &&
    new Date(profile.subscription_ends_at) > now;

  const TRIAL_HOURS = 48;
  const isInTrial =
    status === 'trial' &&
    profile?.trial_started_at &&
    new Date(new Date(profile.trial_started_at).getTime() + TRIAL_HOURS * 60 * 60 * 1000) > now;

  if (!isActive && !isInTrial) {
    // Mark trial as expired if it was active before
    if (status === 'trial') {
      await supabase
        .from('user_profiles')
        .update({ subscription_status: 'expired' })
        .eq('user_id', user.id);
    }
    redirect('/upgrade');
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
