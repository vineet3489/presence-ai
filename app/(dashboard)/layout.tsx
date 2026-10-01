import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasActiveAccess } from '@/lib/subscription';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed, subscription_status, trial_started_at, subscription_ends_at')
    .eq('user_id', user.id)
    .single();

  if (!hasActiveAccess(profile)) redirect('/trial');
  if (!profile?.onboarding_completed) redirect('/onboarding');

  return <DashboardShell>{children}</DashboardShell>;
}
