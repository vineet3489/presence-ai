'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

const CHOICE_STEPS = [
  {
    id: 'vibe',
    emoji: '⚡',
    text: "First things first — what's your energy?",
    subtext: 'Pick the one that feels most you.',
    options: [
      { label: 'The quiet storm', sub: 'Effortless, understated cool', value: 'classic' },
      { label: 'The showstopper', sub: 'Bold, memorable, unapologetic', value: 'bold' },
      { label: 'The smooth one', sub: 'Sharp, intentional, always put-together', value: 'smart-casual' },
      { label: 'The chameleon', sub: 'Adapts, experiments, always evolving', value: 'streetwear' },
    ],
  },
  {
    id: 'social',
    emoji: '🎯',
    text: 'Your natural social move?',
    subtext: 'How people actually experience you.',
    options: [
      { label: 'I make people feel at ease immediately', sub: 'The warm one', value: '5' },
      { label: "I'm the most interesting in the room", sub: 'The magnetic one', value: '4' },
      { label: "I'm the funniest — always", sub: 'The fun one', value: '3' },
      { label: 'I let people come to me', sub: 'The mysterious one', value: '2' },
    ],
  },
  {
    id: 'kryptonite',
    emoji: '😬',
    text: "What's your social kryptonite?",
    subtext: 'Be honest — this is how we fix it.',
    options: [
      { label: 'Going first / breaking the ice', sub: 'Hard to make the first move', value: 'going_first' },
      { label: 'Keeping the conversation going', sub: 'Small talk dries up fast', value: 'sustaining' },
      { label: "Reading if they're into me", sub: "Can't tell what they're thinking", value: 'reading_room' },
      { label: 'Following up after', sub: 'Lose momentum after first contact', value: 'follow_up' },
    ],
  },
  {
    id: 'openness',
    emoji: '🔥',
    text: 'How do you roll with new experiences?',
    subtext: 'Style, people, situations — all of it.',
    options: [
      { label: "I'm down for anything", sub: 'First to try something new', value: '5' },
      { label: 'Open, but on my own terms', sub: 'Selective but curious', value: '4' },
      { label: 'I like what I know', sub: 'Comfort over novelty', value: '3' },
      { label: "Tried it. Didn't need to.", sub: 'Deliberately classic', value: '2' },
    ],
  },
  {
    id: 'goals',
    emoji: '🏆',
    text: "What are you actually here for?",
    subtext: "Pick your main thing — we'll build around it.",
    options: [
      { label: 'Look more put-together', sub: 'Style, grooming, first impressions', value: 'look more put-together' },
      { label: 'Sound more confident', sub: 'Voice, tone, how I come across', value: 'sound more confident' },
      { label: 'Date and attract better', sub: 'Magnetism, connection, keeping interest', value: 'date and connect better' },
      { label: 'Full glow-up', sub: 'All of the above, no shortcuts', value: 'full presence glow-up' },
    ],
  },
];

const INFO_STEP = {
  emoji: '📍',
  text: 'Last one — quick basics.',
  subtext: 'Makes recommendations actually relevant to your life. All optional.',
};

type ChoiceAnswers = Record<string, string>;
type InfoAnswers = { age: string; city: string; occupation: string; education: string };

export function PersonalityQuiz({ userId }: { userId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [choiceAnswers, setChoiceAnswers] = useState<ChoiceAnswers>({});
  const [info, setInfo] = useState<InfoAnswers>({ age: '', city: '', occupation: '', education: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const totalSteps = CHOICE_STEPS.length + 1;
  const isInfoStep = step === CHOICE_STEPS.length;
  const currentChoice = !isInfoStep ? CHOICE_STEPS[step] : null;

  function selectAnswer(value: string) {
    if (!currentChoice) return;
    setChoiceAnswers(prev => ({ ...prev, [currentChoice.id]: value }));
  }

  async function handleNext() {
    if (!isInfoStep) {
      if (!choiceAnswers[currentChoice!.id]) return;
      setStep(s => s + 1);
      return;
    }

    setSaving(true);
    setError('');
    try {
      const extraversion = Number(choiceAnswers.social) || 3;
      const openness = Number(choiceAnswers.openness) || 3;
      const neuroticism = choiceAnswers.kryptonite === 'going_first' ? 4 : 2;

      const bigFive = {
        openness,
        conscientiousness: 3,
        extraversion,
        agreeableness: choiceAnswers.social === '5' ? 5 : 3,
        neuroticism,
      };

      const styleMap: Record<string, string> = {
        classic: 'classic',
        bold: 'bold',
        'smart-casual': 'smart-casual',
        streetwear: 'streetwear',
      };

      const supabase = createClient();
      const { error: saveError } = await supabase.from('user_profiles').upsert({
        user_id: userId,
        big_five: bigFive,
        style_preference: styleMap[choiceAnswers.vibe] || 'smart-casual',
        goals: [choiceAnswers.goals].filter(Boolean),
        age: info.age ? parseInt(info.age, 10) : null,
        city: info.city.trim() || null,
        occupation: info.occupation.trim() || null,
        education: info.education.trim() || null,
        onboarding_completed: true,
        trial_started_at: new Date().toISOString(),
        subscription_status: 'trial',
      });
      if (saveError) throw saveError;
      router.push('/dashboard');
    } catch {
      setError('Failed to save. Please try again.');
      setSaving(false);
    }
  }

  const canProceed = isInfoStep || !!choiceAnswers[currentChoice!.id];
  const currentEmoji = isInfoStep ? INFO_STEP.emoji : currentChoice!.emoji;
  const currentText = isInfoStep ? INFO_STEP.text : currentChoice!.text;
  const currentSubtext = isInfoStep ? INFO_STEP.subtext : currentChoice!.subtext;

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>{step + 1} of {totalSteps}</span>
          <span>{Math.round(((step + 1) / totalSteps) * 100)}%</span>
        </div>
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-sky-500 rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <div className="text-3xl mb-3">{currentEmoji}</div>
        <h2 className="text-xl font-bold text-white leading-snug mb-1">{currentText}</h2>
        <p className="text-sm text-slate-500">{currentSubtext}</p>
      </div>

      {/* Options or info form */}
      {!isInfoStep && currentChoice ? (
        <div className="space-y-3 mb-8">
          {currentChoice.options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => selectAnswer(opt.value)}
              className={`w-full text-left rounded-xl border px-5 py-4 transition-all ${
                choiceAnswers[currentChoice.id] === opt.value
                  ? 'border-violet-500 bg-violet-900/30 text-white'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
              }`}
            >
              <div className="font-medium text-sm">{opt.label}</div>
              {opt.sub && <div className="text-xs text-slate-500 mt-0.5">{opt.sub}</div>}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Age</label>
              <input
                type="number"
                min="13"
                max="99"
                placeholder="e.g. 26"
                value={info.age}
                onChange={e => setInfo(p => ({ ...p, age: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">City</label>
              <input
                type="text"
                placeholder="Mumbai, Delhi…"
                value={info.city}
                onChange={e => setInfo(p => ({ ...p, city: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">What do you do? (for the paycheck)</label>
            <input
              type="text"
              placeholder="Startup founder, engineer, student, freelancer…"
              value={info.occupation}
              onChange={e => setInfo(p => ({ ...p, occupation: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Education</label>
            <select
              value={info.education}
              onChange={e => setInfo(p => ({ ...p, education: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-violet-500"
            >
              <option value="">Prefer not to say</option>
              <option value="high-school">High school</option>
              <option value="bachelors">Bachelor's degree</option>
              <option value="masters">Master's degree</option>
              <option value="phd">PhD / Doctorate</option>
              <option value="self-taught">Self-taught / bootcamp</option>
              <option value="currently-studying">Currently studying</option>
            </select>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      <div className="flex gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={saving}>
            <ArrowLeft size={16} />
          </Button>
        )}
        <Button
          className="flex-1"
          onClick={handleNext}
          disabled={!canProceed || saving}
        >
          {saving
            ? <Loader2 size={16} className="animate-spin" />
            : isInfoStep
              ? "Let's go →"
              : <><span>Next</span> <ArrowRight size={16} /></>
          }
        </Button>
      </div>
    </div>
  );
}
