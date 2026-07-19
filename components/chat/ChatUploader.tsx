'use client';

import { useState, useRef } from 'react';
import { Upload, MessageSquare, ChevronDown } from 'lucide-react';
import type { ChatCoachData, ChatIntention } from '@/types';

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram DM' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'other', label: 'Other' },
] as const;

const INTENTIONS = [
  { value: 'keep_it_fun', label: 'Keep it fun & playful', description: 'Maintain the vibe without pressure' },
  { value: 'build_connection', label: 'Build deeper connection', description: 'More meaningful conversations' },
  { value: 'romantic_escalate', label: 'Escalate the attraction', description: 'Turn up romantic tension' },
  { value: 'get_a_date', label: 'Get a date', description: 'Move toward meeting IRL' },
  { value: 're_engage', label: 'Re-engage', description: 'Reignite a cold or flat convo' },
] as const;

interface Props {
  onSubmit: (data: ChatCoachData) => void;
  loading: boolean;
}

export function ChatUploader({ onSubmit, loading }: Props) {
  const [chatText, setChatText] = useState('');
  const [platform, setPlatform] = useState<ChatCoachData['platform']>('instagram');
  const [yourName, setYourName] = useState('');
  const [intention, setIntention] = useState<ChatIntention>('build_connection');
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setChatText(ev.target?.result as string);
    reader.readAsText(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!chatText.trim() || !yourName.trim()) return;
    onSubmit({ chatText, platform, yourName, intention });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Platform */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Platform</label>
        <div className="flex gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPlatform(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                platform === p.value
                  ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Your name in the chat */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Your name as it appears in the chat
        </label>
        <input
          type="text"
          value={yourName}
          onChange={(e) => setYourName(e.target.value)}
          placeholder="e.g. Vineet, You, Me"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500"
          required
        />
        <p className="text-xs text-slate-500">
          So we know which messages are yours vs theirs
        </p>
      </div>

      {/* Chat paste / upload */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">Paste the chat</label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            <Upload size={12} />
            Upload .txt file
          </button>
        </div>
        <input ref={fileRef} type="file" accept=".txt" className="hidden" onChange={handleFile} />
        <textarea
          value={chatText}
          onChange={(e) => setChatText(e.target.value)}
          placeholder={`Paste your chat here. Export from WhatsApp (More > Export Chat) or copy-paste from Instagram DMs.\n\nFormat like:\nVineet: Hey, how's your week going?\nSarah: Pretty good! Just got back from a trip\nVineet: No way, where to?`}
          rows={10}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 text-sm font-mono focus:outline-none focus:border-violet-500 resize-none"
          required
        />
        <p className="text-xs text-slate-500">
          More messages = better analysis. Aim for at least 15-20 exchanges.
        </p>
      </div>

      {/* Intention */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">What&apos;s your goal right now?</label>
        <div className="grid grid-cols-1 gap-2">
          {INTENTIONS.map((i) => (
            <button
              key={i.value}
              type="button"
              onClick={() => setIntention(i.value)}
              className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-left transition-colors ${
                intention === i.value
                  ? 'bg-violet-600/20 border-violet-500'
                  : 'border-slate-700 hover:border-slate-500'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 transition-colors ${
                  intention === i.value ? 'border-violet-500 bg-violet-500' : 'border-slate-600'
                }`}
              />
              <div>
                <div className={`text-sm font-medium ${intention === i.value ? 'text-violet-300' : 'text-slate-300'}`}>
                  {i.label}
                </div>
                <div className="text-xs text-slate-500">{i.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !chatText.trim() || !yourName.trim()}
        className="w-full py-3 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing the vibe...
          </>
        ) : (
          <>
            <MessageSquare size={16} />
            Analyze Chat
          </>
        )}
      </button>
    </form>
  );
}
