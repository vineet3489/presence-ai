import type { LucideIcon } from 'lucide-react';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  /** The outcome, in one punchy line — what the user walks away with. */
  promise: string;
  /** 2-3 very short concrete deliverables. */
  gets: string[];
}

export function ValueHeader({ icon: Icon, title, promise, gets }: Props) {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="text-violet-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-violet-400">{title}</span>
      </div>
      <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">{promise}</h1>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
        {gets.map((g) => (
          <span key={g} className="flex items-center gap-1.5 text-sm text-slate-300">
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> {g}
          </span>
        ))}
      </div>
    </div>
  );
}
