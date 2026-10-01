import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

// Deliberately no onboarding/subscription gate — Perception Check is the free-tier
// entry point, reachable right after login. Other dashboard pages still gate
// normally via app/(dashboard)/layout.tsx.
export default async function PerceptionLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return <DashboardShell>{children}</DashboardShell>;
}
