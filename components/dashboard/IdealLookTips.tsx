import { Info } from 'lucide-react';

/** Bold "copy this look" tips + the AI-preview disclaimer shown under every Ideal Look image. */
export function IdealLookTips({ tips }: { tips: string[] }) {
  return (
    <div className="space-y-2.5">
      {tips.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2">Get this look</p>
          <div className="grid grid-cols-2 gap-2">
            {tips.map((tip, i) => (
              <div key={tip} className="rounded-xl border border-amber-700/40 bg-amber-950/20 px-3 py-2.5 flex items-start gap-2">
                <span className="text-amber-400 font-black text-sm leading-tight">{i + 1}</span>
                <p className="text-sm font-bold text-white leading-tight">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="text-[11px] text-slate-500 flex items-start gap-1.5">
        <Info size={11} className="shrink-0 mt-0.5" />
        AI preview — your direction, not an exact likeness. Features may differ slightly from real life.
      </p>
    </div>
  );
}
