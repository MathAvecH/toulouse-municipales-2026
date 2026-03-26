import React, { useMemo } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';

export default function QuartierSelector({ quartierMap, selected, onSelect, results }) {
  const quartiers = useMemo(() => {
    if (!quartierMap || !results.length) return [];
    
    const qMap = {};
    results.forEach(b => {
      const q = quartierMap[b.id];
      if (!q) return;
      if (!qMap[q]) qMap[q] = { name: q, bureaux: 0, totalInscrits: 0, totalVotants: 0 };
      qMap[q].bureaux++;
      qMap[q].totalInscrits += b.inscrits || 0;
      qMap[q].totalVotants += b.votants || 0;
    });

    return Object.values(qMap)
      .map(q => ({
        ...q,
        participation: q.totalInscrits > 0 ? (q.totalVotants / q.totalInscrits) * 100 : 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }, [quartierMap, results]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">Filtrer par quartier</span>
        {selected && (
          <button
            onClick={() => onSelect(null)}
            className="text-[10px] font-bold text-[#e2001a] hover:underline"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-1">
        {quartiers.map(q => (
          <button
            key={q.name}
            onClick={() => onSelect(q.name === selected ? null : q.name)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-xs
              ${q.name === selected 
                ? 'bg-[#e2001a]/10 border border-[#e2001a]/30 text-[#e2001a]' 
                : 'hover:bg-slate-50 border border-transparent'}`}
          >
            <MapPin className={`w-3.5 h-3.5 shrink-0 ${q.name === selected ? 'text-[#e2001a]' : 'text-slate-400'}`} />
            <div className="flex-1 min-w-0">
              <div className={`font-bold truncate ${q.name === selected ? 'text-[#e2001a]' : 'text-slate-700'}`}>
                {q.name}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {q.bureaux} bureaux · Participation {q.participation.toFixed(1)}%
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
