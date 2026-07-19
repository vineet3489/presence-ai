'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Shirt, Palette, RefreshCw } from 'lucide-react';

interface Outfit {
  name: string;
  description: string;
  colorPalette: string[];
  whyItWorks: string;
  accessories: string;
}

interface OutfitResult {
  outfits: Outfit[];
  stylistNote: string;
}

const VENUES = ['First date (café)', 'Dinner date', 'Work / office', 'Casual weekend', 'Party / night out', 'Job interview', 'Gym / active'];
const VIBES = ['Approachable & warm', 'Sharp & put-together', 'Cool & effortless', 'Bold & confident', 'Professional authority'];
const TIMES = ['Morning', 'Afternoon', 'Evening', 'Night'];
const IMPRESSIONS = ['Trustworthy', 'Attractive', 'Confident', 'Interesting', 'Professional'];
const BUDGETS = ['₹500–1,000', '₹1,000–3,000', '₹3,000+'];

const COLOR_BG: Record<string, string> = {
  black: '#111', white: '#f5f5f5', navy: '#1a2a4a', grey: '#6b7280', gray: '#6b7280',
  slate: '#475569', brown: '#92400e', beige: '#d4b896', cream: '#f5f0e8', burgundy: '#7f1d1d',
  olive: '#4a5228', charcoal: '#374151', blue: '#1d4ed8', green: '#15803d', red: '#dc2626',
  khaki: '#a3924a', camel: '#c19a6b', teal: '#0d9488',
};

function ColorDot({ color }: { color: string }) {
  const key = color.toLowerCase().split(' ')[0];
  const bg = COLOR_BG[key] || '#4c1d95';
  return <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" style={{ backgroundColor: bg }} title={color} />;
}

export default function OutfitBuilderPage() {
  const [venue, setVenue] = useState('');
  const [vibe, setVibe] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [impression, setImpression] = useState('');
  const [budget, setBudget] = useState('');
  const [owns, setOwns] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OutfitResult | null>(null);
  const [error, setError] = useState('');

  const canSubmit = venue && vibe && timeOfDay && impression;

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/outfit-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venue, vibe, timeOfDay, impression, budget, whatYouOwn: owns }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Shirt size={20} className="text-amber-400" /> Outfit Builder
        </h1>
        <p className="text-slate-400 text-sm mt-1">3 specific outfit options for any occasion</p>
      </div>

      {!result ? (
        <div className="space-y-5">
          {/* Occasion */}
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Occasion</p>
            <div className="flex flex-wrap gap-2">
              {VENUES.map(v => (
                <button key={v} onClick={() => setVenue(v)}
                  className={`text-xs px-3 py-2 rounded-xl border transition-all ${venue === v ? 'border-amber-500 bg-amber-900/30 text-amber-300' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Vibe */}
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Vibe you want</p>
            <div className="flex flex-wrap gap-2">
              {VIBES.map(v => (
                <button key={v} onClick={() => setVibe(v)}
                  className={`text-xs px-3 py-2 rounded-xl border transition-all ${vibe === v ? 'border-amber-500 bg-amber-900/30 text-amber-300' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Time + Impression in a grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Time of day</p>
              <div className="space-y-1.5">
                {TIMES.map(t => (
                  <button key={t} onClick={() => setTimeOfDay(t)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-xl border transition-all ${timeOfDay === t ? 'border-amber-500 bg-amber-900/30 text-amber-300' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Impression goal</p>
              <div className="space-y-1.5">
                {IMPRESSIONS.map(i => (
                  <button key={i} onClick={() => setImpression(i)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-xl border transition-all ${impression === i ? 'border-amber-500 bg-amber-900/30 text-amber-300' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                    {i}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Budget (optional) */}
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Budget <span className="text-slate-600 font-normal">(optional)</span></p>
            <div className="flex gap-2">
              {BUDGETS.map(b => (
                <button key={b} onClick={() => setBudget(budget === b ? '' : b)}
                  className={`text-xs px-3 py-2 rounded-xl border transition-all ${budget === b ? 'border-amber-500 bg-amber-900/30 text-amber-300' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* What you own */}
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">What you already own <span className="text-slate-600 font-normal">(optional)</span></p>
            <input
              type="text"
              value={owns}
              onChange={e => setOwns(e.target.value)}
              placeholder="e.g. navy chinos, white Oxford shirt, black sneakers"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button onClick={handleSubmit} disabled={!canSubmit || loading} className="w-full bg-amber-600 hover:bg-amber-500 gap-2">
            {loading ? <><Loader2 size={14} className="animate-spin" /> Building your outfits…</> : <><Shirt size={14} /> Build My Outfits</>}
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Stylist note */}
          <div className="rounded-2xl border border-amber-700/40 bg-amber-950/20 px-5 py-4">
            <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">Stylist note</p>
            <p className="text-sm text-slate-300 leading-relaxed">{result.stylistNote}</p>
          </div>

          {/* Outfits */}
          {result.outfits.map((outfit, i) => (
            <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-white font-bold text-base">{outfit.name}</h3>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-900/30 border border-amber-800/30 rounded-full px-2 py-0.5 shrink-0">#{i + 1}</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{outfit.description}</p>
              <div className="flex items-center gap-2">
                <Palette size={12} className="text-slate-500 shrink-0" />
                <div className="flex gap-1.5 flex-wrap">
                  {outfit.colorPalette.map((c, ci) => (
                    <div key={ci} className="flex items-center gap-1.5">
                      <ColorDot color={c} />
                      <span className="text-xs text-slate-400">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{outfit.whyItWorks}</p>
              <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 px-3 py-2">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Accessory: </span>
                <span className="text-xs text-slate-300">{outfit.accessories}</span>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={() => setResult(null)} className="w-full gap-2">
            <RefreshCw size={13} /> Build Another
          </Button>
        </div>
      )}
    </div>
  );
}
