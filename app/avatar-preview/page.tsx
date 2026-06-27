'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, Play, Download, ArrowRight, X } from 'lucide-react';
import { PresenceLogo } from '@/components/ui/PresenceLogo';

const PRESET_SCRIPT = "I walk into every room knowing exactly who I am. I'm direct, I'm present, and I make people feel good being around me. What's your name?";

type Phase = 'idle' | 'uploading' | 'rendering' | 'done' | 'error';

export default function AvatarPreviewPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [renderPct, setRenderPct] = useState(0);
  const [error, setError] = useState('');
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setError('Please use a JPEG or PNG photo. HEIC, WEBP and other formats are not supported.');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError(`Photo is ${Math.round(file.size / 1024 / 1024)}MB — please use one under 8MB.`);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = ev => setPreviewImg(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function startProgress() {
    stageTimers.current.forEach(clearTimeout);
    const stages = [{ pct: 15, d: 5000 }, { pct: 35, d: 20000 }, { pct: 55, d: 38000 }, { pct: 75, d: 55000 }, { pct: 88, d: 70000 }];
    stages.forEach(({ pct, d }) => {
      stageTimers.current.push(setTimeout(() => setRenderPct(pct), d));
    });
  }

  function startPolling(videoId: string) {
    setPhase('rendering');
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
          localStorage.setItem('preview_video_id', videoId);
          return;
        }
        if (data.status === 'failed') {
          stageTimers.current.forEach(clearTimeout);
          setError('Video rendering failed. Try again.');
          setPhase('error');
          return;
        }
        pollRef.current = setTimeout(poll, 8000);
      } catch { pollRef.current = setTimeout(poll, 10000); }
    }
    poll();
  }

  async function handleGenerate() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setPhase('uploading');
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('script', PRESET_SCRIPT);

      const res = await fetch('/api/avatar/preview', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      startPolling(data.videoId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setPhase('error');
    }
  }

  async function downloadVideo() {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = 'my-confident-avatar.mp4';
    a.click();
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
        {/* Hero */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black leading-tight">See yourself at your most confident</h1>
          <p className="text-slate-400 text-sm">Upload a photo. Get a 15-second AI video of you — confident, clear, magnetic. Free.</p>
        </div>

        {phase === 'idle' || phase === 'error' ? (
          <div className="space-y-4">
            {/* Photo upload */}
            <div
              onClick={() => fileRef.current?.click()}
              className="rounded-2xl border-2 border-dashed border-slate-700 hover:border-violet-600 transition-colors cursor-pointer p-8 flex flex-col items-center gap-3"
            >
              {previewImg ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewImg} alt="Preview" className="w-32 h-32 object-cover rounded-xl" />
                  <button
                    onClick={e => { e.stopPropagation(); setPreviewImg(null); if (fileRef.current) fileRef.current.value = ''; }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={28} className="text-slate-600" />
                  <p className="text-sm text-slate-400 text-center">Tap to upload a clear, front-facing photo</p>
                  <p className="text-xs text-slate-600">Good lighting · Face visible · No group photos</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <Button
              onClick={handleGenerate}
              disabled={!previewImg}
              className="w-full bg-violet-600 hover:bg-violet-500 gap-2 h-12 text-base"
            >
              <Play size={16} /> Generate My Free Avatar
            </Button>

            <p className="text-xs text-slate-600 text-center">1 free preview per session · Watermarked · No account needed</p>

            {/* What you get */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
              {['Your actual face in the video', 'Confident 15-second script', 'Ready to share on Instagram / WhatsApp'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-1 h-1 rounded-full bg-violet-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        ) : phase === 'uploading' ? (
          <div className="flex flex-col items-center gap-4 py-10">
            <Loader2 size={32} className="animate-spin text-violet-400" />
            <p className="text-sm font-semibold text-white">Setting up your avatar…</p>
            <p className="text-xs text-slate-500">Uploading your photo</p>
          </div>
        ) : phase === 'rendering' ? (
          <div className="space-y-4 py-6">
            <div className="text-center">
              <p className="text-lg font-bold text-white mb-1">Rendering your avatar…</p>
              <p className="text-sm text-slate-400">Takes ~1–2 minutes. Don&apos;t close this tab.</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Progress</span><span>{renderPct}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-1000"
                  style={{ width: `${renderPct}%` }}
                />
              </div>
            </div>
            {previewImg && (
              <div className="flex items-center gap-3 rounded-xl bg-slate-900 border border-slate-800 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewImg} alt="" className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <p className="text-sm font-medium text-white">Your photo is being animated</p>
                  <p className="text-xs text-slate-500">Script: &ldquo;I walk into every room knowing…&rdquo;</p>
                </div>
              </div>
            )}
          </div>
        ) : phase === 'done' && videoUrl ? (
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden border border-violet-700/50">
              <video src={videoUrl} controls playsInline autoPlay className="w-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={downloadVideo} variant="outline" className="gap-2">
                <Download size={14} /> Download
              </Button>
              <Link href="/login" className="block">
                <Button className="w-full bg-violet-600 hover:bg-violet-500 gap-2">
                  Get Full Access <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
            <div className="rounded-2xl border border-violet-800/30 bg-violet-950/20 p-4 text-center space-y-2">
              <p className="text-sm font-bold text-white">Want your own voice on this?</p>
              <p className="text-xs text-slate-400">Create an account — we&apos;ll clone your voice from a 30-second recording and regenerate this with you actually speaking.</p>
              <Link href="/login">
                <Button size="sm" className="bg-violet-600 hover:bg-violet-500 mt-1">Start free trial →</Button>
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
