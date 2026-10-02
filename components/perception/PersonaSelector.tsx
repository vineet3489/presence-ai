'use client';

import { useState } from 'react';
import { PERSONAS, type PersonaGender } from '@/lib/personas';

interface Props {
  selected: string[];
  onToggle: (personaId: string) => void;
  multiSelect?: boolean;
}

const TABS: { id: PersonaGender; label: string }[] = [
  { id: 'women', label: 'Women' },
  { id: 'men', label: 'Men' },
];

export function PersonaSelector({ selected, onToggle, multiSelect = false }: Props) {
  const [tab, setTab] = useState<PersonaGender>('women');
  const visible = PERSONAS.filter((p) => p.gender === tab);

  return (
    <div>
      <div className="flex gap-1.5 mb-3">
        {TABS.map((t) => {
          const count = PERSONAS.filter((p) => p.gender === t.id).length;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-xs font-semibold rounded-full px-3.5 py-1.5 border transition-colors ${
                tab === t.id
                  ? 'border-violet-500 bg-violet-600 text-white'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {t.label} <span className="opacity-60">· {count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {visible.map((persona) => {
          const isSelected = selected.includes(persona.id);
          return (
            <button
              key={persona.id}
              onClick={() => onToggle(persona.id)}
              className={`text-left rounded-xl border px-3 py-2.5 transition-all ${
                isSelected
                  ? 'border-violet-500 bg-violet-900/30 text-white'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
              }`}
            >
              <div className="font-semibold text-sm">{persona.label}</div>
              <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">{persona.demographic}</div>
            </button>
          );
        })}
      </div>

      {multiSelect && (
        <p className="text-xs text-slate-500 mt-2">Pick up to 3 to compare side by side — mix tabs freely.</p>
      )}
    </div>
  );
}
