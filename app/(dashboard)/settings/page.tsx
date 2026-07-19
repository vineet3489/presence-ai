'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [dob, setDob] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [savingBody, setSavingBody] = useState(false);
  const [bodySaved, setBodySaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email ?? '');
    });
    supabase
      .from('user_profiles')
      .select('date_of_birth, place_of_birth, height_cm, weight_kg')
      .single()
      .then(({ data }) => {
        if (data?.date_of_birth) setDob(data.date_of_birth);
        if (data?.place_of_birth) setPlaceOfBirth(data.place_of_birth);
        if (data?.height_cm) setHeightCm(String(data.height_cm));
        if (data?.weight_kg) setWeightKg(String(data.weight_kg));
        setLoading(false);
      });
  }, []);

  async function handleSaveProfile() {
    setSavingProfile(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('user_profiles').update({
      date_of_birth: dob || null,
      place_of_birth: placeOfBirth.trim() || null,
    }).eq('user_id', user.id);
    setSavingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  }

  async function handleSaveBody() {
    setSavingBody(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('user_profiles').update({
      height_cm: heightCm ? parseInt(heightCm, 10) : null,
      weight_kg: weightKg ? parseFloat(weightKg) : null,
    }).eq('user_id', user.id);
    setSavingBody(false);
    setBodySaved(true);
    setTimeout(() => setBodySaved(false), 3000);
  }


  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-black text-white">Settings</h1>

      {/* Account */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Account</p>
        <div>
          <p className="text-xs text-slate-500">Signed in as</p>
          <p className="text-sm text-white font-medium mt-0.5">{email}</p>
        </div>
      </div>

      {/* Identity (for zodiac) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Identity</p>
        <p className="text-xs text-slate-500 -mt-1">Used for zodiac-based personality insights.</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Date of birth</label>
            <input
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Place of birth</label>
            <input
              type="text"
              value={placeOfBirth}
              onChange={e => setPlaceOfBirth(e.target.value)}
              placeholder="e.g. Mumbai"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleSaveProfile}
          disabled={savingProfile}
          className="gap-1.5"
        >
          {savingProfile
            ? <Loader2 size={13} className="animate-spin" />
            : profileSaved
            ? <><Check size={13} /> Saved</>
            : 'Save'}
        </Button>
      </div>

      {/* Body */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Body</p>
        <p className="text-xs text-slate-500 -mt-1">Used for personalised style and outfit recommendations.</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Height (cm)</label>
            <input
              type="number"
              value={heightCm}
              onChange={e => setHeightCm(e.target.value)}
              placeholder="e.g. 175"
              min={100}
              max={250}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Weight (kg)</label>
            <input
              type="number"
              value={weightKg}
              onChange={e => setWeightKg(e.target.value)}
              placeholder="e.g. 70"
              min={30}
              max={300}
              step={0.1}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>
        {heightCm && weightKg && (
          <p className="text-xs text-slate-400">
            BMI: <span className="text-white font-semibold">{(parseFloat(weightKg) / ((parseInt(heightCm, 10) / 100) ** 2)).toFixed(1)}</span>
          </p>
        )}
        <Button
          size="sm"
          onClick={handleSaveBody}
          disabled={savingBody}
          className="gap-1.5"
        >
          {savingBody
            ? <Loader2 size={13} className="animate-spin" />
            : bodySaved
            ? <><Check size={13} /> Saved</>
            : 'Save'}
        </Button>
      </div>

      {/* Subscription — hidden for testing */}
    </div>
  );
}
