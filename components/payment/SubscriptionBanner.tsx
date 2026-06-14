'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function SubscriptionBanner() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only show if user doesn't have an active trial or subscription
    const supabase = createClient();
    supabase.from('user_profiles')
      .select('subscription_status, trial_started_at')
      .single()
      .then(({ data }) => {
        if (!data) return;
        const status = data.subscription_status;
        const isActive = status === 'active';
        const inTrial = status === 'trial' &&
          data.trial_started_at &&
          new Date(data.trial_started_at).getTime() + 3 * 24 * 60 * 60 * 1000 > Date.now();
        if (!isActive && !inTrial) {
          const dismissed = sessionStorage.getItem('sub_banner_dismissed');
          if (!dismissed) setVisible(true);
        }
      });
  }, []);

  function dismiss() {
    sessionStorage.setItem('sub_banner_dismissed', '1');
    setDismissed(true);
  }

  async function subscribe() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/payment/create-subscription', { method: 'POST' });
      const data = await res.json() as { subscriptionId?: string; key?: string; error?: string };
      if (!res.ok || !data.subscriptionId) throw new Error(data.error || 'Could not start');

      const rzp = new window.Razorpay({
        key: data.key,
        subscription_id: data.subscriptionId,
        name: 'PresenceAI',
        description: '₹79/week — cancel anytime',
        theme: { color: '#7c3aed' },
        handler: async (response: { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string }) => {
          const verifyRes = await fetch('/api/payment/verify-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          if (verifyRes.ok) { router.refresh(); setDismissed(true); }
          else { setError('Verification failed'); setLoading(false); }
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  if (!visible || dismissed) return null;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-40 animate-fade-in-up">
        <div className="bg-slate-900 border border-violet-700/60 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
          <div className="p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-600/40 flex items-center justify-center shrink-0">
                  <Sparkles size={14} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Unlock full coaching</p>
                  <p className="text-xs text-slate-400">₹79/week · cancel anytime</p>
                </div>
              </div>
              <button onClick={dismiss} className="text-slate-600 hover:text-white transition-colors p-0.5">
                <X size={16} />
              </button>
            </div>
            {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
            <Button
              onClick={subscribe}
              disabled={loading}
              size="sm"
              className="w-full bg-violet-600 hover:bg-violet-500 gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : 'Start 3-day free trial →'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
