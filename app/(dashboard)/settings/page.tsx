'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Profile {
  subscription_status: string | null;
  trial_started_at: string | null;
  subscription_ends_at: string | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showManage, setShowManage] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email ?? '');
    });
    supabase
      .from('user_profiles')
      .select('subscription_status, trial_started_at, subscription_ends_at')
      .single()
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      });
  }, []);

  async function handleCancel() {
    if (confirmText.toLowerCase() !== 'cancel') return;
    setCancelling(true);
    try {
      await fetch('/api/payment/cancel-subscription', { method: 'POST' });
      setCancelled(true);
      setTimeout(() => {
        router.push('/trial');
        router.refresh();
      }, 2000);
    } catch {
      setCancelling(false);
    }
  }

  const status = profile?.subscription_status;
  const trialEnd = profile?.trial_started_at
    ? new Date(new Date(profile.trial_started_at).getTime() + 3 * 24 * 60 * 60 * 1000)
    : null;
  const subEnd = profile?.subscription_ends_at ? new Date(profile.subscription_ends_at) : null;
  const isActive = status === 'active' || status === 'trial';

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-black text-white">Settings</h1>

      {/* Account */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Account</p>
        <div>
          <p className="text-xs text-slate-500">Signed in as</p>
          <p className="text-sm text-white font-medium mt-0.5">{email}</p>
        </div>
      </div>

      {/* Subscription */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Plan</p>
        <div className="flex items-center justify-between">
          <div>
            {status === 'active' && (
              <>
                <p className="text-sm text-white font-medium">PresenceAI Weekly — ₹79/week</p>
                {subEnd && (
                  <p className="text-xs text-slate-500 mt-0.5">Renews {formatDate(subEnd.toISOString())}</p>
                )}
              </>
            )}
            {status === 'trial' && (
              <>
                <p className="text-sm text-white font-medium">Free trial</p>
                {trialEnd && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {trialEnd > new Date()
                      ? `Ends ${formatDate(trialEnd.toISOString())} · ₹79/week after`
                      : 'Trial ended'}
                  </p>
                )}
              </>
            )}
            {(status === 'expired' || status === 'none' || !status) && (
              <p className="text-sm text-slate-400">No active plan</p>
            )}
          </div>
          {status === 'active' || status === 'trial' ? (
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-900/30 border border-emerald-800/40 rounded-full px-2.5 py-1">
              Active
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-800/50 border border-slate-700/40 rounded-full px-2.5 py-1">
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* Manage plan — tucked away */}
      {isActive && !cancelled && (
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 overflow-hidden">
          <button
            onClick={() => setShowManage(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <span className="text-sm text-slate-400">Manage plan</span>
            {showManage
              ? <ChevronUp size={15} className="text-slate-600" />
              : <ChevronDown size={15} className="text-slate-600" />}
          </button>

          {showManage && (
            <div className="px-5 pb-5 border-t border-slate-800/60 pt-4 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                {status === 'trial'
                  ? 'Cancelling will end your trial immediately and remove access to all features.'
                  : 'Cancelling stops future charges. You keep access until the end of your current week.'}
              </p>

              {!cancelling && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Type <span className="text-slate-300 font-mono">cancel</span> to confirm
                  </p>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={e => setConfirmText(e.target.value)}
                    placeholder="cancel"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-500"
                  />
                  <Button
                    onClick={handleCancel}
                    disabled={confirmText.toLowerCase() !== 'cancel'}
                    variant="outline"
                    size="sm"
                    className="w-full text-red-400 border-red-800/40 hover:bg-red-900/20 hover:text-red-300 disabled:opacity-30"
                  >
                    Cancel {status === 'trial' ? 'free trial' : 'subscription'}
                  </Button>
                </div>
              )}

              {cancelling && !cancelled && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 size={14} className="animate-spin" />
                  Cancelling…
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {cancelled && (
        <div className="rounded-2xl border border-slate-700 bg-slate-900/50 px-5 py-4">
          <p className="text-sm text-slate-300">Subscription cancelled. Redirecting…</p>
        </div>
      )}
    </div>
  );
}
