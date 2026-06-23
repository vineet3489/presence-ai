'use client';

import { useState, useEffect } from 'react';
import { Loader2, Sparkles, RefreshCw, Palette, Shirt, Scissors, Lock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { AvatarCard } from '@/components/dashboard/AvatarCard';

interface StyleProfile {
  archetype: string;
  archetypeDescription: string;
  colorPalette: { primary: string[]; accent: string[]; avoid: string[] };
  signatureOutfits: { occasion: string; outfit: string }[];
  hairAdvice: string;
  grooming: string;
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
      <div className="w-3.5 h-3.5 rounded-full shrink-0 border border-slate-700" style={{ backgroundColor: bg }} />
      <span className="text-sm text-slate-300">{color}</span>
    </div>
  );
}

export default function StyleProfilePage() {
  const [profile, setProfile] = useState<StyleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [scanGate, setScanGate] = useState<{ needsFace: boolean; needsVoice: boolean } | null>(null);
  const [userMeta, setUserMeta] = useState<{ city?: string | null; zodiac?: string | null; zodiacEmoji?: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from('analysis_sessions').select('id').eq('session_type', 'appearance').limit(1).single(),
      supabase.from('analysis_sessions').select('id').eq('session_type', 'voice').limit(1).single(),
      supabase.from('user_profiles').select('city, date_of_birth').single(),
    ]).then(([face, voice, profileRes]) => {
      const dob = (profileRes.data as Record<string, unknown> | null)?.date_of_birth as string | null;
      const city = (profileRes.data as Record<string, unknown> | null)?.city as string | null;
      if (dob) {
        fetch('/api/zodiac').then(r => r.json()).then(d => {
          setUserMeta({ city, zodiac: d.zodiac ?? null, zodiacEmoji: d.emoji });
        }).catch(() => setUserMeta({ city }));
      } else {
        setUserMeta({ city });
      }
      const needsFace = !face.data;
      const needsVoice = !voice.data;
      if (needsFace || needsVoice) {
        setScanGate({ needsFace, needsVoice });
        setLoading(false);
      } else {
        fetchProfile();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchProfile(force = false) {
    force ? setRefreshing(true) : setLoading(true);
    setError('');
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

  if (scanGate) {
    return (
      <div className="p-6 max-w-lg mx-auto pt-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-violet-900/30 border border-violet-700/40 flex items-center justify-center mx-auto mb-5">
          <Lock size={24} className="text-violet-400" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Complete your scans first</h1>
        <p className="text-slate-400 text-sm mb-8">
          Style Profile uses both your face scan and voice check to build something accurate.
        </p>
        <div className="flex flex-col gap-3">
          {scanGate.needsFace && (
            <Link href="/face-scan">
              <Button className="w-full bg-violet-600 hover:bg-violet-500">Do Face Scan →</Button>
            </Link>
          )}
          {scanGate.needsVoice && (
            <Link href="/voice-check">
              <Button variant="outline" className="w-full">Do Voice Check →</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 max-w-lg mx-auto flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={28} className="animate-spin text-violet-400" />
        <p className="text-slate-400 text-sm">Building your style profile…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-lg mx-auto py-16 text-center">
        <p className="text-red-400 text-sm mb-4">{error}</p>
        <Button variant="outline" onClick={() => fetchProfile()}>Try Again</Button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Sparkles size={20} className="text-violet-400" /> Style Profile
        </h1>
        <Button variant="outline" size="sm" onClick={() => fetchProfile(true)} disabled={refreshing}>
          {refreshing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
        </Button>
      </div>

      {/* Archetype */}
      <div className="rounded-2xl border border-violet-700/50 bg-gradient-to-br from-violet-900/30 to-slate-900/50 p-5">
        <p className="text-xs text-violet-400 font-semibold uppercase tracking-wider mb-1">Your Archetype</p>
        <h2 className="text-xl font-black text-white mb-2">{profile.archetype}</h2>
        <p className="text-slate-300 text-sm leading-relaxed">{profile.archetypeDescription}</p>
      </div>

      {/* Presence Identity Card */}
      <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/80 to-slate-900 p-4">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard size={13} className="text-slate-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">My Presence ID</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {userMeta?.zodiac && (
            <span className="flex items-center gap-1.5 text-xs bg-amber-900/30 border border-amber-800/40 text-amber-300 rounded-full px-3 py-1.5">
              <span>{userMeta.zodiacEmoji}</span> {userMeta.zodiac}
            </span>
          )}
          {userMeta?.city && (
            <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-full px-3 py-1.5">
              📍 {userMeta.city}
            </span>
          )}
          <span className="text-xs bg-violet-900/30 border border-violet-700/40 text-violet-300 rounded-full px-3 py-1.5">
            ✦ {profile.archetype}
          </span>
        </div>
        {profile.grooming && (
          <p className="text-xs text-slate-500 mt-3 leading-relaxed border-t border-slate-800 pt-3">{profile.grooming}</p>
        )}
      </div>

      {/* Avatar Video — ideal look as a talking video, not a static image */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={13} className="text-violet-400" />
          <span className="text-sm font-semibold text-white">Your Ideal Look Avatar</span>
          <span className="text-[10px] bg-violet-900/50 text-violet-400 border border-violet-700/40 rounded-full px-2 py-0.5">AI Video</span>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          A talking avatar of you, scripted to match your archetype and voice coaching.
          Generates from your face scan photo.
        </p>
        <AvatarCard />
      </div>

      {/* Colors */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Palette size={14} className="text-violet-400" />
          <span className="text-sm font-semibold text-white">Your Colors</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {[...profile.colorPalette.primary, ...profile.colorPalette.accent].map((c, i) => (
            <ColorSwatch key={i} color={c} />
          ))}
        </div>
        {profile.colorPalette.avoid?.length > 0 && (
          <p className="text-xs text-red-400/70 mt-3">Avoid: {profile.colorPalette.avoid.join(', ')}</p>
        )}
      </div>

      {/* Outfits */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Shirt size={14} className="text-violet-400" />
          <span className="text-sm font-semibold text-white">Signature Looks</span>
        </div>
        {profile.signatureOutfits.map((o, i) => (
          <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3">
            <p className="text-[10px] text-violet-400 font-bold uppercase tracking-wider mb-1">{o.occasion}</p>
            <p className="text-sm text-white">{o.outfit}</p>
          </div>
        ))}
      </div>

      {/* Hair & Grooming */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Scissors size={14} className="text-violet-400" />
          <span className="text-sm font-semibold text-white">Hair & Grooming</span>
        </div>
        <p className="text-sm text-slate-300">{profile.hairAdvice}</p>
      </div>

      <p className="text-xs text-slate-600 text-center pb-2">Refreshes weekly · Tap ↺ after a new scan to update</p>
    </div>
  );
}
