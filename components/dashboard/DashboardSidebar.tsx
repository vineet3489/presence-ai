'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, Camera, Mic, Heart, TrendingUp, LogOut, MessageCircleHeart, Users, BarChart2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/face-scan', label: 'Face Scan', icon: Camera },
  { href: '/style-profile', label: 'Style Profile', icon: Sparkles, highlight: true },
  { href: '/voice-check', label: 'Voice Check', icon: Mic },
  { href: '/roleplay', label: 'Roleplay', icon: Users },
  { href: '/date-prep', label: 'Date Prep', icon: Heart },
  { href: '/chat-coach', label: 'Chat Coach', icon: MessageCircleHeart },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/report', label: 'Weekly Report', icon: BarChart2 },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <aside className="w-60 shrink-0 border-r border-slate-800 min-h-screen hidden md:flex flex-col bg-slate-950">
      <div className="px-6 py-5 border-b border-slate-800">
        <span className="text-lg font-black gradient-text">PresenceAI</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon, highlight }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-violet-600/20 text-violet-300 border border-violet-700/40'
                : highlight
                ? 'text-violet-300 hover:text-violet-200 hover:bg-violet-900/20 border border-violet-800/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
          >
            <Icon size={18} />
            {label}
            {highlight && pathname !== href && (
              <span className="ml-auto text-[10px] bg-violet-600/30 text-violet-300 px-1.5 py-0.5 rounded-full">New</span>
            )}
          </Link>
        ))}
      </nav>
      <div className="px-3 pb-4">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-white hover:bg-slate-800 w-full transition-colors"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
