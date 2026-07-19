'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, X } from 'lucide-react';

interface Props {
  onConsent: () => void;
  onDismiss?: () => void;
}

export function BiometricConsentModal({ onConsent, onDismiss }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleConsent() {
    setLoading(true);
    try {
      await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent_type: 'biometric' }),
      });
    } catch { /* non-fatal */ }
    onConsent();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-900/40 border border-violet-700/40 flex items-center justify-center shrink-0">
              <Shield size={18} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Before we analyze your photo</h2>
              <p className="text-xs text-slate-500">Your biometric data, your control</p>
            </div>
          </div>
          {onDismiss && (
            <button onClick={onDismiss} className="text-slate-600 hover:text-white">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>PresenceAI will analyze photos of your face and recordings of your voice to give you personalized coaching.</p>
          <ul className="space-y-2">
            {[
              'Stored securely on Indian servers (Supabase ap-south-2)',
              'Used only for your coaching — never sold or shared',
              'You can delete all your data anytime from Settings',
              'Face photos auto-expire after 90 days unless you keep them',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-violet-400 shrink-0 mt-0.5">✓</span>
                <span className="text-slate-400 text-xs">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <Button onClick={handleConsent} disabled={loading} className="w-full bg-violet-600 hover:bg-violet-500">
            {loading ? 'Saving…' : 'I understand and agree →'}
          </Button>
          <p className="text-[10px] text-slate-600 text-center">
            By continuing you accept our{' '}
            <a href="/privacy" className="underline text-slate-500 hover:text-white" target="_blank">Privacy Policy</a>
            {' '}and{' '}
            <a href="/terms" className="underline text-slate-500 hover:text-white" target="_blank">Terms</a>
          </p>
        </div>
      </div>
    </div>
  );
}
