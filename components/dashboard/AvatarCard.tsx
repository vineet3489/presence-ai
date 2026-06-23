'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Play, RefreshCw, Volume2, Trophy, Sparkles } from 'lucide-react';

type Phase =
  | 'loading'      // checking storage
  | 'idle'         // no video yet
  | 'starting'     // calling generate API
  | 'rendering'    // polling — video building in background
  | 'done'
  | 'error';

export function AvatarCard() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [script, setScript] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [renderPct, setRenderPct] = useState(0);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch('/api/avatar/last-video')
      .then(r => r.json())
      .then(({ url }) => {
        if (url) { setVideoUrl(url); setPhase('done'); return; }
        const savedId = localStorage.getItem('avatar_video_id');
        if (savedId) startPolling(savedId);
        else setPhase('idle');
      })
      .catch(() => setPhase('idle'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    if (pollRef.current) clearTimeout(pollRef.current);
    stageTimers.current.forEach(clearTimeout);
  }, []);

  // Animate render progress bar (approximate — actual render takes ~60-90s)
  function startProgressAnimation() {
    stageTimers.current.forEach(clearTimeout);
    stageTimers.current = [];
    const stages = [
      { pct: 10, delay: 3000 },
      { pct: 25, delay: 12000 },
      { pct: 45, delay: 25000 },
      { pct: 62, delay: 40000 },
      { pct: 78, delay: 55000 },
      { pct: 90, delay: 70000 },
    ];
    stages.forEach(({ pct, delay }) => {
      stageTimers.current.push(setTimeout(() => setRenderPct(pct), delay));
    });
  }

  function startPolling(videoId: string) {
    setPhase('rendering');
    startProgressAnimation();

    async function poll() {
      try {
        const res = await fetch(`/api/avatar/status?videoId=${videoId}`);
        const data: { status?: string; videoUrl?: string; error?: string } = await res.json();

        if (data.status === 'completed' && data.videoUrl) {
          stageTimers.current.forEach(clearTimeout);
          localStorage.removeItem('avatar_video_id');
          setVideoUrl(data.videoUrl);
          setRenderPct(100);
          setPhase('done');
          return;
        }
        if (data.status === 'failed') {
          stageTimers.current.forEach(clearTimeout);
          localStorage.removeItem('avatar_video_id');
          setError(data.error || 'Video rendering failed. Try again.');
          setPhase('error');
          return;
        }
        pollRef.current = setTimeout(poll, 8000);
      } catch {
        pollRef.current = setTimeout(poll, 10000);
      }
    }
    poll();
  }

  async function generate(force = false) {
    setError('');
    setPhase('starting');

    const url = force ? '/api/avatar/generate?force=1' : '/api/avatar/generate';
    const res = await fetch(url, { method: 'POST' });
    let data: { videoId?: string; script?: string; error?: string; message?: string } = {};
    try { data = await res.json(); } catch {
      setError('Server error — try again');
      setPhase('error');
      return;
    }

    if (!res.ok) {
      setError(data.message || data.error || 'Generation failed');
      setPhase('error');
      return;
    }

    const { videoId, script: s } = data;
    if (!videoId) { setError('No video ID returned'); setPhase('error'); return; }
    setScript(s ?? null);
    localStorage.setItem('avatar_video_id', videoId);
    startPolling(videoId);
  }

  // ── States ─────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 flex items-center justify-center h-24">
        <Loader2 size={20} className="animate-spin text-slate-600" />
      </div>
    );
  }

  if (phase === 'done' && videoUrl) {
    return (
      <div className="rounded-2xl border border-violet-700/50 bg-gradient-to-br from-violet-950/30 to-slate-900 overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={15} className="text-amber-400" />
            <span className="text-sm font-bold text-white">Your Ideal Self — AI Avatar</span>
          </div>
          <Button
            variant="ghost" size="sm"
            onClick={() => { setPhase('idle'); setVideoUrl(null); localStorage.removeItem('avatar_video_id'); }}
            className="text-slate-500 hover:text-white gap-1 text-xs"
          >
            <RefreshCw size={12} /> Redo
          </Button>
        </div>

        <div className="relative bg-black mx-4 mb-4 rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            playsInline
            className="w-full max-h-[480px] object-contain"
          />
        </div>

        {script && (
          <div className="mx-4 mb-4 px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Script</p>
            <p className="text-slate-300 text-sm italic leading-relaxed">&ldquo;{script}&rdquo;</p>
          </div>
        )}

        <div className="px-4 pb-4">
          <p className="text-xs text-slate-600 text-center">
            <Volume2 size={10} className="inline mr-1" />
            Your face · your voice coaching · AI-generated
          </p>
        </div>
      </div>
    );
  }

  // Rendering in background — compact, non-blocking
  if (phase === 'rendering') {
    return (
      <div className="rounded-2xl border border-violet-800/40 bg-slate-900/60 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Loader2 size={14} className="animate-spin text-violet-400" />
            <span className="text-sm font-semibold text-white">Your avatar is rendering…</span>
          </div>
          <span className="text-xs text-slate-500">{renderPct}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-1000"
            style={{ width: `${renderPct}%` }}
          />
        </div>
        <p className="text-xs text-slate-500">Takes ~1–2 minutes. You can use the app — we&apos;ll update this when it&apos;s ready.</p>
        {script && (
          <p className="text-xs text-slate-600 mt-2 italic truncate">&ldquo;{script}&rdquo;</p>
        )}
      </div>
    );
  }

  // Starting (brief loading before polling kicks in)
  if (phase === 'starting') {
    return (
      <div className="rounded-2xl border border-violet-800/40 bg-slate-900/60 px-5 py-4 flex items-center gap-3">
        <Loader2 size={16} className="animate-spin text-violet-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-white">Setting up your avatar…</p>
          <p className="text-xs text-slate-500 mt-0.5">Uploading your photo and writing your script</p>
        </div>
      </div>
    );
  }

  // idle or error
  return (
    <div className="rounded-2xl border border-violet-800/40 bg-gradient-to-br from-violet-950/20 to-slate-900 p-5">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={15} className="text-violet-400" />
        <span className="text-sm font-bold text-white">Your Ideal Self — AI Avatar</span>
      </div>
      <p className="text-slate-400 text-sm mb-4 leading-relaxed">
        A 15-second video of you at your best — your actual face, your style archetype, confident delivery.
      </p>

      <div className="space-y-1.5 mb-5">
        {[
          'Built from your face scan photo',
          'Script matches your style archetype',
          'Voice coaching applied — zero fillers',
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-1 h-1 rounded-full bg-violet-500 shrink-0" />
            {item}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-xl bg-red-900/20 border border-red-800/40 px-4 py-3 mb-4">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      <Button onClick={() => generate(!!error)} className="w-full bg-violet-600 hover:bg-violet-500 gap-2">
        <Play size={14} /> {error ? 'Try Again (Fresh Upload)' : 'Generate My Avatar'}
      </Button>
      <p className="text-xs text-slate-600 text-center mt-2">Takes ~1 min · Renders in background</p>
    </div>
  );
}
