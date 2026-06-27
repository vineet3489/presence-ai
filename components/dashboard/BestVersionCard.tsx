'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, Loader2, Scissors, Shirt, Smile, Mic, PersonStanding, Brush } from 'lucide-react';

interface BestVersionData {
  archetype?: string;
  hair?: string;
  outfit?: string;
  expression?: string;
  voiceFix?: string;
  posture?: string;
  grooming?: string;
}

const rows: { key: keyof BestVersionData; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { key: 'archetype', label: 'Archetype', icon: Sparkles },
  { key: 'hair', label: 'Hair', icon: Scissors },
  { key: 'outfit', label: 'Outfit', icon: Shirt },
  { key: 'expression', label: 'Expression', icon: Smile },
  { key: 'voiceFix', label: 'Voice', icon: Mic },
  { key: 'posture', label: 'Posture', icon: PersonStanding },
  { key: 'grooming', label: 'Grooming', icon: Brush },
];

export function BestVersionCard() {
  const [data, setData] = useState<BestVersionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: sessions } = await supabase
        .from('analysis_sessions')
        .select('session_type, appearance_result, voice_result, date_prep_result, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!sessions || sessions.length === 0) { setLoading(false); return; }

      const appearanceSession = sessions.find((s: Record<string, unknown>) => s.session_type === 'appearance');
      const voiceSession = sessions.find((s: Record<string, unknown>) => s.session_type === 'voice');
      const styleSession = sessions.find((s: Record<string, unknown>) => {
        const type = (s.date_prep_result as Record<string, unknown> | null)?.type;
        return typeof type === 'string' && type.startsWith('style_profile');
      });

      const appearance = appearanceSession?.appearance_result as Record<string, unknown> | null;
      const voice = voiceSession?.voice_result as Record<string, unknown> | null;
      const styleData = styleSession
        ? (styleSession.date_prep_result as Record<string, unknown> | null)?.data as Record<string, unknown> | null
        : null;

      const result: BestVersionData = {};

      if (styleData?.archetype) result.archetype = styleData.archetype as string;
      if (appearance?.hairstyleRecommendations) {
        const list = appearance.hairstyleRecommendations as string[];
        if (list[0]) result.hair = list[0];
      }
      if (styleData?.signatureOutfits) {
        const outfits = styleData.signatureOutfits as Array<{ outfit?: string }>;
        if (outfits[0]?.outfit) result.outfit = outfits[0].outfit;
      }
      if (appearance?.expressionTips) {
        const list = appearance.expressionTips as string[];
        if (list[0]) result.expression = list[0];
      }
      if (voice?.improvementsList) {
        const list = voice.improvementsList as string[];
        if (list[0]) result.voiceFix = list[0];
      }
      if (appearance?.postureCorrections) {
        const list = appearance.postureCorrections as string[];
        if (list[0]) result.posture = list[0];
      }
      if (appearance?.groomingTips) {
        const list = appearance.groomingTips as string[];
        if (list[0]) result.grooming = list[0];
      }

      setData(result);
      setLoading(false);
    }

    load();
  }, []);

  const hasData = data && Object.values(data).some(Boolean);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 flex items-center justify-center h-20">
        <Loader2 size={18} className="animate-spin text-slate-600" />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-amber-800/30 bg-gradient-to-br from-amber-950/20 to-slate-900/80 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={15} className="text-amber-400" />
          <span className="text-sm font-bold text-white">Your Best Version</span>
        </div>
        <p className="text-slate-500 text-xs leading-relaxed">
          Complete your Face Scan, Voice Check, and Style Profile to unlock your personalised breakdown.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-700/40 bg-gradient-to-br from-amber-950/20 to-slate-900/80 overflow-hidden">
      <div className="p-4 flex items-center gap-2 border-b border-amber-800/20">
        <Sparkles size={15} className="text-amber-400" />
        <span className="text-sm font-bold text-white">Your Best Version</span>
      </div>
      <div className="divide-y divide-slate-800/60">
        {rows.map(({ key, label, icon: Icon }) => {
          const value = data?.[key];
          if (!value) return null;
          return (
            <div key={key} className="flex items-start gap-3 px-4 py-3">
              <div className="w-7 h-7 rounded-lg bg-violet-900/30 border border-violet-800/30 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={13} className="text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{label}</p>
                <p className="text-sm text-slate-200 mt-0.5 leading-snug">{value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
