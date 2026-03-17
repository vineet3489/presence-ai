'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, CheckCircle2 } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // Session established immediately (email confirmation disabled in Supabase)
    if (data.session) {
      router.push('/onboarding');
      router.refresh();
    } else {
      // Email confirmation required — tell the user clearly
      setConfirmationSent(true);
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  if (confirmationSent) {
    return (
      <div className="relative min-h-screen bg-slate-950 flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="animate-blob-1 absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[100px]" />
          <div className="animate-blob-2 absolute bottom-[-15%] right-[-10%] w-[450px] h-[450px] rounded-full bg-sky-500/15 blur-[100px]" />
        </div>
        <div className="animate-fade-in-up relative z-10 w-full max-w-sm text-center">
          <Link href="/" className="text-2xl font-black gradient-text">PresenceAI</Link>
          <div className="mt-8 bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-8">
            <CheckCircle2 size={48} className="text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              We sent a confirmation link to <span className="text-white font-medium">{email}</span>.
              Click it to activate your account and start your journey.
            </p>
            <p className="text-xs text-slate-500 mt-4">Can&apos;t find it? Check your spam folder.</p>
          </div>
          <p className="text-sm text-slate-500 mt-5">
            Already confirmed?{' '}
            <Link href="/login" className="text-violet-400 hover:text-violet-300">Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center px-4 overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="animate-blob-1 absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="animate-blob-2 absolute bottom-[-15%] right-[-10%] w-[450px] h-[450px] rounded-full bg-sky-500/15 blur-[100px]" />
        <div className="animate-blob-3 absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full bg-pink-500/10 blur-[80px]" />
      </div>

      <div className="animate-fade-in-up relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black gradient-text">PresenceAI</Link>
          <p className="text-slate-400 mt-2 text-sm">Create your free account</p>
          <p className="text-xs text-slate-600 mt-1">48-hour free trial · No credit card required</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-7 shadow-2xl">
          {/* Google */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 font-medium text-sm rounded-xl px-4 py-3 transition-all hover:shadow-lg disabled:opacity-60 mb-5"
          >
            {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
            Sign up with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-xs text-slate-500">or</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-800/80 border-slate-600 focus:border-violet-500 text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Password</label>
              <Input
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
                className="bg-slate-800/80 border-slate-600 focus:border-violet-500 text-white"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-300 bg-red-900/20 border border-red-800/40 rounded-xl px-3 py-2.5">
                <Mail size={14} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-500" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create account →'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
