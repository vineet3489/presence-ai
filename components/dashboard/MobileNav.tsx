'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard, Camera, Mic, Heart, TrendingUp,
  MessageCircleHeart, Users, BarChart2, Sparkles, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PRIMARY_NAV = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/face-scan', label: 'Look', icon: Camera },
  { href: '/style-profile', label: 'Style', icon: Sparkles },
  { href: '/voice-check', label: 'Voice', icon: Mic },
  { href: '/date-prep', label: 'Date', icon: Heart },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-950 border-t border-slate-800 px-2 py-1 safe-area-pb">
      <div className="flex items-center justify-around">
        {PRIMARY_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-[52px]',
                active ? 'text-violet-400' : 'text-slate-500'
              )}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
