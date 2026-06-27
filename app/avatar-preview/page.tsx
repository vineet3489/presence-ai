'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2, Download, ArrowRight, Sparkles } from 'lucide-react';
import { PresenceLogo } from '@/components/ui/PresenceLogo';
import { CameraCapture } from '@/components/camera/CameraCapture';

type Phase = 'idle' | 'uploading' | 'rendering' | 'done' | 'error' | 'limit';

export default function AvatarPreviewPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);
  const [capturedMime, setCapturedMime] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [renderPct, setRenderPct] = useState(0);
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function handleCapture(base64: string, mediaType: 'image/jpeg' | 'image/png') {
    setCapturedBase64(base64);
    setCapturedMime(mediaType);
    setError('');
    setPhase('idle');
  }

  function startProgress() {
    stageTimers.current.forEach(clearTimeout);
    stageTimers.current = [];
    const stages = [
      { pct: 12, d: 4000 }, { pct: 28, d: 16000 }, { pct: 48, d: 30000 },
      { pct: 65, d: 45000 }, { pct: 80, d: 60000 }, { pct: 90, d: 75000 },
    ];
    stages.forEach(({ pct, d }) => {
      stageTimers.current.push(setTimeout(() => setRenderPct(pct), d));
    });
  }

  function startPolling(videoId: string) {
    setPhase('rendering');
    setRenderPct(0);
    startProgress();

    async function poll() {
      try {
        const res = await fetch(`/api/avatar/status?videoId=${videoId}`);
        const data = await res.json();

        if (data.status === 'completed' && data.videoUrl) {
          stageTimers.current.forEach(clearTimeout);
          setVideoUrl(data.videoUrl);
          setRenderPct(100);
          setPhase('done');
          return;
        }
        if (data.status === 'failed') {
          stageTimers.current.forEach(clearTimeout);
          setError(data.error || 'Rendering failed. Try again.');
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

  async function handleGenerate() {
    if (!capturedBase64) return;
    setPhase('uploading');
    setError('');

    try {
      // Convert base64 → Blob → FormData
      const byteString = atob(capturedBase64);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: capturedMime });

      const formData = new FormData();
      formData.append('photo', blob, `photo.${capturedMime === 'image/png' ? 'png' : 'jpg'}`);

      const res = await fetch('/api/avatar/preview', { method: 'POST', body: formData });
      const data = await res.json();

      if (res.status === 402 || data.limitReached) {
        setPhase('limit');
        return;
      }

      if (!res.ok) {
        setError(data.error || 'Generation failed. Please try again.');
        setPhase('error');
        return;
      }

      startPolling(data.videoId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setPhase('error');
    }
  }

  async function downloadVideo() {
    if (!videoUrl) return;
    const res = await fetch(videoUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-confident-avatar.mp4';
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    stageTimers.current.forEach(clearTimeout);
    if (pollRef.current) clearTimeout(pollRef.current);
    setCapturedBase64(null);
    setVideoUrl(null);
    setRenderPct(0);
    setError('');
    setPhase('idle');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <PresenceLogo href="/" size="sm" />
        <Link href="/login">
          <Button variant="outline" size="sm">Sign in</Button>
        </Link>
      </nav>

      <div className="max-w-md mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black leading-tight">See yourself at your most confident</h1>
          <p className="text-slate-400 text-sm">
            Take a selfie or upload a photo. Get a 15-second AI avatar video of you — confident, clear, magnetic. Free.
          </p>
        </div>

        {/* Limit reached — sign up CTA */}
        {phase === 'limit' ? (
          <div className="space-y-6 py-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-900/40 border border-violet-700/40 flex items-center justify-center mx-auto">
              <Sparkles size={26} className="text-violet-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white">Free previews used up</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                The free avatar preview has hit its limit. Sign up for PresenceAI to generate
                unlimited avatars with <strong className="text-white">your actual face and your cloned voice</strong> — plus a full 90-day coaching plan.
              </p>
            </div>

            <div className="rounded-2xl border border-violet-700/40 bg-violet-950/30 p-5 text-left space-y-3">
              <p className="text-xs text-violet-400 font-bold uppercase tracking-wider">What you get with an account</p>
              {[
                'Unlimited avatar videos with your cloned voice',
                'Face scan + voice analysis with personal coaching',
                '90-day dating confidence plan — daily missions',
                'Style profile, outfit builder, roleplay practice',
                '3 days free — ₹499/month after, cancel anytime',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <Link href="/login" className="block">
                <Button className="w-full bg-violet-600 hover:bg-violet-500 gap-2 h-12 text-base">
                  Start Free Trial — 3 Days Free <ArrowRight size={16} />
                </Button>
              </Link>
              <p className="text-xs text-slate-600">No charge for 3 days · ₹499/month after · Cancel anytime</p>
            </div>

            <button
              onClick={reset}
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              ← Try a different photo
            </button>
          </div>

        /* Done state — show blurred video with sign up CTA */
        ) : phase === 'done' && videoUrl ? (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-violet-700/50">
              <video
                src={videoUrl}
                playsInline
                autoPlay
                muted
                loop
                className="w-full"
                style={{ filter: 'blur(10px)', pointerEvents: 'none' }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center bg-slate-950/40">
                <p className="text-white font-black text-xl">Your avatar is ready 🔒</p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Sign up to see yourself clearly. 3 days free.
                </p>
                <Link href="/login" className="block w-full max-w-xs">
                  <Button className="w-full bg-violet-600 hover:bg-violet-500 gap-2 h-12 text-base">
                    Sign up free — see your avatar <ArrowRight size={16} />
                  </Button>
                </Link>
                <button
                  onClick={downloadVideo}
                  className="text-xs text-slate-500 hover:text-slate-400 transition-colors underline underline-offset-2"
                >
                  Download blurred preview
                </button>
              </div>
            </div>
            <Button variant="ghost" onClick={reset} className="w-full text-slate-500 text-sm">
              Try with a different photo
            </Button>
          </div>

        /* Rendering — compact progress */
        ) : phase === 'rendering' ? (
          <div className="space-y-5 py-4">
            <div className="text-center space-y-1">
              <p className="text-base font-bold text-white">Generating your avatar…</p>
              <p className="text-xs text-slate-500">Takes ~1–2 minutes. Don&apos;t close this tab.</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Rendering</span><span>{renderPct}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-1000"
                  style={{ width: `${renderPct}%` }}
                />
              </div>
            </div>
            {capturedBase64 && (
              <div className="flex items-center gap-3 rounded-xl bg-slate-900 border border-slate-800 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:${capturedMime};base64,${capturedBase64}`}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-white">Your photo is being animated</p>
                  <p className="text-xs text-slate-500 italic">&ldquo;I walk into every room knowing…&rdquo;</p>
                </div>
              </div>
            )}
          </div>

        /* Uploading — brief spinner */
        ) : phase === 'uploading' ? (
          <div className="flex flex-col items-center gap-4 py-10">
            <Loader2 size={32} className="animate-spin text-violet-400" />
            <p className="text-sm font-semibold text-white">Uploading your photo…</p>
          </div>

        /* Idle + error — show capture UI */
        ) : (
          <div className="space-y-4">
            {/* Reuse existing CameraCapture — handles live camera + upload + quality tips */}
            <CameraCapture onCapture={handleCapture} />

            {error && (
              <div className="rounded-xl bg-red-900/20 border border-red-800/40 px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
                {error.toLowerCase().includes('jpeg') || error.toLowerCase().includes('png') ? (
                  <p className="text-xs text-slate-500 mt-1">
                    On iPhone: tap the photo, tap &ldquo;Export&rdquo; → &ldquo;Save as JPEG&rdquo; first.
                  </p>
                ) : null}
              </div>
            )}

            {capturedBase64 && (
              <Button
                onClick={handleGenerate}
                className="w-full bg-violet-600 hover:bg-violet-500 gap-2 h-12 text-base"
              >
                Generate My Free Avatar →
              </Button>
            )}

            {!capturedBase64 && (
              <p className="text-xs text-slate-600 text-center">
                Take a selfie or upload a photo · Free · No account needed
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
