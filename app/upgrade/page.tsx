'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';
import { Sparkles, Mic, Camera, Heart, MessageCircleHeart, BarChart2, Users, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FEATURES = [
  { icon: Camera, label: 'AI Photo Audit', desc: 'Upload a photo — get specific styling & grooming coaching' },
  { icon: Mic, label: 'Voice Confidence Coach', desc: 'Record yourself, get scored on clarity, pace & filler words' },
  { icon: Heart, label: 'Date Prep Suite', desc: 'Date plan + outfit builder + night-before checklist' },
  { icon: Users, label: 'Conversation Roleplay', desc: 'Practice real scenarios with AI — coffee shop, gym, DM→IRL' },
  { icon: MessageCircleHeart, label: 'Chat Coach', desc: 'Paste your DMs — get a personality read + reply suggestions' },
  { icon: BarChart2, label: 'Weekly Presence Report', desc: 'Track your scores + get a shareable progress card' },
];

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function UpgradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleUpgrade() {
    setLoading(true);
    setError('');

    try {
      // Create Razorpay order
      const orderRes = await fetch('/api/payment/create-order', { method: 'POST' });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'PresenceAI',
        description: '7-day access — ₹99/week',
        order_id: orderData.orderId,
        theme: { color: '#7c3aed' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          // Verify payment server-side
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) {
            setError(verifyData.error || 'Payment verification failed');
            setLoading(false);
            return;
          }
          router.push('/dashboard');
          router.refresh();
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
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
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-10">
            <Link href="/" className="text-2xl font-black gradient-text">PresenceAI</Link>
            <div className="mt-6 inline-flex items-center gap-2 bg-violet-900/30 border border-violet-700/40 rounded-full px-4 py-1.5 text-sm text-violet-300">
              <Sparkles size={14} />
              Your free trial has ended
            </div>
            <h1 className="text-3xl font-black text-white mt-4 leading-tight">
              Keep building your presence
            </h1>
            <p className="text-slate-400 mt-2 text-base">
              Less than one coffee. More confidence in 7 days.
            </p>
          </div>

          {/* Pricing card */}
          <div className="border border-violet-700/50 rounded-2xl bg-slate-900/60 p-8 mb-6">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-5xl font-black text-white">₹99</span>
              <span className="text-slate-400 text-lg">/week</span>
            </div>
            <p className="text-slate-500 text-sm mb-6">Renews every 7 days. Cancel anytime.</p>

            <ul className="space-y-3 mb-8">
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <li key={label} className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white text-sm font-medium">{label}</span>
                    <span className="text-slate-500 text-xs block">{desc}</span>
                  </div>
                </li>
              ))}
            </ul>

            {error && (
              <p className="text-sm text-red-400 bg-red-900/20 rounded-lg px-3 py-2 mb-4">{error}</p>
            )}

            <Button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold text-base py-6 rounded-xl"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>Unlock for ₹99 <span className="opacity-70 text-sm ml-1">— 7 days</span></>
              )}
            </Button>

            <p className="text-xs text-slate-600 text-center mt-3">
              Secure payment via Razorpay · UPI, cards & netbanking accepted
            </p>
          </div>

          <p className="text-center text-xs text-slate-600">
            "Other apps write your texts. Presence trains you to never need them."
          </p>
        </div>
      </div>
    </>
  );
}
