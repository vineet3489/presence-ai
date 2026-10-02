'use client';

import { useState, useEffect } from 'react';
import { Loader2, RotateCcw, Share2, Layers, Clock, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { ValueHeader } from '@/components/ui/ValueHeader';
import { CameraCapture } from '@/components/camera/CameraCapture';
import { PersonaSelector } from '@/components/perception/PersonaSelector';
import { SimulationResults } from '@/components/perception/SimulationResults';
import { PersonaComparisonView } from '@/components/perception/PersonaComparisonView';
import { BeforeAfterView } from '@/components/perception/BeforeAfterView';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { getPersonaById } from '@/lib/personas';
import { renderShareCard } from '@/lib/shareCard';
import type { PerceptionSimulationResult, ProfileOptimizerResult } from '@/types';

type State = 'idle' | 'analyzing' | 'done' | 'error';

interface HistoryRow {
  id: string;
  persona_id: string;
  swipe_probability: number | null;
  reply_probability: number | null;
  narrative: string | null;
  created_at: string;
}

export default function PerceptionPage() {
  const [state, setState] = useState<State>('idle');
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);
  const [capturedMediaType, setCapturedMediaType] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [bioText, setBioText] = useState('');
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [results, setResults] = useState<{ simulation: PerceptionSimulationResult; optimizer: ProfileOptimizerResult; sessionId: string }[]>([]);
  const [before, setBefore] = useState<{ simulation: PerceptionSimulationResult; sessionId: string } | null>(null);
  const [after, setAfter] = useState<PerceptionSimulationResult | null>(null);
  const [applying, setApplying] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('simulation_results')
      .select('id, persona_id, swipe_probability, reply_probability, narrative, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setHistory((data as HistoryRow[]) ?? []));
  }, [state]);

  function togglePersona(id: string) {
    setSelectedPersonas((prev) => {
      if (comparisonMode) {
        return prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id].slice(0, 3);
      }
      return prev.includes(id) ? [] : [id];
    });
  }

  async function runSimulation(bio: string, personaIds: string[], parentSimulationId?: string) {
    setState('analyzing');
    setErrorMsg('');
    try {
      const responses = await Promise.all(
        personaIds.map((personaId) =>
          fetch('/api/perception-simulation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              photoBase64: capturedBase64,
              mediaType: capturedMediaType,
              bioText: bio,
              personaId,
              parentSimulationId,
            }),
          }).then(async (res) => ({ res, data: await res.json() }))
        )
      );

      const limitHit = responses.find(({ res }) => res.status === 403);
      if (limitHit) {
        setErrorMsg(`You've hit today's free limit (${limitHit.data.limit} simulations). Start a trial for unlimited checks.`);
        setState('error');
        return;
      }

      const failed = responses.find(({ res }) => !res.ok);
      if (failed) throw new Error(failed.data.error || 'Simulation failed');

      const parsed = responses.map(({ data }) => ({
        simulation: data.simulation as PerceptionSimulationResult,
        optimizer: data.optimizer as ProfileOptimizerResult,
        sessionId: data.sessionId as string,
      }));

      setResults(parsed);
      setState('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setState('error');
    }
  }

  function handleCapture(base64: string, mediaType: 'image/jpeg' | 'image/png') {
    setCapturedBase64(base64);
    setCapturedMediaType(mediaType);
  }

  function handleRun() {
    if (!capturedBase64 || selectedPersonas.length === 0) return;
    setBefore(null);
    setAfter(null);
    runSimulation(bioText, selectedPersonas);
  }

  async function handleApplyVariant(text: string, tone: string) {
    if (results.length !== 1) return;
    const current = results[0];
    setApplying(tone);
    try {
      await fetch('/api/perception-simulation/apply-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beforeSimulationId: current.sessionId, suggestionDetail: { variant: tone } }),
      });

      const res = await fetch('/api/perception-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoBase64: capturedBase64,
          mediaType: capturedMediaType,
          bioText: text,
          personaId: current.simulation.personaId,
          parentSimulationId: current.sessionId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Re-simulation failed');

      setBefore({ simulation: current.simulation, sessionId: current.sessionId });
      setAfter(data.simulation as PerceptionSimulationResult);
      setBioText(text);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setApplying(null);
    }
  }

  async function handleShare() {
    setSharing(true);
    try {
      const best = results.slice().sort((a, b) => b.simulation.swipeProbability - a.simulation.swipeProbability)[0];
      const simForCard = after ?? best?.simulation;
      if (!simForCard) return;

      const personaId = before?.simulation.personaId ?? simForCard.personaId;
      const persona = getPersonaById(personaId);

      const blob = await renderShareCard({
        personaLabel: persona?.label ?? 'A real persona',
        narrative: simForCard.narrative,
        photoBase64: capturedBase64,
        photoMediaType: capturedMediaType,
        swipeAfter: simForCard.swipeProbability,
        replyAfter: simForCard.replyProbability,
        swipeBefore: before ? before.simulation.swipeProbability : null,
        replyBefore: before ? before.simulation.replyProbability : null,
      });

      const file = new File([blob], 'presence-check.png', { type: 'image/png' });
      const shareText = 'My PresenceAI Perception Check — mypresence.in';

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'My Perception Check', text: shareText }).catch(() => null);
      } else if (navigator.share) {
        await navigator.share({ title: 'My Perception Check', text: shareText }).catch(() => null);
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'presence-check.png';
        a.click();
        URL.revokeObjectURL(url);
        alert('Image saved — share it anywhere!');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not generate share card');
    } finally {
      setSharing(false);
    }
  }

  function reset() {
    setState('idle');
    setCapturedBase64(null);
    setBioText('');
    setSelectedPersonas([]);
    setComparisonMode(false);
    setResults([]);
    setBefore(null);
    setAfter(null);
    setErrorMsg('');
  }

  const canRun = !!capturedBase64 && selectedPersonas.length > 0;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <ValueHeader
        icon={Eye}
        title="Perception Check"
        promise="Know if they'd swipe right — before you post."
        gets={['Your swipe & reply odds', 'The #1 fix to make now', '3 ready-to-paste bios']}
      />

      {state === 'done' && results.length > 0 ? (
        <div className="space-y-6">
          {after && before ? (
            <>
              <BeforeAfterView before={before.simulation} after={after} />
              <SimulationResults simulation={after} optimizer={results[0].optimizer} />
            </>
          ) : results.length > 1 ? (
            <PersonaComparisonView results={results.map((r) => r.simulation)} />
          ) : (
            <SimulationResults
              simulation={results[0].simulation}
              optimizer={results[0].optimizer}
              onApplyVariant={handleApplyVariant}
              applying={applying}
            />
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleShare} disabled={sharing} className="flex-1 gap-2">
              {sharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />} Share
            </Button>
            <Button variant="outline" onClick={reset} className="flex-1 gap-2">
              <RotateCcw size={14} /> New Check
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <CameraCapture onCapture={handleCapture} />

          <div>
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2 block">Your bio</label>
            <textarea
              value={bioText}
              onChange={(e) => setBioText(e.target.value.slice(0, 500))}
              placeholder="Paste your dating app bio here..."
              rows={4}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 resize-none"
            />
            <p className="text-[10px] text-slate-600 mt-1 text-right">{bioText.length}/500</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Who&apos;s swiping?</label>
              <button
                onClick={() => { setComparisonMode((c) => !c); setSelectedPersonas([]); }}
                className={`flex items-center gap-1.5 text-xs rounded-full px-3 py-1 border transition-colors ${
                  comparisonMode ? 'border-violet-500 bg-violet-900/30 text-violet-300' : 'border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                <Layers size={11} /> Compare personas
              </button>
            </div>
            <PersonaSelector selected={selectedPersonas} onToggle={togglePersona} multiSelect={comparisonMode} />
          </div>

          {state === 'analyzing' && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 size={28} className="animate-spin text-violet-400" />
              <p className="text-sm text-slate-400">Simulating first impressions...</p>
            </div>
          )}

          {state === 'error' && (
            <div className="rounded-xl bg-red-900/20 border border-red-800/30 px-4 py-3">
              <p className="text-sm text-red-400">{errorMsg}</p>
            </div>
          )}

          <Button onClick={handleRun} disabled={!canRun || state === 'analyzing'} className="w-full" size="lg">
            {state === 'analyzing' ? <Loader2 size={16} className="animate-spin" /> : 'Run Perception Check'}
          </Button>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-10">
          <button
            onClick={() => setShowHistory((h) => !h)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
          >
            <Clock size={15} /> Past checks ({history.length})
            {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showHistory && (
            <div className="space-y-2">
              {history.map((h) => {
                const persona = getPersonaById(h.persona_id);
                return (
                  <div key={h.id} className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white font-medium">{persona?.label ?? h.persona_id}</p>
                      <p className="text-xs text-slate-500">{new Date(h.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      Swipe {Math.round(h.swipe_probability ?? 0)}% · Reply {Math.round(h.reply_probability ?? 0)}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
