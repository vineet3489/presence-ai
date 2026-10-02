import Link from 'next/link';
import { Camera, Mic, Sparkles, Infinity as InfinityIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UNLOCKS = [
  { icon: InfinityIcon, label: 'Unlimited checks' },
  { icon: Camera, label: 'Face Scan' },
  { icon: Mic, label: 'Voice Check' },
  { icon: Sparkles, label: 'Your Ideal Look' },
];

/** Shown right after the free Perception Check result — the moment the user has felt the value. */
export function TrialUpsell() {
  return (
    <div className="rounded-2xl border border-emerald-600/50 bg-gradient-to-br from-emerald-950/40 to-slate-900 p-5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-1">3 days free</p>
      <p className="text-xl font-black text-white leading-snug mb-3">Fix it all — not just your profile.</p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {UNLOCKS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-sm text-slate-200">
            <Icon size={14} className="text-emerald-400 shrink-0" /> {label}
          </div>
        ))}
      </div>
      <Link href="/trial">
        <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 font-bold text-base gap-2">
          Start free trial <ArrowRight size={16} />
        </Button>
      </Link>
      <p className="text-[11px] text-slate-500 text-center mt-2">₹0 today · then ₹79/week · cancel anytime</p>
    </div>
  );
}
