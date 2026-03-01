'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

const QUESTIONS = [
  {
    id: 'openness', text: 'I enjoy trying new styles, experiences, and stepping outside my comfort zone.',
    category: 'big_five', trait: 'openness',
    options: [
      { label: 'Strongly agree', value: '5' },
      { label: 'Somewhat agree', value: '4' },
      { label: 'Neutral', value: '3' },
      { label: 'Somewhat disagree', value: '2' },
    ],
  },
  {
    id: 'extraversion', text: 'I feel energized around people and enjoy being the center of attention.',
    category: 'big_five', trait: 'extraversion',
    options: [
      { label: 'Strongly agree', value: '5' },
      { label: 'Somewhat agree', value: '4' },
      { label: 'Neutral', value: '3' },
      { label: 'I prefer smaller settings', value: '2' },
    ],
  },
  {
    id: 'conscientiousness', text: 'I pay close attention to how I present myself in daily life.',
    category: 'big_five', trait: 'conscientiousness',
    options: [
      { label: 'Always — details matter', value: '5' },
      { label: 'Usually yes', value: '4' },
      { label: 'Sometimes', value: '3' },
      { label: 'I keep it casual', value: '2' },
    ],
  },
  {
    id: 'agreeableness', text: 'I naturally make people feel comfortable and at ease.',
    category: 'big_five', trait: 'agreeableness',
    options: [
      { label: 'Yes, that\'s me', value: '5' },
      { label: 'Mostly yes', value: '4' },
      { label: 'Depends on the situation', value: '3' },
      { label: 'I can come off guarded', value: '2' },
    ],
  },
  {
    id: 'neuroticism', text: 'I often feel anxious or self-conscious in social situations.',
    category: 'big_five', trait: 'neuroticism',
    options: [
      { label: 'Rarely — I\'m confident', value: '1' },
      { label: 'Occasionally', value: '2' },
      { label: 'Often', value: '4' },
      { label: 'Very often', value: '5' },
    ],
  },
  {
    id: 'style', text: 'Which style direction resonates most with you?',
    category: 'style',
    options: [
      { label: 'Classic & polished', value: 'classic' },
      { label: 'Smart casual', value: 'smart-casual' },
      { label: 'Streetwear / urban', value: 'streetwear' },
      { label: 'Bold & expressive', value: 'bold' },
    ],
  },
  {
    id: 'goals1', text: 'What matters most to you right now?',
    category: 'goals',
    options: [
      { label: 'Look more professional', value: 'look professional' },
      { label: 'Attract a romantic partner', value: 'attract a partner' },
      { label: 'Feel more confident daily', value: 'feel more confident' },
      { label: 'Make a strong first impression', value: 'make a strong first impression' },
    ],
  },
  {
    id: 'goals2', text: 'What would help you feel most empowered?',
    category: 'goals',
    options: [
      { label: 'Knowing exactly what to wear', value: 'style clarity' },
      { label: 'Speaking with more authority', value: 'speak with authority' },
      { label: 'Better posture and body language', value: 'better body language' },
      { label: 'Being a better conversationalist', value: 'conversational skill' },
    ],
  },
];

type Answers = Record<string, string>;

export function PersonalityQuiz({ userId }: { userId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const question = QUESTIONS[step];
  const totalSteps = QUESTIONS.length;
  const progress = ((step) / totalSteps) * 100;

  function selectAnswer(value: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }

  async function handleNext() {
    if (!answers[question.id]) return;
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
      return;
    }
    // Last step — save profile
    setSaving(true);
    setError('');
    try {
      const bigFive = {
        openness: Number(answers.openness) || 3,
        conscientiousness: Number(answers.conscientiousness) || 3,
        extraversion: Number(answers.extraversion) || 3,
        agreeableness: Number(answers.agreeableness) || 3,
        neuroticism: Number(answers.neuroticism) || 3,
      };
      const goals = [answers.goals1, answers.goals2].filter(Boolean);
      const stylePreference = answers.style || 'smart-casual';

      const supabase = createClient();
      const { error } = await supabase.from('user_profiles').upsert({
        user_id: userId,
        big_five: bigFive,
        style_preference: stylePreference,
        goals,
        onboarding_completed: true,
      });
      if (error) throw error;
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to save. Please try again.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>Question {step + 1} of {totalSteps}</span>
          <span>{Math.round(((step + 1) / totalSteps) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-sky-500 rounded-full transition-all duration-500"
            style={{ width: `${progress + (1 / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-white mb-8 leading-snug">{question.text}</h2>

      <div className="space-y-3 mb-8">
        {question.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => selectAnswer(opt.value)}
            className={`w-full text-left rounded-xl border px-5 py-4 text-sm transition-all ${
              answers[question.id] === opt.value
                ? 'border-violet-500 bg-violet-900/30 text-white'
                : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      <div className="flex gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={saving}>
            <ArrowLeft size={16} />
          </Button>
        )}
        <Button
          className="flex-1"
          onClick={handleNext}
          disabled={!answers[question.id] || saving}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> :
            step === totalSteps - 1 ? 'Finish & go to dashboard' : (
              <>Next <ArrowRight size={16} /></>
            )}
        </Button>
      </div>
    </div>
  );
}
