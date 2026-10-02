'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AvatarCard } from './AvatarCard';
import { SHOW_AVATAR_SECTION } from '@/lib/featureFlags';

/** Dashboard hero for "the best version of you": the Ideal Look image + the talking avatar built from it. */
export function IdealSelfCard({ hasStyleProfile }: { hasStyleProfile: boolean }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/style-profile/last-look')
      .then((r) => r.json())
      .then((d: { url: string | null }) => setUrl(d.url))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 h-24 flex items-center justify-center">
        <Loader2 size={18} className="animate-spin text-slate-600" />
      </div>
    );
  }

  if (!url) {
    return (
      <div className="rounded-2xl border border-violet-700/40 bg-gradient-to-br from-violet-950/40 to-slate-900 p-5">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles size={15} className="text-violet-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Your Ideal Self</span>
        </div>
        <p className="text-lg font-black text-white leading-snug mb-1">See yourself at your best.</p>
        <p className="text-sm text-slate-400 mb-4">Your face with the ideal hair, outfit & expression — then a video of you speaking confidently.</p>
        <Link href="/style-profile">
          <Button className="w-full bg-violet-600 hover:bg-violet-500 gap-2">
            {hasStyleProfile ? 'Generate my Ideal Look' : 'Build my Style Profile'} <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-violet-700/50 overflow-hidden relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Your ideal look" className="w-full aspect-square object-cover object-top bg-slate-950" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-4 pt-12 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-violet-300">Your Ideal Look</p>
            <p className="text-white font-black text-lg leading-tight">This is the goal.</p>
          </div>
          <Link href="/style-profile" className="text-xs text-slate-300 hover:text-white bg-slate-900/70 rounded-lg px-3 py-1.5 shrink-0">
            How to get there →
          </Link>
        </div>
      </div>
      {SHOW_AVATAR_SECTION && <AvatarCard />}
    </div>
  );
}
