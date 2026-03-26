import React, { useMemo, useState } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';

export default function DataTable({ merged, onSelectBureau, selectedQuartier }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState('asc');

  const columns = [
    { key: 'id', label: 'Bureau', width: '70px' },
    { key: 'quartier', label: 'Quartier', width: '1fr' },
    { key: 'inscrits', label: 'Inscrits', width: '80px', num: true },
    { key: 'participationT2', label: 'Part. T2', width: '80px', num: true, fmt: v => v?.toFixed(1) + '%' },
    { key: 'participationDelta', label: 'Δ Part.', width: '80px', num: true, fmt: v => v !== null ? (v > 0 ? '+' : '') + v?.toFixed(1) + 'pts' : '—' },
    { key: 'moudencT2', label: 'Moudenc T2', width: '90px', num: true, fmt: v => v?.toFixed(1) + '%' },
    { key: 'piquemalT2', label: 'Piquemal T2', width: '90px', num: true, fmt: v => v?.toFixed(1) + '%' },
    { key: 'moudencT1', label: 'Moudenc T1', width: '90px', num: true, fmt: v => v?.toFixed(1) + '%' },
    { key: 'brianconT1', label: 'Briançon T1', width: '90px', num: true, fmt: v => v?.toFixed(1) + '%' },
  ];

  const filteredData = useMemo(() => {
    let data = merged;
    if (selectedQuartier) {
      data = data.filter(b => b.quartier === selectedQuartier);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(b => 
        b.id.includes(q) || 
        b.quartier?.toLowerCase().includes(q)
      );
    }

    // Sort
    data = [...data].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va === null || va === undefined) return 1;
      if (vb === null || vb === undefined) return -1;
      const cmp = typeof va === 'string' ? va.localeCompare(vb, 'fr') : va - vb;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return data;
  }, [merged, selectedQuartier, searchQuery, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Rechercher un bureau ou quartier..." 
          className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#e2001a]/50 transition-all font-medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="text-[10px] text-slate-400 font-bold px-1">
        {filteredData.length} bureau{filteredData.length > 1 ? 'x' : ''} affiché{filteredData.length > 1 ? 's' : ''}
        {selectedQuartier && <span className="text-[#e2001a]"> · {selectedQuartier}</span>}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-slate-50 z-10">
            <tr>
              {columns.map(col => (
                <th 
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="px-3 py-2.5 text-left text-[9px] font-black uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-900 whitespace-nowrap select-none"
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map(row => (
              <tr 
                key={row.id}
                onClick={() => onSelectBureau(row.id)}
                className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                {columns.map(col => {
                  const val = row[col.key];
                  const display = col.fmt ? col.fmt(val) : (typeof val === 'number' ? val.toLocaleString() : val || '—');
                  return (
                    <td 
                      key={col.key} 
                      className={`px-3 py-2 whitespace-nowrap ${col.num ? 'font-mono font-bold text-slate-700' : 'text-slate-600'} ${
                        col.key === 'id' ? 'font-black text-slate-900' : ''
                      } ${col.key === 'participationDelta' && val !== null ? (val > 0 ? 'text-emerald-600' : 'text-red-600') : ''}`}
                    >
                      {display}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
