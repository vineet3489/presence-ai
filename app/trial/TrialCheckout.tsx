'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { Camera, Mic, Eye, Sparkles, CheckCircle2, Loader2, Lock, ShieldCheck, XCircle, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PresenceLogo } from '@/components/ui/PresenceLogo';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
    fbq?: (...args: unknown[]) => void;
  }
}

const FEATURES = [
  { icon: Eye,      label: 'Unlimited Perception Checks', desc: 'swipe odds + the #1 fix' },
  { icon: Camera,   label: 'Face Scan',                   desc: 'haircut, colors, grooming' },
  { icon: Mic,      label: 'Voice Check',                 desc: 'cut fillers, sound confident' },
  { icon: Sparkles, label: 'Your Ideal Look',             desc: 'see yourself at your best' },
  { icon: Heart,    label: 'Chat Coach + Date Prep',      desc: 'what to text, what to wear' },
];

const TRUST = [
  { icon: ShieldCheck, text: 'Secure checkout by Razorpay' },
  { icon: XCircle,     text: 'Cancel anytime in Settings' },
  { icon: Lock,        text: 'Your photos stay private' },
];

interface Props { isFirstTrial: boolean }

export function TrialCheckout({ isFirstTrial }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleStart() {
    setLoading(true);
    setError('');
    window.fbq?.('track', 'InitiateCheckout', { currency: 'INR', value: 0 });

    try {
      const res = await fetch('/api/payment/create-subscription', { method: 'POST' });
      const data = await res.json() as { subscriptionId?: string; key?: string; error?: string };
      if (!res.ok || !data.subscriptionId) throw new Error(data.error || 'Could not start');

      const rzp = new window.Razorpay({
        key: data.key,
        subscription_id: data.subscriptionId,
        name: 'PresenceAI',
        description: isFirstTrial ? '3 days free · then ₹79/week' : '₹79/week',
        theme: { color: '#7c3aed' },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_subscription_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch('/api/payment/verify-subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json() as { success?: boolean; error?: string };
            if (!verifyRes.ok) {
              setError(verifyData.error || 'Verification failed. Try again or contact support.');
              setLoading(false);
              return;
            }
            // Fire Meta Pixel StartTrial event
            window.fbq?.('track', 'StartTrial', { currency: 'INR', value: 0 });
            router.push('/dashboard');
            router.refresh();
          } catch {
            setError('Payment authorised but activation failed. Please contact support@mypresence.in — do not pay again.');
            setLoading(false);
          }
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

      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <div className="flex justify-center mb-10">
            <PresenceLogo href="/" size="md" />
          </div>

          {isFirstTrial ? (
            <>
              {/* Trial headline */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-emerald-900/30 border border-emerald-700/40 rounded-full px-4 py-1.5 text-sm text-emerald-300 mb-5">
                  <Sparkles size={13} /> Free for your first 3 days
                </div>
                <h1 className="text-3xl font-black text-white leading-tight mb-2">
                  Become the version<br />they swipe right on.
                </h1>
                <p className="text-slate-300 text-base">
                  <span className="text-white font-black text-2xl">₹0</span> today · then{' '}
                  <span className="text-white font-semibold">₹79/week</span>
                </p>
                <p className="text-slate-500 text-xs mt-1">Less than one coffee a week. Cancel anytime.</p>
              </div>

              {/* Timeline */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-[10px] font-black">✓</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Today — Add card or UPI</p>
                    <p className="text-slate-500 text-xs">₹0 charged. Full access unlocks instantly.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-6 h-6 rounded-full bg-violet-700/40 border border-violet-600/50 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-violet-300 text-[10px] font-black">3</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Days 1–3 — Full access, free</p>
                    <p className="text-slate-500 text-xs">Use everything. Cancel before Day 4 — pay nothing.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-slate-400 text-[10px] font-black">4</span>
                  </div>
                  <div>
                    <p className="text-slate-300 text-sm font-semibold">Day 4 onwards — ₹79/week</p>
                    <p className="text-slate-500 text-xs">Auto-charges weekly. Cancel anytime.</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Expired headline */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-4 py-1.5 text-sm text-slate-300 mb-5">
                  <Lock size={13} /> Your trial has ended
                </div>
                <h1 className="text-3xl font-black text-white leading-tight mb-2">
                  Continue your journey
                </h1>
                <p className="text-slate-400 text-sm">
                  <span className="text-white font-semibold">₹79/week</span> — cancel anytime
                </p>
              </div>
            </>
          )}

          {/* Features */}
          <ul className="space-y-2.5 mb-6">
            {FEATURES.map(({ label, desc }) => (
              <li key={label} className="flex items-center gap-3">
                <CheckCircle2 size={15} className="text-violet-400 shrink-0" />
                <span className="text-white text-sm font-medium">{label}</span>
                <span className="text-slate-500 text-xs">— {desc}</span>
              </li>
            ))}
          </ul>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-900/20 border border-red-800/30 px-4 py-3 mb-4">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* CTA */}
          <Button
            onClick={handleStart}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold text-base h-14 rounded-xl"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : isFirstTrial ? (
              'Start my 3-day free trial →'
            ) : (
              'Subscribe — ₹79/week →'
            )}
          </Button>

          <p className="text-xs text-slate-500 text-center mt-3">
            {isFirstTrial ? '₹0 for 3 days · Cards · UPI AutoPay' : 'Cards · UPI · Netbanking'}
          </p>

          <div className="mt-5 space-y-2 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3">
            {TRUST.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs text-slate-400">
                <Icon size={13} className="text-emerald-500 shrink-0" /> {text}
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-slate-700 mt-6">
            <a href="mailto:support@mypresence.in" className="hover:text-slate-500 transition-colors">
              support@mypresence.in
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
