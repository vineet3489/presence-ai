'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Volume2, VolumeX, X, Sparkles, Play, Square } from 'lucide-react';
import { speak } from '@/hooks/useTranscription';

interface WelcomeVoiceProps {
  userEmail: string;
  presenceScore: number;
  sessionCount: number;
  streak: number;
}

function buildGreeting(email: string, score: number, sessions: number, streak: number): string {
  const raw = email.split('@')[0].split(/[._-]/)[0];
  const name = raw.charAt(0).toUpperCase() + raw.slice(1);

  if (sessions === 0) {
    return `Hey ${name}, welcome to PresenceAI! Start with the Face Scan to get your baseline score — takes 30 seconds. Then try a Voice Check. Roleplay lets you practice real conversations with AI scoring every message. Your 48-hour free trial has started. Let's go.`;
  }

  const scoreNote = score > 0 ? `Your presence score is ${score} out of 100.` : '';
  const streakNote = streak > 1 ? `You're on a ${streak}-day streak.` : '';
  const action = score > 0 && score < 65
    ? 'Run a voice check or face scan to push that score higher.'
    : 'Try the Roleplay feature — practice a real approach and get scored instantly.';

  return `Welcome back, ${name}! ${scoreNote} ${streakNote} ${action}`.replace(/\s+/g, ' ').trim();
}

export function WelcomeVoice({ userEmail, presenceScore, sessionCount, streak }: WelcomeVoiceProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
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
      if (i >= text.length && typewriterRef.current) {
        clearInterval(typewriterRef.current);
        typewriterRef.current = null;
      }
    }, 20);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const shown = sessionStorage.getItem('welcome_shown_v2');
    if (shown) return;

    const text = buildGreeting(userEmail, presenceScore, sessionCount, streak);
    fullText.current = text;

    const timer = setTimeout(() => {
      if (!mountedRef.current) return;
      setVisible(true);
      sessionStorage.setItem('welcome_shown_v2', '1');
      startTypewriter(text);
    }, 700);

    return () => {
      clearTimeout(timer);
      mountedRef.current = false;
      if (typewriterRef.current) clearInterval(typewriterRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Voice requires a user gesture — this fires from a click event
  function handlePlay() {
    if (speaking) {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    setHasPlayed(true);
    // Ensure voices are loaded (important on first call)
    const doSpeak = () => {
      speak(fullText.current, () => {
        if (mountedRef.current) setSpeaking(false);
      });
    };
    if (window.speechSynthesis.getVoices().length > 0) {
      doSpeak();
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', doSpeak, { once: true });
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
    <div className="animate-fade-in-up-delay fixed bottom-6 right-6 z-50 w-[320px] max-w-[calc(100vw-2rem)]">
      <div className="bg-slate-900/98 backdrop-blur-xl border border-violet-700/50 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center shrink-0 ${speaking ? 'orb-speaking' : ''}`}>
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white leading-tight">PresenceAI Coach</p>
              <p className="text-[10px] text-slate-500">
                {speaking ? 'Speaking…' : 'Your daily briefing'}
              </p>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700/70 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Transcript */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-sm text-slate-300 leading-relaxed min-h-[4rem]">
            {displayText}
            {typewriterRef.current !== null && (
              <span className="cursor-blink text-violet-400" />
            )}
          </p>
        </div>

        {/* Wave bars when speaking */}
        {speaking && (
          <div className="flex items-center gap-px px-4 h-5 mb-2">
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-full bg-violet-500/70"
                style={{
                  height: `${25 + Math.abs(Math.sin(i * 1.1)) * 75}%`,
                  animationName: 'voice-wave',
                  animationDuration: `${0.4 + (i % 4) * 0.15}s`,
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                  animationDirection: 'alternate',
                  animationDelay: `${i * 0.03}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Play button */}
        <div className="px-4 pb-3 flex items-center justify-between">
          <button
            onClick={handlePlay}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
              speaking
                ? 'bg-violet-600/30 text-violet-300 border border-violet-600/40'
                : hasPlayed
                ? 'text-slate-500 hover:text-slate-300'
                : 'bg-violet-600/20 text-violet-300 border border-violet-600/30 hover:bg-violet-600/30'
            }`}
          >
            {speaking ? <Square size={11} /> : <Play size={11} />}
            {speaking ? 'Stop' : hasPlayed ? 'Replay' : 'Hear briefing'}
          </button>

          <p className="text-[10px] text-slate-600">
            {!('speechSynthesis' in window) ? 'Voice not supported' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
