'use client';

import { Copy, Check, TrendingUp, TrendingDown, User, Users, Zap } from 'lucide-react';
import { useState } from 'react';
import type { ChatCoachResult } from '@/types';

interface Props {
  result: ChatCoachResult;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className="p-1.5 rounded text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
      title="Copy message"
    >
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
    </button>
  );
}

function InterestMeter({ value }: { value: number }) {
  const color =
    value >= 70 ? 'bg-green-500' : value >= 45 ? 'bg-yellow-500' : 'bg-red-500';
  const label =
    value >= 70 ? 'High interest' : value >= 45 ? 'Moderate interest' : 'Low interest';
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">Their interest level</span>
        <span className={`font-bold ${value >= 70 ? 'text-green-400' : value >= 45 ? 'text-yellow-400' : 'text-red-400'}`}>
          {value}% — {label}
        </span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

const TONE_COLORS: Record<string, string> = {
  playful: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  direct: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  vulnerable: 'text-pink-400 bg-pink-400/10 border-pink-400/30',
  curious: 'text-violet-400 bg-violet-400/10 border-violet-400/30',
  confident: 'text-green-400 bg-green-400/10 border-green-400/30',
  warm: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
};

function toneClass(tone: string) {
  const key = tone.toLowerCase().split(' ')[0];
  return TONE_COLORS[key] ?? 'text-slate-400 bg-slate-400/10 border-slate-400/30';
}

export function ChatCoachResults({ result }: Props) {
  return (
    <div className="space-y-6">
      {/* Interest meter */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
        <InterestMeter value={result.interestLevel} />
      </div>

      {/* Dynamic */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Users size={16} className="text-violet-400" />
          <h3 className="text-sm font-semibold text-white">The Dynamic</h3>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{result.dynamic}</p>
      </div>

      {/* Suggested replies */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Zap size={16} className="text-violet-400" />
          What to say next
        </h3>
        {result.suggestedReplies.map((reply, i) => (
          <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-white text-sm font-medium leading-relaxed flex-1">{reply.message}</p>
              <CopyButton text={reply.message} />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${toneClass(reply.tone)}`}>
                {reply.tone}
              </span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">{reply.reasoning}</p>
          </div>
        ))}
      </div>

      {/* Personality reads */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <User size={15} className="text-sky-400" />
            <h3 className="text-sm font-semibold text-white">You</h3>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">{result.yourPersonality.summary}</p>
          <div className="space-y-1">
            {result.yourPersonality.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-green-400">
                <TrendingUp size={11} className="mt-0.5 shrink-0" />
                {s}
              </div>
            ))}
            {result.yourPersonality.blindSpots.map((b, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-yellow-400">
                <TrendingDown size={11} className="mt-0.5 shrink-0" />
                {b}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <User size={15} className="text-pink-400" />
            <h3 className="text-sm font-semibold text-white">Them</h3>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">{result.theirPersonality.summary}</p>
          <div className="space-y-1">
            {result.theirPersonality.whatTheyRespondTo.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-violet-400">
                <Check size={11} className="mt-0.5 shrink-0" />
                Responds to: {w}
              </div>
            ))}
            {result.theirPersonality.redFlags.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-red-400">
                <TrendingDown size={11} className="mt-0.5 shrink-0" />
                {r}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Do / Don't */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-slate-900 rounded-xl border border-green-900/40 p-5 space-y-2">
          <h3 className="text-sm font-semibold text-green-400">Do</h3>
          <ul className="space-y-1.5">
            {result.doList.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <Check size={11} className="mt-0.5 shrink-0 text-green-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-slate-900 rounded-xl border border-red-900/40 p-5 space-y-2">
          <h3 className="text-sm font-semibold text-red-400">Don&apos;t</h3>
          <ul className="space-y-1.5">
            {result.dontList.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <TrendingDown size={11} className="mt-0.5 shrink-0 text-red-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Overall read */}
      <div className="bg-gradient-to-br from-violet-950/40 to-slate-900 rounded-xl border border-violet-800/30 p-5 space-y-2">
        <h3 className="text-sm font-semibold text-violet-300">The Full Read</h3>
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{result.overallRead}</p>
      </div>
    </div>
  );
}
