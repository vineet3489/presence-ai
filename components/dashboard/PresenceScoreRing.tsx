'use client';

import { useEffect, useState } from 'react';

interface Props {
  score: number;
  label: string;
  color?: string;
  size?: number;
}

export function PresenceScoreRing({ score, label, color = '#8b5cf6', size = 120 }: Props) {
  const [animated, setAnimated] = useState(0);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="rotate-[-90deg] w-full h-full">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={radius} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="score-ring-track"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-white">{score}</span>
          <span className="text-xs text-slate-500">/100</span>
        </div>
      </div>
      <span className="text-sm text-slate-400 font-medium">{label}</span>
    </div>
  );
}

export function CompositeScoreRing({ score }: { score: number }) {
  const [animated, setAnimated] = useState(0);
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 150);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-44 h-44">
        <svg viewBox="0 0 140 140" className="rotate-[-90deg] w-full h-full">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#1e293b" strokeWidth="10" />
          <circle
            cx="70" cy="70" r={radius} fill="none"
            stroke="url(#compGrad)" strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="score-ring-track"
          />
          <defs>
            <linearGradient id="compGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black text-white">{score}</span>
          <span className="text-xs text-slate-400 mt-0.5">Presence Score</span>
        </div>
      </div>
    </div>
  );
}
