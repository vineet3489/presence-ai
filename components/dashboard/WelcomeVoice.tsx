'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Volume2, VolumeX, X, Sparkles } from 'lucide-react';
import { speak } from '@/hooks/useTranscription';

interface WelcomeVoiceProps {
  userEmail: string;
  presenceScore: number;
  sessionCount: number;
  streak: number;
}

function buildGreeting(email: string, score: number, sessions: number, streak: number): string {
  const firstName = email.split('@')[0].split('.')[0];
  const name = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  if (sessions === 0) {
    return `Hey ${name}, welcome to PresenceAI! Start with the Face Scan to get your first appearance score — it takes 30 seconds. Then try a Voice Check. When you're ready, Roleplay lets you practice real conversations with AI. Your 48-hour free trial is running. Let's build something real.`;
  }

  const scoreNote = score > 0 ? `Your presence score is ${score} right now.` : '';
  const streakNote = streak > 1 ? `${streak}-day streak — keep it going.` : '';

  return `Welcome back, ${name}! ${scoreNote} ${streakNote} Today's move: ${
    score < 60
      ? 'run a voice check or face scan to push that score up.'
      : 'try the Roleplay feature — practice a real-world approach and see how you score.'
  } Your coaching is waiting.`.replace(/\s+/g, ' ').trim();
}

export function WelcomeVoice({ userEmail, presenceScore, sessionCount, streak }: WelcomeVoiceProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const fullText = useRef('');
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const startTypewriter = useCallback((text: string) => {
    let i = 0;
    setDisplayText('');
    if (typewriterRef.current) clearInterval(typewriterRef.current);
    typewriterRef.current = setInterval(() => {
      if (!mountedRef.current) return;
      i++;
      setDisplayText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(typewriterRef.current!);
        typewriterRef.current = null;
      }
    }, 22);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const shown = sessionStorage.getItem('welcome_shown');
    if (shown) return;

    const voicePref = localStorage.getItem('presence_voice');
    const isVoiceOn = voicePref !== 'off';
    setVoiceOn(isVoiceOn);

    const text = buildGreeting(userEmail, presenceScore, sessionCount, streak);
    fullText.current = text;

    // Small delay so the dashboard renders first
    const showTimer = setTimeout(() => {
      if (!mountedRef.current) return;
      setVisible(true);
      sessionStorage.setItem('welcome_shown', '1');
      startTypewriter(text);

      if (isVoiceOn) {
        setSpeaking(true);
        setTimeout(() => {
          if (!mountedRef.current) return;
          speak(text, () => {
            if (mountedRef.current) setSpeaking(false);
          });
        }, 400);
      }
    }, 900);

    return () => {
      clearTimeout(showTimer);
      mountedRef.current = false;
      if (typewriterRef.current) clearInterval(typewriterRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleVoice() {
    const newState = !voiceOn;
    setVoiceOn(newState);
    localStorage.setItem('presence_voice', newState ? 'on' : 'off');
    if (!newState) {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
    } else if (fullText.current) {
      setSpeaking(true);
      speak(fullText.current, () => setSpeaking(false));
    }
  }

  function dismiss() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    if (typewriterRef.current) clearInterval(typewriterRef.current);
    setDismissed(true);
  }

  if (!visible || dismissed) return null;

  return (
    <div className="animate-fade-in-up-delay fixed bottom-6 right-6 z-50 w-80 max-w-[calc(100vw-2rem)]">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-violet-700/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            {/* Orb */}
            <div
              className={`w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center shrink-0 ${
                speaking ? 'orb-speaking' : ''
              }`}
            >
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">PresenceAI Coach</p>
              <p className="text-[10px] text-slate-500">
                {speaking ? 'Speaking…' : 'Your daily briefing'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleVoice}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
              title={voiceOn ? 'Mute voice' : 'Enable voice'}
            >
              {voiceOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
            <button
              onClick={dismiss}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Transcript */}
        <div className="px-4 py-3">
          <p className="text-sm text-slate-300 leading-relaxed min-h-[3rem]">
            {displayText}
            {displayText.length < fullText.current.length && (
              <span className="cursor-blink" />
            )}
          </p>
        </div>

        {/* Wave bars — animated when speaking */}
        {speaking && (
          <div className="flex items-end gap-0.5 px-4 pb-3 h-5">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-violet-500/60 rounded-full"
                style={{
                  height: `${30 + Math.sin(i * 0.8) * 50}%`,
                  animation: `shimmer ${0.6 + (i % 5) * 0.1}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.04}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
