'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranscription, speak } from '@/hooks/useTranscription';
import { cn } from '@/lib/utils';
import type { RoleplayMessage, RoleplayScenario, RoleplayTurn } from '@/types';

const SCENARIOS: RoleplayScenario[] = [
  {
    id: 'coffee_shop',
    label: 'Coffee Shop',
    description: 'Approach someone reading alone at a café',
    personaDescription: 'Attractive stranger, slightly guarded',
    setting: 'Café',
  },
  {
    id: 'gym',
    label: 'Gym',
    description: 'Start a conversation after a workout',
    personaDescription: 'Friendly, but has places to be',
    setting: 'Gym',
  },
  {
    id: 'class',
    label: 'Class',
    description: 'Talk to a classmate you\'ve noticed',
    personaDescription: 'Familiar face, first conversation',
    setting: 'University',
  },
  {
    id: 'dm_to_irl',
    label: 'DM → Real Life',
    description: 'Move from texting to asking to meet',
    personaDescription: 'Interested but wants to feel sure',
    setting: 'Chat',
  },
  {
    id: 'general',
    label: 'Free Practice',
    description: 'Practice with someone at a house party',
    personaDescription: 'Interesting, slightly hard to read',
    setting: 'Party',
  },
];

interface Turn {
  message: RoleplayMessage;
  turn?: RoleplayTurn;
}

export default function RoleplayPage() {
  const [scenario, setScenario] = useState<RoleplayScenario | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionOver, setSessionOver] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { transcript, interimTranscript, isListening, isSupported, error: micError, startListening, stopListening, reset: resetMic } = useTranscription();

  // Sync speech transcript → input
  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, loading]);

  async function startScenario(s: RoleplayScenario) {
    setScenario(s);
    setTurns([]);
    setSessionOver(false);
    setLoading(true);

    const res = await fetch('/api/roleplay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioId: s.id, messages: [] }),
    });
    const data: RoleplayTurn & { raw: string } = await res.json();
    setTurns([{ message: { role: 'assistant', content: data.reply }, turn: data }]);
    if (voiceEnabled && data.reply) {
      setIsSpeaking(true);
      speak(data.reply, () => setIsSpeaking(false));
    }
    setLoading(false);
  }

  async function sendMessage() {
    if (!input.trim() || !scenario || loading) return;

    const userMsg: RoleplayMessage = { role: 'user', content: input.trim() };
    setInput('');
    resetMic();

    const updatedTurns: Turn[] = [...turns, { message: userMsg }];
    setTurns(updatedTurns);
    setLoading(true);

    // Build messages history for API
    const messages = updatedTurns.map((t) => t.message);

    const res = await fetch('/api/roleplay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioId: scenario.id, messages }),
    });
    const data: RoleplayTurn & { raw: string } = await res.json();

    const aiMsg: RoleplayMessage = { role: 'assistant', content: data.raw };
    setTurns([...updatedTurns, { message: aiMsg, turn: data }]);

    if (voiceEnabled && data.reply) {
      setIsSpeaking(true);
      speak(data.reply, () => setIsSpeaking(false));
    }
    setLoading(false);
  }

  function handleMicToggle() {
    if (isListening) {
      stopListening();
    } else {
      resetMic();
      setInput('');
      startListening();
    }
  }

  function endSession() {
    setSessionOver(true);
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }

  function restart() {
    setScenario(null);
    setTurns([]);
    setInput('');
    setSessionOver(false);
    resetMic();
  }

  // Session stats
  const userTurns = turns.filter((t) => t.message.role === 'user');
  const aiTurnsWithScores = turns.filter((t) => t.message.role === 'assistant' && t.turn?.score);
  const avgScore = aiTurnsWithScores.length
    ? Math.round(
        aiTurnsWithScores.reduce((sum, t) => {
          const s = t.turn!.score;
          return sum + (s.confidence + s.warmth + s.naturalness) / 3;
        }, 0) / aiTurnsWithScores.length
      )
    : null;

  // Scenario picker
  if (!scenario) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">Conversation Roleplay</h1>
          <p className="text-slate-400 mt-1">
            Practice real-world approaches with an AI that responds like a real person. Get scored on every message.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => startScenario(s)}
              className="text-left border border-slate-700 rounded-2xl p-5 bg-slate-900 hover:border-violet-500/60 hover:bg-slate-800 transition-all group"
            >
              <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">{s.setting}</div>
              <h3 className="text-white font-bold text-base group-hover:text-violet-300 transition-colors">{s.label}</h3>
              <p className="text-slate-400 text-sm mt-1">{s.description}</p>
              <p className="text-xs text-slate-600 mt-2 italic">{s.personaDescription}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={cn(
              'flex items-center gap-2 text-sm px-4 py-2 rounded-full border transition-colors',
              voiceEnabled
                ? 'border-violet-500 bg-violet-900/30 text-violet-300'
                : 'border-slate-700 text-slate-400 hover:border-slate-600'
            )}
          >
            {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            AI voice {voiceEnabled ? 'on' : 'off'}
          </button>
          {!isSupported && (
            <span className="text-xs text-amber-400">Mic not supported in this browser (use Chrome)</span>
          )}
        </div>
      </div>
    );
  }

  // Session debrief
  if (sessionOver) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-white mb-2">Session Debrief</h1>
        <p className="text-slate-400 mb-8">Here's how you did in the {scenario.label} scenario.</p>

        {avgScore !== null && (
          <div className="border border-slate-700 rounded-2xl p-6 bg-slate-900 mb-6 text-center">
            <div className="text-6xl font-black gradient-text">{avgScore}</div>
            <div className="text-slate-400 mt-1">Average Presence Score</div>
            <div className="text-slate-500 text-sm mt-1">{userTurns.length} messages sent</div>
          </div>
        )}

        {aiTurnsWithScores.length > 0 && (
          <div className="space-y-3 mb-8">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Message Breakdown</h2>
            {userTurns.map((t, i) => {
              const aiTurn = aiTurnsWithScores[i];
              if (!aiTurn?.turn) return null;
              const s = aiTurn.turn.score;
              return (
                <div key={i} className="border border-slate-800 rounded-xl p-4">
                  <p className="text-sm text-white mb-3 italic">"{t.message.content}"</p>
                  <div className="flex gap-4 mb-2">
                    {[
                      { label: 'Confidence', value: s.confidence, color: 'text-violet-400' },
                      { label: 'Warmth', value: s.warmth, color: 'text-pink-400' },
                      { label: 'Naturalness', value: s.naturalness, color: 'text-sky-400' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="text-center">
                        <div className={`text-xl font-black ${color}`}>{value}</div>
                        <div className="text-xs text-slate-500">{label}</div>
                      </div>
                    ))}
                  </div>
                  {aiTurn.turn.coaching && (
                    <p className="text-xs text-slate-400 bg-slate-800 rounded-lg px-3 py-2 mt-2">
                      {aiTurn.turn.coaching}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Button onClick={restart} className="w-full gap-2">
          <RotateCcw size={16} /> Try another scenario
        </Button>
      </div>
    );
  }

  // Chat interface
  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
        <div>
          <h2 className="font-bold text-white">{scenario.label}</h2>
          <p className="text-xs text-slate-500">{scenario.description} · {scenario.personaDescription}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={cn(
              'p-2 rounded-lg border transition-colors',
              voiceEnabled ? 'border-violet-500 text-violet-400' : 'border-slate-700 text-slate-500'
            )}
            title="Toggle AI voice"
          >
            {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <Button variant="outline" size="sm" onClick={endSession}>End & Debrief</Button>
          <button onClick={restart} className="p-2 rounded-lg border border-slate-700 text-slate-500 hover:text-white transition-colors">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {turns.map((t, i) => {
          const isUser = t.message.role === 'user';
          const displayContent = isUser ? t.message.content : (t.turn?.reply || t.message.content);

          return (
            <div key={i} className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}>
              <div
                className={cn(
                  'max-w-sm rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  isUser
                    ? 'bg-violet-600 text-white rounded-br-sm'
                    : 'bg-slate-800 text-slate-100 rounded-bl-sm'
                )}
              >
                {displayContent}
              </div>

              {/* Scores for AI turns */}
              {!isUser && t.turn && t.turn.score.confidence > 0 && (
                <div className="flex gap-3 mt-1.5 text-xs">
                  {[
                    { label: 'Conf', value: t.turn.score.confidence, color: 'text-violet-400' },
                    { label: 'Warmth', value: t.turn.score.warmth, color: 'text-pink-400' },
                    { label: 'Natural', value: t.turn.score.naturalness, color: 'text-sky-400' },
                  ].map(({ label, value, color }) => (
                    <span key={label} className={`font-semibold ${color}`}>
                      {label} {value}
                    </span>
                  ))}
                </div>
              )}

              {/* Coaching note */}
              {!isUser && t.turn?.coaching && t.turn.score.confidence > 0 && (
                <p className="text-xs text-slate-500 italic mt-1 max-w-xs">{t.turn.coaching}</p>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start">
            <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-slate-400">
              <span className="inline-flex gap-1">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>·</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>·</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>·</span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-6 py-4 border-t border-slate-800 bg-slate-950">
        {micError && <p className="text-xs text-amber-400 mb-2">{micError}</p>}
        {isSpeaking && <p className="text-xs text-violet-400 mb-2">AI is speaking…</p>}

        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              value={isListening ? (input + (interimTranscript ? ' ' + interimTranscript : '')) : input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={isListening ? 'Listening…' : 'Type your message or use the mic…'}
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {isSupported && (
            <button
              onClick={handleMicToggle}
              className={cn(
                'p-3 rounded-xl border transition-all',
                isListening
                  ? 'border-red-500 bg-red-900/30 text-red-400 recording-pulse'
                  : 'border-slate-700 text-slate-400 hover:border-violet-500 hover:text-violet-400'
              )}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}

          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="p-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-2 text-center">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
