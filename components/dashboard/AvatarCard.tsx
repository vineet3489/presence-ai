'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Play, RefreshCw, Volume2, Trophy } from 'lucide-react';

type Phase =
  | 'loading'       // checking storage for existing video
  | 'idle'          // no video, ready to generate
  | 'writing'       // writing script (~3s)
  | 'uploading'     // uploading photo to HeyGen (~5s)
  | 'rendering'     // HeyGen rendering video (polls, ~60–90s)
  | 'done'          // video ready
  | 'error';

const PHASE_LABELS: Record<string, string> = {
  writing:   'Writing your script…',
  uploading: 'Uploading your look to HeyGen…',
  rendering: 'HeyGen is rendering your avatar…',
};

const RENDER_STAGES = [
  { pct: 12, label: 'Mapping your face…',         delay: 4000 },
  { pct: 28, label: 'Syncing lip movements…',     delay: 14000 },
  { pct: 48, label: 'Animating your look…',       delay: 28000 },
  { pct: 66, label: 'Polishing the video…',       delay: 45000 },
  { pct: 82, label: 'Almost done…',               delay: 65000 },
];

export function AvatarCard() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [script, setScript] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [renderPct, setRenderPct] = useState(0);
  const [renderLabel, setRenderLabel] = useState('Starting render…');
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  // On mount: check for existing video
  useEffect(() => {
    fetch('/api/avatar/last-video')
      .then(r => r.json())
      .then(({ url }) => {
        if (url) { setVideoUrl(url); setPhase('done'); }
        else {
          // Check localStorage for an in-progress videoId
          const savedId = localStorage.getItem('heygen_video_id');
          if (savedId) startPolling(savedId);
          else setPhase('idle');
        }
      })
      .catch(() => setPhase('idle'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
      stageTimers.current.forEach(clearTimeout);
    };
  }, []);

  function startRenderAnimation() {
    stageTimers.current.forEach(clearTimeout);
    stageTimers.current = [];
    setRenderPct(0);
    setRenderLabel('Starting render…');
    RENDER_STAGES.forEach(({ pct, label, delay }) => {
      stageTimers.current.push(setTimeout(() => {
        setRenderPct(pct);
        setRenderLabel(label);
      }, delay));
    });
  }

  function startPolling(videoId: string) {
    setPhase('rendering');
    startRenderAnimation();

    async function poll() {
      try {
        const res = await fetch(`/api/avatar/status?videoId=${videoId}`);
        const data = await res.json();

        if (data.status === 'completed' && data.videoUrl) {
          stageTimers.current.forEach(clearTimeout);
          localStorage.removeItem('heygen_video_id');
          setVideoUrl(data.videoUrl);
          setRenderPct(100);
          setPhase('done');
          return;
        }
        if (data.status === 'failed') {
          stageTimers.current.forEach(clearTimeout);
          localStorage.removeItem('heygen_video_id');
          setError(data.error || 'HeyGen rendering failed. Try again.');
          setPhase('error');
          return;
        }
        // Still processing — poll again in 6 seconds
        pollRef.current = setTimeout(poll, 6000);
      } catch {
        pollRef.current = setTimeout(poll, 8000);
      }
    }
    poll();
  }

  async function generate() {
    setError('');
    setPhase('writing');
    stageTimers.current.forEach(clearTimeout);

    try {
      // Step 1: script + photo upload + HeyGen job start
      setPhase('writing');
      await new Promise(r => setTimeout(r, 800)); // brief pause so label shows
      setPhase('uploading');

      const res = await fetch('/api/avatar/generate', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || 'Generation failed');
        setPhase('error');
        return;
      }

      const { videoId, script: s } = data;
      setScript(s);
      localStorage.setItem('heygen_video_id', videoId);
      startPolling(videoId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setPhase('error');
    }
  }

  // ── Render states ────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex items-center justify-center h-36">
        <Loader2 size={22} className="animate-spin text-slate-600" />
      </div>
    );
  }

  if (phase === 'done' && videoUrl) {
    return (
      <div className="rounded-2xl border border-violet-700/50 bg-gradient-to-br from-violet-950/30 to-slate-900 overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={15} className="text-amber-400" />
            <span className="text-sm font-bold text-white">You at 100 Score</span>
            <span className="text-[10px] bg-amber-900/40 text-amber-400 border border-amber-700/40 rounded-full px-2 py-0.5 font-semibold">AI Avatar</span>
          </div>
          <Button
            variant="ghost" size="sm"
            onClick={() => { setPhase('idle'); setVideoUrl(null); }}
            className="text-slate-500 hover:text-white gap-1 text-xs"
          >
            <RefreshCw size={12} /> Regenerate
          </Button>
        </div>

        {/* Video player */}
        <div className="relative bg-black mx-4 mb-4 rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            playsInline
            className="w-full max-h-[480px] object-contain"
            poster=""
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
            AI-generated avatar · HeyGen · your face, your coaching
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'writing' || phase === 'uploading' || phase === 'rendering') {
    const isRendering = phase === 'rendering';
    return (
      <div className="rounded-2xl border border-violet-800/40 bg-gradient-to-br from-violet-950/30 to-slate-900 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Trophy size={15} className="text-amber-400" />
          <span className="text-sm font-bold text-white">You at 100 Score</span>
        </div>

        <div className="flex flex-col items-center gap-4">
          {isRendering ? (
            <>
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#1e1b4b" strokeWidth="5" />
                  <circle
                    cx="48" cy="48" r="40" fill="none" stroke="#7c3aed" strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - renderPct / 100)}`}
                    style={{ transition: 'stroke-dashoffset 1.2s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-black text-white">{renderPct}%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">HeyGen is building your avatar</p>
                <p className="text-xs text-slate-500 mt-1">{renderLabel}</p>
                <p className="text-xs text-slate-600 mt-1">Takes ~60–90 seconds — you can leave this page</p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-violet-400" />
              <div className="text-center">
                <p className="text-sm font-semibold text-white">{PHASE_LABELS[phase]}</p>
                <p className="text-xs text-slate-500 mt-1">Setting things up…</p>
              </div>
            </div>
          )}

          {script && (
            <div className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 mt-2">
              <p className="text-[10px] text-violet-400 uppercase tracking-wider font-bold mb-1">Your script</p>
              <p className="text-slate-300 text-xs italic leading-relaxed">&ldquo;{script}&rdquo;</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // idle or error
  return (
    <div className="rounded-2xl border border-violet-800/40 bg-gradient-to-br from-violet-950/20 to-slate-900 p-6">
      <div className="flex items-center gap-2 mb-2">
        <Trophy size={15} className="text-amber-400" />
        <span className="text-sm font-bold text-white">You at 100 Score</span>
        <span className="text-[10px] bg-violet-900/50 text-violet-400 border border-violet-700/40 rounded-full px-2 py-0.5">AI Avatar</span>
      </div>
      <p className="text-slate-400 text-sm mb-5 leading-relaxed">
        See a 15-second video of your AI avatar — your face, your style, your coaching — approaching with the perfect opener.
      </p>

      <div className="space-y-2 mb-5">
        {[
          'Script written by AI based on your archetype',
          'Your face from your last style scan',
          'Coaching applied: no fillers, confident tone',
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
            <Play size={10} className="text-violet-400 shrink-0 mt-0.5" />
            {item}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-xl bg-red-900/20 border border-red-800/40 px-4 py-3 mb-4">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      <Button
        onClick={generate}
        className="w-full bg-violet-600 hover:bg-violet-500 gap-2"
      >
        <Play size={15} /> Generate My Avatar Video
      </Button>

      <p className="text-xs text-slate-600 text-center mt-3">
        Requires: Face Scan completed · Powered by HeyGen
      </p>
    </div>
  );
}
