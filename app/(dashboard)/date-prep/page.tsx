'use client';

import { useState } from 'react';
import { DatePrepWizard } from '@/components/quiz/DatePrepWizard';
import { DateCoachingResults } from '@/components/quiz/DateCoachingResults';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import type { DatePrepData, DatePrepResult } from '@/types';

export default function DatePrepPage() {
  const [result, setResult] = useState<DatePrepResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(data: DatePrepData) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/date-coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to generate plan');
      setResult(json.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Date Prep</h1>
        <p className="text-slate-400 mt-1">
          Tell us about you and who you're meeting — get a personalized date strategy
        </p>
      </div>

      {result ? (
        <div className="space-y-6">
          <DateCoachingResults result={result} />
          <Button variant="outline" onClick={() => { setResult(null); setError(''); }} className="w-full gap-2">
            <RotateCcw size={16} /> Prep for Another Date
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <DatePrepWizard onSubmit={handleSubmit} loading={loading} />
          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 rounded-lg px-4 py-3">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
