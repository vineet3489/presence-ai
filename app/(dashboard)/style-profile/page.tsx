'use client';

import { useState, useEffect } from 'react';
import { Loader2, Sparkles, RefreshCw, Palette, Shirt, Scissors, Eye, XCircle, Wand2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StyleProfile {
  archetype: string;
  archetypeDescription: string;
  colorPalette: {
    primary: string[];
    accent: string[];
    avoid: string[];
  };
  signatureOutfits: {
    occasion: string;
    outfit: string;
    why: string;
  }[];
  hairAdvice: string;
  grooming: string;
  presenceTip: string;
  whatToAvoid: string[];
}

const COLOR_BG: Record<string, string> = {
  black: '#111', white: '#f5f5f5', navy: '#1a2a4a', grey: '#6b7280', gray: '#6b7280',
  slate: '#475569', brown: '#92400e', beige: '#d4b896', cream: '#f5f0e8', burgundy: '#7f1d1d',
  olive: '#4a5228', terracotta: '#c2522a', camel: '#c19a6b', cognac: '#9d4b2a',
  charcoal: '#374151', bone: '#e8e0d4', ivory: '#f5f0e0', cobalt: '#1a3a8f',
  rust: '#b45309', teal: '#0d9488', forest: '#14532d', sand: '#c4a97d',
};

function ColorSwatch({ color }: { color: string }) {
  const lower = color.toLowerCase().split(' ')[0];
  const bg = COLOR_BG[lower] || '#4c1d95';
  return (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded-full shrink-0 border border-slate-700" style={{ backgroundColor: bg }} />
      <span className="text-sm text-slate-300">{color}</span>
    </div>
  );
}

export default function StyleProfilePage() {
  const [profile, setProfile] = useState<StyleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Image generation state
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState('');
  const [noScan, setNoScan] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<{ base64: string; mimeType: string } | null>(null);

  async function fetchProfile(force = false) {
    force ? setRefreshing(true) : setLoading(true);
    setError('');
    if (force) setGeneratedImage(null); // reset image on refresh
    try {
      const res = await fetch(`/api/style-profile${force ? '?refresh=1' : ''}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setProfile(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function generateLook() {
    if (!profile) return;
    setGenLoading(true);
    setGenError('');
    setNoScan(false);
    try {
      const res = await fetch('/api/style-profile/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ styleProfile: profile }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'no_scan') { setNoScan(true); return; }
        throw new Error(data.message || 'Generation failed');
      }
      setGeneratedImage({ base64: data.imageBase64, mimeType: data.mimeType });
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Image generation failed');
    } finally {
      setGenLoading(false);
    }
  }

  function downloadImage() {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = `data:${generatedImage.mimeType};base64,${generatedImage.base64}`;
    link.download = 'my-ideal-look.png';
    link.click();
  }

  useEffect(() => { fetchProfile(); }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 size={32} className="animate-spin text-violet-400" />
        <p className="text-slate-400 text-sm">Building your style profile…</p>
        <p className="text-slate-600 text-xs">Takes about 10 seconds</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto py-16 text-center">
        <p className="text-red-400 text-sm mb-4">{error}</p>
        <Button variant="outline" onClick={() => fetchProfile()}>Try Again</Button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
            <Sparkles size={24} className="text-violet-400" />
            Style Profile
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Your personal archetype & style blueprint</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchProfile(true)} disabled={refreshing} className="shrink-0">
          {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
        </Button>
      </div>

      {/* Archetype card */}
      <div className="rounded-2xl border border-violet-700/50 bg-gradient-to-br from-violet-900/30 to-slate-900/50 p-6">
        <div className="text-xs text-violet-400 font-semibold uppercase tracking-wider mb-2">Your Archetype</div>
        <h2 className="text-2xl font-black text-white mb-3">{profile.archetype}</h2>
        <p className="text-slate-300 text-sm leading-relaxed">{profile.archetypeDescription}</p>
      </div>

      {/* AI Look Generator */}
      <div className="rounded-2xl border border-violet-800/50 bg-slate-900/60 overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <Wand2 size={16} className="text-violet-400" />
            <h3 className="text-sm font-semibold text-white">See Your Ideal Look</h3>
            <span className="text-xs bg-violet-900/50 text-violet-400 border border-violet-700/40 rounded-full px-2 py-0.5">AI Generated</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Generate a visual of how you'd look in your ideal archetype outfit — based on your face scan + style profile.
          </p>

          {!generatedImage ? (
            <>
              {noScan ? (
                <div className="rounded-xl border border-amber-800/40 bg-amber-900/15 p-4 text-center">
                  <p className="text-sm text-amber-300 font-medium mb-1">Face Scan required</p>
                  <p className="text-xs text-slate-400 mb-3">
                    We need your face scan data to generate a look that's actually based on you — not a random person.
                  </p>
                  <a href="/face-scan" className="inline-flex items-center gap-1.5 text-xs bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-4 py-2 transition-colors">
                    Go do a Face Scan →
                  </a>
                </div>
              ) : (
                <>
                  {genError && <p className="text-xs text-red-400 mb-3">{genError}</p>}
                  <Button
                    onClick={generateLook}
                    disabled={genLoading}
                    className="w-full bg-violet-600 hover:bg-violet-500 gap-2"
                  >
                    {genLoading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Generating your look… (~15s)
                      </>
                    ) : (
                      <>
                        <Wand2 size={15} />
                        Generate My Ideal Look
                      </>
                    )}
                  </Button>
                </>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:${generatedImage.mimeType};base64,${generatedImage.base64}`}
                  alt="Your ideal look"
                  className="w-full object-cover"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={downloadImage} className="gap-2 flex-1">
                  <Download size={14} /> Save Image
                </Button>
                <Button variant="outline" size="sm" onClick={generateLook} disabled={genLoading} className="flex-1 gap-2">
                  {genLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  Regenerate
                </Button>
              </div>
              <p className="text-xs text-slate-600 text-center">
                AI-generated style inspiration — not your exact likeness
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Color palette */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={16} className="text-violet-400" />
          <h3 className="text-sm font-semibold text-white">Your Color Palette</h3>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Core colors</p>
            <div className="space-y-2">
              {profile.colorPalette.primary.map((c, i) => <ColorSwatch key={i} color={c} />)}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Accent / pop</p>
            <div className="space-y-2">
              {profile.colorPalette.accent.map((c, i) => <ColorSwatch key={i} color={c} />)}
            </div>
          </div>
          {profile.colorPalette.avoid?.length > 0 && (
            <div className="rounded-lg bg-red-900/10 border border-red-800/30 px-4 py-3">
              <p className="text-xs text-red-400 font-medium mb-1">Avoid</p>
              {profile.colorPalette.avoid.map((c, i) => (
                <p key={i} className="text-xs text-slate-400">{c}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Signature outfits */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Shirt size={16} className="text-violet-400" />
          <h3 className="text-sm font-semibold text-white">Signature Outfits</h3>
        </div>
        {profile.signatureOutfits.map((o, i) => (
          <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="text-xs text-violet-400 font-semibold uppercase tracking-wider mb-1">{o.occasion}</div>
            <p className="text-sm text-white leading-relaxed mb-2">{o.outfit}</p>
            <p className="text-xs text-slate-500 italic">{o.why}</p>
          </div>
        ))}
      </div>

      {/* Hair & grooming */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Scissors size={16} className="text-violet-400" />
          <h3 className="text-sm font-semibold text-white">Hair & Grooming</h3>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Hair direction</p>
          <p className="text-sm text-slate-300 leading-relaxed">{profile.hairAdvice}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Grooming priorities</p>
          <p className="text-sm text-slate-300 leading-relaxed">{profile.grooming}</p>
        </div>
      </div>

      {/* Presence tip */}
      <div className="rounded-2xl border border-sky-800/40 bg-sky-900/15 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Eye size={16} className="text-sky-400" />
          <h3 className="text-sm font-semibold text-sky-300">Your Presence Edge</h3>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{profile.presenceTip}</p>
      </div>

      {/* What to avoid */}
      {profile.whatToAvoid?.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
          <div className="flex items-center gap-2 mb-3">
            <XCircle size={16} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-400">Stop Doing This</h3>
          </div>
          <ul className="space-y-2">
            {profile.whatToAvoid.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                <span className="text-red-500 shrink-0 mt-0.5">×</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-slate-600 text-center pb-4">
        Profile refreshes weekly · Image generation requires a Face Scan
      </p>
    </div>
  );
}
