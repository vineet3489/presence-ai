'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, RotateCcw, Check, Info, AlertTriangle } from 'lucide-react';

interface Props {
  onCapture: (base64: string, mediaType: 'image/jpeg' | 'image/png') => void;
}

const MIN_DIMENSION = 200; // px — reject tiny/cropped images

export function CameraCapture({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'idle' | 'camera' | 'preview'>('idle');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState('');
  const [showTip, setShowTip] = useState(true);

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
      setError('Camera access denied. Use the upload option instead.');
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

  function validateAndLoad(file: File, dataUrl: string) {
    const img = new Image();
    img.onload = () => {
      if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
        setError('Image too small or blurry. Please upload a clear, full-face photo (at least 200×200px).');
        if (fileRef.current) fileRef.current.value = '';
        return;
      }
      const base64 = dataUrl.split(',')[1];
      setPreviewSrc(dataUrl);
      setMode('preview');
      onCapture(base64, file.type as 'image/jpeg' | 'image/png');
    };
    img.src = dataUrl;
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Please use a photo under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      validateAndLoad(file, dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function reset() {
    stopCamera();
    setPreviewSrc(null);
    setMode('idle');
    setError('');
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
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-64 border-2 border-violet-400/50 rounded-full" />
          </div>
          <div className="absolute bottom-3 left-0 right-0 text-center">
            <span className="text-xs text-slate-300 bg-black/60 rounded-full px-3 py-1">
              Align face within oval · Good lighting · Look straight ahead
            </span>
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

      {/* Quality tip banner */}
      {showTip && (
        <div className="rounded-xl border border-violet-800/40 bg-violet-900/15 p-4">
          <div className="flex items-start gap-3">
            <Info size={16} className="text-violet-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-violet-300 mb-1">For quality results</p>
              <ul className="text-xs text-slate-400 space-y-0.5">
                <li>• Face clearly visible, good natural or indoor lighting</li>
                <li>• Look straight at the camera, neutral or slight smile</li>
                <li>• Full face + neck visible (include shoulders if possible)</li>
                <li>• No heavy filters, extreme angles, or sunglasses</li>
              </ul>
            </div>
            <button onClick={() => setShowTip(false)} className="text-slate-600 hover:text-slate-400 text-xs shrink-0">✕</button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-800/40 bg-red-900/15 px-4 py-3">
          <AlertTriangle size={15} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={startCamera}
          className="flex flex-col items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-6 md:p-8 hover:border-violet-600 hover:bg-violet-900/10 transition-all group"
        >
          <Camera size={28} className="text-slate-500 group-hover:text-violet-400 transition-colors" />
          <span className="text-sm text-slate-400 group-hover:text-white transition-colors">Use Camera</span>
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-6 md:p-8 hover:border-violet-600 hover:bg-violet-900/10 transition-all group"
        >
          <Upload size={28} className="text-slate-500 group-hover:text-violet-400 transition-colors" />
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
    </div>
  );
}
