import { CheckCircle2, XCircle, Lightbulb, Check } from 'lucide-react';
import type { Block } from '@/lib/blog';
import { TryFreeCta } from './SiteChrome';

export function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-5 text-slate-300 text-[17px] leading-relaxed">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'p':
            return <p key={i}>{b.text}</p>;
          case 'h2':
            return <h2 key={i} id={b.id} className="scroll-mt-20 text-2xl md:text-3xl font-black text-white pt-6">{b.text}</h2>;
          case 'h3':
            return <h3 key={i} className="text-lg font-bold text-white pt-2">{b.text}</h3>;
          case 'list':
            return (
              <ul key={i} className="space-y-2.5">
                {b.items.map((it) => (
                  <li key={it} className="flex gap-3"><span className="text-violet-400 font-black mt-0.5">→</span><span>{it}</span></li>
                ))}
              </ul>
            );
          case 'checklist':
            return (
              <div key={i} className="rounded-2xl border border-emerald-700/40 bg-emerald-950/20 p-5">
                <p className="text-white font-bold mb-3">{b.title}</p>
                <ul className="space-y-2">
                  {b.items.map((it) => (
                    <li key={it} className="flex gap-2.5 text-base">
                      <span className="w-5 h-5 rounded-md bg-emerald-600/30 border border-emerald-600/50 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} className="text-emerald-300" />
                      </span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          case 'tip':
            return (
              <div key={i} className="rounded-2xl border border-amber-600/40 bg-amber-950/20 p-5">
                <p className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider mb-1.5">
                  <Lightbulb size={15} /> {b.title}
                </p>
                <p className="text-white text-base">{b.text}</p>
              </div>
            );
          case 'dodont':
            return (
              <div key={i} className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-emerald-700/40 bg-slate-900/50 p-4">
                  <p className="text-emerald-400 font-bold text-sm mb-2">Do</p>
                  <ul className="space-y-2 text-base">
                    {b.dos.map((d) => <li key={d} className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-1" />{d}</li>)}
                  </ul>
                </div>
                <div className="rounded-2xl border border-rose-800/40 bg-slate-900/50 p-4">
                  <p className="text-rose-400 font-bold text-sm mb-2">Avoid</p>
                  <ul className="space-y-2 text-base">
                    {b.donts.map((d) => <li key={d} className="flex gap-2"><XCircle size={16} className="text-rose-500 shrink-0 mt-1" />{d}</li>)}
                  </ul>
                </div>
              </div>
            );
          case 'timeline':
            return (
              <ol key={i} className="relative border-l-2 border-violet-700/50 ml-2 space-y-4">
                {b.steps.map((s) => (
                  <li key={s.when} className="pl-5 relative">
                    <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-violet-500" />
                    <p className="text-violet-300 font-bold text-sm">{s.when}</p>
                    <p className="text-base">{s.what}</p>
                  </li>
                ))}
              </ol>
            );
          case 'stat':
            return (
              <figure key={i} className="rounded-2xl border border-violet-700/50 bg-violet-950/30 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <p className="text-5xl font-black gradient-text shrink-0">{b.value}</p>
                <div>
                  <p className="text-white">{b.text}</p>
                  {b.source && <figcaption className="text-xs text-slate-500 mt-1.5">Source: {b.source}</figcaption>}
                </div>
              </figure>
            );
          case 'cta':
            return <TryFreeCta key={i} />;
        }
      })}
    </div>
  );
}
