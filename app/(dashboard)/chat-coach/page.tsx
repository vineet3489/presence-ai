'use client';

import { useState } from 'react';
import { RotateCcw, MessageCircleHeart } from 'lucide-react';
import { ChatUploader } from '@/components/chat/ChatUploader';
import { ChatCoachResults } from '@/components/chat/ChatCoachResults';
import type { ChatCoachData, ChatCoachResult } from '@/types';

export default function ChatCoachPage() {
  const [result, setResult] = useState<ChatCoachResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: ChatCoachData) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/chat-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Something went wrong');
      setResult(json.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <MessageCircleHeart size={22} className="text-pink-400" />
          <h1 className="text-2xl font-black text-white">Chat Coach</h1>
        </div>
        <p className="text-slate-400 text-sm">
          Paste a conversation from Instagram or WhatsApp. Get a personality read on both of you,
          their interest level, and exactly what to say next — tailored to your intention.
        </p>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-800/40 rounded-lg px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {!result ? (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6">
          <ChatUploader onSubmit={handleSubmit} loading={loading} />
        </div>
      ) : (
        <div className="space-y-6">
          <ChatCoachResults result={result} />
          <button
            onClick={() => { setResult(null); setError(null); }}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors"
          >
            <RotateCcw size={14} />
            Analyze another chat
          </button>
        </div>
      )}
    </div>
  );
}
