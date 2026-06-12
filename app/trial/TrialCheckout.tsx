'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';
import { Camera, Mic, Heart, MessageCircleHeart, BarChart2, Users, CheckCircle2, Loader2, Sparkles, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const FEATURES = [
  { icon: Camera,             label: 'AI Photo Audit',          desc: 'Styling & grooming coaching from your selfie' },
  { icon: Mic,                label: 'Voice Coach',              desc: 'Scored on clarity, pace & filler words' },
  { icon: Heart,              label: 'Date Prep',                desc: 'Outfit + opener + pre-date checklist' },
  { icon: Users,              label: 'Conversation Roleplay',    desc: 'Practice real scenarios, AI-scored' },
  { icon: MessageCircleHeart, label: 'Chat Coach',               desc: 'Paste your DMs, get a personality read' },
  { icon: BarChart2,          label: 'Weekly Progress Report',   desc: 'Track your scores over time' },
];

interface Props {
  isFirstTrial: boolean;
}

export function TrialCheckout({ isFirstTrial }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleStart() {
    setLoading(true);
    setError('');

    try {
      // 1. Create Razorpay subscription on the server
      const res = await fetch('/api/payment/create-subscription', { method: 'POST' });
      const data = await res.json() as { subscriptionId?: string; key?: string; error?: string };
      if (!res.ok || !data.subscriptionId) throw new Error(data.error || 'Could not start subscription');

      // 2. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: data.key,
        subscription_id: data.subscriptionId,
        name: 'PresenceAI',
        description: isFirstTrial ? '3 days free, then ₹349/month' : '₹349/month',
        theme: { color: '#7c3aed' },
        prefill: {},
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_subscription_id: string;
          razorpay_signature: string;
        }) => {
          // 3. Verify mandate server-side
          const verifyRes = await fetch('/api/payment/verify-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json() as { success?: boolean; error?: string };
          if (!verifyRes.ok) {
            setError(verifyData.error || 'Verification failed. Contact support.');
            setLoading(false);
            return;
          }
          router.push('/dashboard');
          router.refresh();
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-black gradient-text">PresenceAI</Link>
          </div>

          {/* Headline */}
          <div className="text-center mb-8">
            {isFirstTrial ? (
              <>
                <div className="inline-flex items-center gap-2 bg-violet-900/30 border border-violet-700/40 rounded-full px-4 py-1.5 text-sm text-violet-300 mb-4">
                  <Sparkles size={13} /> 3 days completely free
                </div>
                <h1 className="text-3xl font-black text-white leading-tight">
                  Start your free trial
                </h1>
                <p className="text-slate-400 mt-2">
                  Then <span className="text-white font-semibold">₹349/month</span> — cancel anytime
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 bg-red-900/30 border border-red-700/40 rounded-full px-4 py-1.5 text-sm text-red-300 mb-4">
                  <Lock size={13} /> Your trial has ended
                </div>
                <h1 className="text-3xl font-black text-white leading-tight">
                  Subscribe to continue
                </h1>
                <p className="text-slate-400 mt-2">
                  <span className="text-white font-semibold">₹349/month</span> — cancel anytime
                </p>
              </>
            )}
          </div>

          {/* Pricing card */}
          <div className="border border-violet-700/50 rounded-2xl bg-slate-900/60 p-7 mb-5">
            {isFirstTrial && (
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-800">
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">3 days free</p>
                  <p className="text-slate-500 text-xs">No charge until day 4</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-sm">Then ₹349/mo</p>
                  <p className="text-slate-500 text-xs">Auto-renews monthly</p>
                </div>
              </div>
            )}

            <ul className="space-y-3 mb-6">
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <li key={label} className="flex items-start gap-3">
                  <CheckCircle2 size={15} className="text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white text-sm font-medium">{label}</span>
                    <span className="text-slate-500 text-xs block">{desc}</span>
                  </div>
                </li>
              ))}
            </ul>

            {error && (
              <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/30 rounded-xl px-4 py-3 mb-4">
                {error}
              </p>
            )}

            <Button
              onClick={handleStart}
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold text-base py-6 rounded-xl"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isFirstTrial ? (
                'Start 3-day free trial →'
              ) : (
                'Subscribe for ₹349/month →'
              )}
            </Button>

            <p className="text-xs text-slate-600 text-center mt-3">
              {isFirstTrial
                ? 'UPI mandate set up today · First charge on day 4'
                : 'Charged immediately · UPI / cards / netbanking'}
              {' '}· Secure via Razorpay
            </p>
          </div>

          <p className="text-center text-xs text-slate-600">
            Questions? <a href="mailto:support@mypresence.in" className="text-slate-500 hover:text-violet-400 transition-colors">support@mypresence.in</a>
          </p>
        </div>
      </div>
    </>
  );
}
