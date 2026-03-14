'use client';

import { useState } from 'react';
import { DatePrepWizard } from '@/components/quiz/DatePrepWizard';
import { DateCoachingResults } from '@/components/quiz/DateCoachingResults';
import { Button } from '@/components/ui/button';
import { RotateCcw, Loader2, Shirt, CheckSquare, Heart, CheckCircle2 } from 'lucide-react';
import type { DatePrepData, DatePrepResult, OutfitBuilderData, OutfitBuilderResult, PreDateChecklistData, PreDateChecklistResult } from '@/types';

type Tab = 'plan' | 'outfit' | 'checklist';

export default function DatePrepPage() {
  const [activeTab, setActiveTab] = useState<Tab>('plan');

  // Date Plan state
  const [planResult, setPlanResult] = useState<DatePrepResult | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState('');

  // Outfit Builder state
  const [outfitResult, setOutfitResult] = useState<OutfitBuilderResult | null>(null);
  const [outfitLoading, setOutfitLoading] = useState(false);
  const [outfitError, setOutfitError] = useState('');
  const [outfitForm, setOutfitForm] = useState<OutfitBuilderData>({
    venue: '', vibe: 'smart-casual', timeOfDay: 'evening', impression: '',
  });

  // Checklist state
  const [checklistResult, setChecklistResult] = useState<PreDateChecklistResult | null>(null);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [checklistError, setChecklistError] = useState('');
  const [checklistForm, setChecklistForm] = useState<PreDateChecklistData>({
    where: '', when: '', about: '', nervousAbout: '',
  });

  async function handlePlanSubmit(data: DatePrepData) {
    setPlanLoading(true);
    setPlanError('');
    try {
      const res = await fetch('/api/date-coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to generate plan');
      setPlanResult(json.result);
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setPlanLoading(false);
    }
  }

  async function handleOutfitSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOutfitLoading(true);
    setOutfitError('');
    try {
      const res = await fetch('/api/outfit-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outfitForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to generate outfits');
      setOutfitResult(json.result);
    } catch (err) {
      setOutfitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setOutfitLoading(false);
    }
  }

  async function handleChecklistSubmit(e: React.FormEvent) {
    e.preventDefault();
    setChecklistLoading(true);
    setChecklistError('');
    try {
      const res = await fetch('/api/pre-date-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checklistForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to generate checklist');
      setChecklistResult(json.result);
    } catch (err) {
      setChecklistError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setChecklistLoading(false);
    }
  }

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'plan', label: 'Date Plan', icon: Heart },
    { id: 'outfit', label: 'Outfit Builder', icon: Shirt },
    { id: 'checklist', label: 'Night Before', icon: CheckSquare },
  ];

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">Date Prep</h1>
        <p className="text-slate-400 mt-1">Everything you need to show up as your best self</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 rounded-xl p-1 mb-8">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === id
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Date Plan tab */}
      {activeTab === 'plan' && (
        <div className="space-y-4">
          {planResult ? (
            <>
              <DateCoachingResults result={planResult} />
              <Button variant="outline" onClick={() => { setPlanResult(null); setPlanError(''); }} className="w-full gap-2">
                <RotateCcw size={16} /> Prep for Another Date
              </Button>
            </>
          ) : (
            <>
              <DatePrepWizard onSubmit={handlePlanSubmit} loading={planLoading} />
              {planError && <p className="text-sm text-red-400 bg-red-900/20 rounded-lg px-4 py-3">{planError}</p>}
            </>
          )}
        </div>
      )}

      {/* Outfit Builder tab */}
      {activeTab === 'outfit' && (
        <div>
          {outfitResult ? (
            <div className="space-y-5">
              <p className="text-slate-400 text-sm italic">{outfitResult.stylistNote}</p>
              {outfitResult.outfits.map((outfit, i) => (
                <div key={i} className="border border-slate-700 rounded-2xl p-5 bg-slate-900">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-white">{outfit.name}</h3>
                    <span className="text-xs text-slate-500 bg-slate-800 rounded-full px-2 py-0.5">Option {i + 1}</span>
                  </div>
                  <p className="text-slate-300 text-sm mb-3">{outfit.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {outfit.colorPalette.map((c) => (
                      <span key={c} className="text-xs bg-slate-800 text-slate-400 rounded-full px-2.5 py-0.5">{c}</span>
                    ))}
                  </div>
                  <p className="text-xs text-violet-300 mb-1">{outfit.whyItWorks}</p>
                  <p className="text-xs text-slate-500">+ {outfit.accessories}</p>
                </div>
              ))}
              <Button variant="outline" onClick={() => setOutfitResult(null)} className="w-full gap-2">
                <RotateCcw size={16} /> Try Different Occasion
              </Button>
            </div>
          ) : (
            <form onSubmit={handleOutfitSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Where are you going?</label>
                <input
                  value={outfitForm.venue}
                  onChange={(e) => setOutfitForm({ ...outfitForm, venue: e.target.value })}
                  placeholder="e.g. rooftop bar in Bandra, first coffee date, house party"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5">What vibe are you going for?</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['casual', 'smart-casual', 'formal', 'adventurous'] as const).map((v) => (
                    <button
                      key={v} type="button"
                      onClick={() => setOutfitForm({ ...outfitForm, vibe: v })}
                      className={`py-2.5 rounded-xl border text-sm capitalize transition-all ${
                        outfitForm.vibe === v
                          ? 'border-violet-500 bg-violet-900/30 text-white'
                          : 'border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Time of day</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['morning', 'afternoon', 'evening', 'night'] as const).map((t) => (
                    <button
                      key={t} type="button"
                      onClick={() => setOutfitForm({ ...outfitForm, timeOfDay: t })}
                      className={`py-2.5 rounded-xl border text-sm capitalize transition-all ${
                        outfitForm.timeOfDay === t
                          ? 'border-violet-500 bg-violet-900/30 text-white'
                          : 'border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5">What impression do you want to make?</label>
                <input
                  value={outfitForm.impression}
                  onChange={(e) => setOutfitForm({ ...outfitForm, impression: e.target.value })}
                  placeholder="e.g. effortlessly stylish, confident but approachable, mysterious"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              {outfitError && <p className="text-sm text-red-400 bg-red-900/20 rounded-lg px-4 py-3">{outfitError}</p>}

              <Button type="submit" disabled={outfitLoading} className="w-full">
                {outfitLoading ? <><Loader2 size={16} className="animate-spin mr-2" /> Building outfits…</> : 'Build my outfits →'}
              </Button>
            </form>
          )}
        </div>
      )}

      {/* Night Before Checklist tab */}
      {activeTab === 'checklist' && (
        <div>
          {checklistResult ? (
            <div className="space-y-5">
              <div className="border border-slate-700 rounded-2xl p-5 bg-slate-900">
                <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-2">What to Wear</h3>
                <p className="text-white text-sm">{checklistResult.whatToWear}</p>
              </div>

              <div className="border border-slate-700 rounded-2xl p-5 bg-slate-900">
                <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-3">3 Conversation Hooks</h3>
                <ul className="space-y-2">
                  {checklistResult.conversationHooks.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-violet-400 font-bold shrink-0">{i + 1}.</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-slate-700 rounded-2xl p-5 bg-slate-900">
                <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-2">Breathing Reset (2 min)</h3>
                <p className="text-slate-300 text-sm">{checklistResult.breathingExercise}</p>
              </div>

              <div className="border border-violet-700/40 rounded-2xl p-5 bg-violet-900/20">
                <h3 className="text-xs uppercase tracking-wide text-violet-400 mb-2">Your Confidence Anchor</h3>
                <p className="text-white text-sm italic">"{checklistResult.confidenceAnchor}"</p>
              </div>

              <div className="border border-slate-700 rounded-2xl p-5 bg-slate-900">
                <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-3">Last-Minute Tips</h3>
                <ul className="space-y-2">
                  {checklistResult.lastMinuteTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 size={14} className="text-green-400 shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <Button variant="outline" onClick={() => setChecklistResult(null)} className="w-full gap-2">
                <RotateCcw size={16} /> New Checklist
              </Button>
            </div>
          ) : (
            <form onSubmit={handleChecklistSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Where is the date?</label>
                <input
                  value={checklistForm.where}
                  onChange={(e) => setChecklistForm({ ...checklistForm, where: e.target.value })}
                  placeholder="e.g. dinner at a restaurant in Colaba"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5">When is it?</label>
                <input
                  value={checklistForm.when}
                  onChange={(e) => setChecklistForm({ ...checklistForm, when: e.target.value })}
                  placeholder="e.g. tomorrow evening at 7pm"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Tell me about who you're meeting</label>
                <textarea
                  value={checklistForm.about}
                  onChange={(e) => setChecklistForm({ ...checklistForm, about: e.target.value })}
                  placeholder="Their interests, vibe, how you met, what they're into…"
                  rows={3}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5">What are you most nervous about?</label>
                <input
                  value={checklistForm.nervousAbout}
                  onChange={(e) => setChecklistForm({ ...checklistForm, nervousAbout: e.target.value })}
                  placeholder="e.g. awkward silences, coming across too eager, what to say first"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              {checklistError && <p className="text-sm text-red-400 bg-red-900/20 rounded-lg px-4 py-3">{checklistError}</p>}

              <Button type="submit" disabled={checklistLoading} className="w-full">
                {checklistLoading ? <><Loader2 size={16} className="animate-spin mr-2" /> Building your ritual…</> : 'Build my night-before ritual →'}
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
