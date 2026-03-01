'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import type { DatePrepData } from '@/types';

type Step = 1 | 2 | 3;

interface Props {
  onSubmit: (data: DatePrepData) => void;
  loading: boolean;
}

const COMMUNICATION_OPTIONS = [
  'Warm and expressive', 'Reserved and thoughtful', 'Witty and playful',
  'Direct and confident', 'Gentle and attentive',
];

const OCCASION_OPTIONS = ['Coffee date', 'Dinner', 'Drinks / bar', 'Activity / adventure', 'Walk / park'];
const TIME_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Night'];

export function DatePrepWizard({ onSubmit, loading }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<DatePrepData>({
    aboutMe: { communicationStyle: '', nervousAbout: '', pastChallenge: '', personalitySnapshot: '' },
    aboutThem: { interests: '', vibe: '', profession: '', whereYouMet: '' },
    occasion: { type: '', location: '', timeOfDay: '' },
  });

  function updateMe(field: keyof DatePrepData['aboutMe'], value: string) {
    setData((d) => ({ ...d, aboutMe: { ...d.aboutMe, [field]: value } }));
  }
  function updateThem(field: keyof DatePrepData['aboutThem'], value: string) {
    setData((d) => ({ ...d, aboutThem: { ...d.aboutThem, [field]: value } }));
  }
  function updateOccasion(field: keyof DatePrepData['occasion'], value: string) {
    setData((d) => ({ ...d, occasion: { ...d.occasion, [field]: value } }));
  }

  function canProceedStep1() {
    return data.aboutMe.communicationStyle && data.aboutMe.nervousAbout && data.aboutMe.personalitySnapshot;
  }
  function canProceedStep2() {
    return data.aboutThem.interests && data.aboutThem.vibe && data.aboutThem.whereYouMet;
  }
  function canProceedStep3() {
    return data.occasion.type && data.occasion.timeOfDay;
  }

  const steps = [
    { num: 1, label: 'About You' },
    { num: 2, label: 'About Them' },
    { num: 3, label: 'The Date' },
  ];

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step === s.num ? 'bg-violet-600 text-white' :
              step > s.num ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'
            }`}>
              {step > s.num ? '✓' : s.num}
            </div>
            <span className={`text-sm ${step === s.num ? 'text-white' : 'text-slate-500'}`}>{s.label}</span>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-slate-800 mx-1 w-8" />}
          </div>
        ))}
      </div>

      {/* Step 1: About Me */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-slate-300 mb-2">How would you describe your communication style?</label>
            <div className="grid grid-cols-2 gap-2">
              {COMMUNICATION_OPTIONS.map((opt) => (
                <button key={opt} onClick={() => updateMe('communicationStyle', opt)}
                  className={`text-left text-sm px-4 py-3 rounded-lg border transition-all ${
                    data.aboutMe.communicationStyle === opt
                      ? 'border-violet-500 bg-violet-900/30 text-white'
                      : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500'
                  }`}>{opt}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">What are you most nervous about on this date?</label>
            <Input placeholder="e.g. Running out of things to say, awkward silences..."
              value={data.aboutMe.nervousAbout} onChange={(e) => updateMe('nervousAbout', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Describe yourself in 2-3 sentences</label>
            <Textarea placeholder="e.g. I'm a software engineer who loves hiking and cooking. I'm usually quiet at first but open up quickly..."
              value={data.aboutMe.personalitySnapshot} onChange={(e) => updateMe('personalitySnapshot', e.target.value)}
              className="min-h-24" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Past dating challenge (optional)</label>
            <Input placeholder="e.g. I tend to talk too much about work..."
              value={data.aboutMe.pastChallenge} onChange={(e) => updateMe('pastChallenge', e.target.value)} />
          </div>
          <Button className="w-full gap-2" onClick={() => setStep(2)} disabled={!canProceedStep1()}>
            Next — About Them <ArrowRight size={16} />
          </Button>
        </div>
      )}

      {/* Step 2: About Them */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Their interests & hobbies</label>
            <Input placeholder="e.g. Photography, travel, yoga, indie music..."
              value={data.aboutThem.interests} onChange={(e) => updateThem('interests', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Their vibe / personality (as you read them)</label>
            <Input placeholder="e.g. Adventurous and funny, introverted but thoughtful, confident..."
              value={data.aboutThem.vibe} onChange={(e) => updateThem('vibe', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Where did you meet / how do you know them?</label>
            <Input placeholder="e.g. Dating app, through friends, work, gym..."
              value={data.aboutThem.whereYouMet} onChange={(e) => updateThem('whereYouMet', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Their profession (optional)</label>
            <Input placeholder="e.g. Teacher, designer, marketing..."
              value={data.aboutThem.profession} onChange={(e) => updateThem('profession', e.target.value)} />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-1"><ArrowLeft size={16} /></Button>
            <Button className="flex-1 gap-2" onClick={() => setStep(3)} disabled={!canProceedStep2()}>
              Next — The Date <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: The Occasion */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-slate-300 mb-2">What kind of date?</label>
            <div className="grid grid-cols-2 gap-2">
              {OCCASION_OPTIONS.map((opt) => (
                <button key={opt} onClick={() => updateOccasion('type', opt)}
                  className={`text-left text-sm px-4 py-3 rounded-lg border transition-all ${
                    data.occasion.type === opt
                      ? 'border-violet-500 bg-violet-900/30 text-white'
                      : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500'
                  }`}>{opt}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Location / setting (optional)</label>
            <Input placeholder="e.g. Rooftop bar, local café, beach..."
              value={data.occasion.location} onChange={(e) => updateOccasion('location', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Time of day</label>
            <div className="grid grid-cols-4 gap-2">
              {TIME_OPTIONS.map((opt) => (
                <button key={opt} onClick={() => updateOccasion('timeOfDay', opt)}
                  className={`text-sm px-3 py-2.5 rounded-lg border transition-all ${
                    data.occasion.timeOfDay === opt
                      ? 'border-violet-500 bg-violet-900/30 text-white'
                      : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500'
                  }`}>{opt}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)} className="gap-1"><ArrowLeft size={16} /></Button>
            <Button className="flex-1 gap-2" onClick={() => onSubmit(data)}
              disabled={!canProceedStep3() || loading}>
              {loading ? 'Generating your plan...' : 'Get My Date Plan →'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
