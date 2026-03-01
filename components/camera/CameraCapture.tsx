'use client';

import { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, RotateCcw, Check } from 'lucide-react';

interface Props {
  onCapture: (base64: string, mediaType: 'image/jpeg' | 'image/png') => void;
}

export function CameraCapture({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'idle' | 'camera' | 'preview'>('idle');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState('');

  async function startCamera() {
    setError('');
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(s);
      setMode('camera');
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      setError('Camera access denied. Please use the upload option instead.');
    }
  }

  function stopCamera() {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();
    const base64 = dataUrl.replace('data:image/jpeg;base64,', '');
    setPreviewSrc(dataUrl);
    setMode('preview');
    onCapture(base64, 'image/jpeg');
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const mediaType = file.type as 'image/jpeg' | 'image/png';
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const base64 = dataUrl.split(',')[1];
      setPreviewSrc(dataUrl);
      setMode('preview');
      onCapture(base64, mediaType);
    };
    reader.readAsDataURL(file);
  }

  function reset() {
    stopCamera();
    setPreviewSrc(null);
    setMode('idle');
    if (fileRef.current) fileRef.current.value = '';
  }

  if (mode === 'preview' && previewSrc) {
    return (
      <div className="space-y-4">
        <div className="relative rounded-2xl overflow-hidden bg-slate-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewSrc} alt="Captured" className="w-full max-h-96 object-contain" />
          <div className="absolute top-3 right-3 bg-emerald-600 rounded-full p-1.5">
            <Check size={16} className="text-white" />
          </div>
        </div>
        <Button variant="outline" onClick={reset} className="w-full gap-2">
          <RotateCcw size={16} /> Retake / Upload different photo
        </Button>
      </div>
    );
  }

  if (mode === 'camera') {
    return (
      <div className="space-y-4">
        <div className="relative rounded-2xl overflow-hidden bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-96 object-cover" />
          {/* Face guide overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-64 border-2 border-violet-400/50 rounded-full" />
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => { stopCamera(); setMode('idle'); }} className="flex-1">
            Cancel
          </Button>
          <Button onClick={capturePhoto} className="flex-1 gap-2">
            <Camera size={16} /> Capture
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />
      {error && <p className="text-sm text-amber-400 bg-amber-900/20 rounded-lg px-3 py-2">{error}</p>}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={startCamera}
          className="flex flex-col items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-8 hover:border-violet-600 hover:bg-violet-900/10 transition-all group"
        >
          <Camera size={32} className="text-slate-500 group-hover:text-violet-400 transition-colors" />
          <span className="text-sm text-slate-400 group-hover:text-white transition-colors">Use Camera</span>
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-8 hover:border-violet-600 hover:bg-violet-900/10 transition-all group"
        >
          <Upload size={32} className="text-slate-500 group-hover:text-violet-400 transition-colors" />
          <span className="text-sm text-slate-400 group-hover:text-white transition-colors">Upload Photo</span>
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileUpload}
      />
      <p className="text-xs text-slate-500 text-center">
        For best results: good lighting, face clearly visible, ideally full-body for posture analysis
      </p>
    </div>
  );
}
