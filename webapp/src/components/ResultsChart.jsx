import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { T1_CANDIDATES, T2_CANDIDATES } from '../lib/candidates';

export default function ResultsChart({ data, round, title, selectedQuartier, quartierMap }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Filter by quartier if selected
    let filtered = data;
    if (selectedQuartier && quartierMap) {
      filtered = data.filter(b => quartierMap[b.id] === selectedQuartier);
    }

    const candidateMap = round === 't1' ? T1_CANDIDATES : T2_CANDIDATES;
    const voteTotals = {};

    filtered.forEach(bureau => {
      Object.entries(bureau.candidates).forEach(([shortName, info]) => {
        if (!voteTotals[shortName]) {
          voteTotals[shortName] = { name: shortName, value: 0, color: info.color, party: info.party };
        }
        voteTotals[shortName].value += info.votes;
      });
    });

    return Object.values(voteTotals).sort((a, b) => b.value - a.value);
  }, [data, round, selectedQuartier, quartierMap]);

  const total = chartData.reduce((acc, d) => acc + d.value, 0);

  // For T1, show only top 5 + "Autres"
  const displayData = useMemo(() => {
    if (round === 't1' && chartData.length > 5) {
      const top5 = chartData.slice(0, 5);
      const rest = chartData.slice(5);
      const otherVotes = rest.reduce((acc, d) => acc + d.value, 0);
      return [...top5, { name: 'Autres', value: otherVotes, color: '#94a3b8', party: '' }];
    }
    return chartData;
  }, [chartData, round]);

  return (
    <div className="flex flex-col h-full w-full">
      <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.15em] mb-4 px-1">
        {title}
        {selectedQuartier && <span className="text-[#e2001a] ml-2">• {selectedQuartier}</span>}
      </h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} 
              width={85}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc', radius: 4 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0;
                  return (
                    <div className="bg-white border border-slate-200 px-4 py-3 rounded-lg shadow-xl">
                      <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">{d.name} {d.party && `(${d.party})`}</div>
                      <div className="text-xl font-black text-slate-900">{pct}%</div>
                      <div className="mono text-[9px] text-[#e2001a] mt-1 font-bold">{d.value.toLocaleString()} voix</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18} animationDuration={800}>
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList 
                dataKey="value" 
                position="right" 
                formatter={(v) => total > 0 ? `${((v / total) * 100).toFixed(1)}%` : ''}
                style={{ fontSize: 10, fontWeight: 800, fill: '#334155' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
