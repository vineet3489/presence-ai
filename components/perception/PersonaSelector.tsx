'use client';

import { PERSONAS } from '@/lib/personas';

interface Props {
  selected: string[];
  onToggle: (personaId: string) => void;
  multiSelect?: boolean;
}

export function PersonaSelector({ selected, onToggle, multiSelect = false }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {PERSONAS.map((persona) => {
        const isSelected = selected.includes(persona.id);
        return (
          <button
            key={persona.id}
            onClick={() => onToggle(persona.id)}
            className={`text-left rounded-xl border px-4 py-3 transition-all ${
              isSelected
                ? 'border-violet-500 bg-violet-900/30 text-white'
                : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
            }`}
          >
            <div className="font-semibold text-sm">{persona.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{persona.demographic}</div>
          </button>
        );
      })}
      {multiSelect && (
        <p className="col-span-2 text-xs text-slate-600 mt-1">Pick 2-3 personas to compare side by side.</p>
      )}
    </div>
  );
}
