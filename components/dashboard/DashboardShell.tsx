import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileNav } from '@/components/dashboard/MobileNav';

export function DashboardShell({ children }: { children: React.ReactNode }) {
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
