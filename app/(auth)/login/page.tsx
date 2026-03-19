'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Loader2, ShieldCheck } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGoogleSignIn() {
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError('Google sign-in failed. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center px-4 overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="animate-blob-1 absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-violet-600/30 blur-[80px]" />
        <div className="animate-blob-2 absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-sky-500/25 blur-[80px]" />
        <div className="animate-blob-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-pink-500/15 blur-[80px]" />
      </div>

      <div className="animate-fade-in-up relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-black gradient-text tracking-tight">
            PresenceAI
          </Link>
          <p className="text-slate-400 mt-3 text-base">
            Show up as your best self, every day.
          </p>
        </div>

        {/* Card */}
        <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/40">
          <p className="text-sm text-slate-400 text-center mb-6">
            Sign in to start your <span className="text-violet-300 font-medium">48-hour free trial</span>
          </p>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-semibold text-sm rounded-xl px-5 py-3.5 transition-all duration-150 hover:shadow-lg hover:shadow-white/10 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin text-slate-600" />
            ) : (
              <GoogleIcon />
            )}
            {loading ? 'Redirecting…' : 'Continue with Google'}
          </button>

          {error && (
            <p className="mt-4 text-sm text-red-400 text-center bg-red-900/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="mt-6 flex items-center gap-2 text-xs text-slate-600 justify-center">
            <ShieldCheck size={12} />
            No password needed · Secure via Google
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-600 text-center">
          By continuing, you agree to our{' '}
          <Link href="/privacy" className="text-slate-500 hover:text-violet-400 transition-colors">Privacy Policy</Link>
          {' '}and{' '}
          <Link href="/terms" className="text-slate-500 hover:text-violet-400 transition-colors">Terms of Service</Link>
        </p>
      </div>
    </div>
  );
}
