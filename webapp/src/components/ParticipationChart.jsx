import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

export default function ParticipationChart({ merged }) {
  const { histogram, outlier, stats } = useMemo(() => {
    if (!merged.length) return { histogram: [], outlier: null, stats: null };

    const deltas = merged
      .filter(b => b.participationDelta !== null)
      .map(b => ({ id: b.id, delta: b.participationDelta, quartier: b.quartier }));

    if (!deltas.length) return { histogram: [], outlier: null, stats: null };

    // Find the outlier bureau 126 (only bureau with negative delta)
    const outlierBureau = deltas.find(d => d.delta < 0) || deltas.reduce((min, d) => d.delta < min.delta ? d : min, deltas[0]);

    // Build histogram bins
    const min = Math.floor(Math.min(...deltas.map(d => d.delta)));
    const max = Math.ceil(Math.max(...deltas.map(d => d.delta)));
    const binSize = 1;
    const bins = [];
    
    for (let i = min; i <= max; i += binSize) {
      const count = deltas.filter(d => d.delta >= i && d.delta < i + binSize).length;
      bins.push({ 
        range: `${i >= 0 ? '+' : ''}${i}`,
        rangeLabel: `${i >= 0 ? '+' : ''}${i} à ${i + binSize >= 0 ? '+' : ''}${i + binSize}`,
        count,
        isNegative: i < 0,
        isOutlier: outlierBureau && outlierBureau.delta >= i && outlierBureau.delta < i + binSize,
      });
    }

    const avgDelta = deltas.reduce((acc, d) => acc + d.delta, 0) / deltas.length;
    const medianDelta = deltas.sort((a, b) => a.delta - b.delta)[Math.floor(deltas.length / 2)].delta;
    
    return {
      histogram: bins,
      outlier: outlierBureau,
      stats: { avg: avgDelta, median: medianDelta, total: deltas.length },
    };
  }, [merged]);

  if (!histogram.length) return null;

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h4 className="text-sm font-extrabold text-slate-800 tracking-tight">Évolution de la participation T1 → T2</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Distribution de la hausse de participation sur les {stats?.total} bureaux</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <span className="text-[9px] text-slate-400 font-bold uppercase">Moyenne</span>
            <div className="text-lg font-black text-emerald-600">+{stats?.avg.toFixed(1)}pts</div>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-400 font-bold uppercase">Médiane</span>
            <div className="text-lg font-black text-slate-700">+{stats?.median.toFixed(1)}pts</div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={histogram} margin={{ top: 10, right: 15, left: 0, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="range" 
              tick={{ fontSize: 9, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              label={{ value: 'Variation de participation (pts)', position: 'bottom', offset: 10, style: { fontSize: 10, fill: '#64748b', fontWeight: 600 } }}
            />
            <YAxis 
              tick={{ fontSize: 9, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              label={{ value: 'Nombre de bureaux', angle: -90, position: 'insideLeft', offset: 15, style: { fontSize: 10, fill: '#64748b', fontWeight: 600 } }}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white border border-slate-200 px-4 py-3 rounded-lg shadow-xl">
                      <div className="text-xs font-bold text-slate-700">{d.rangeLabel} pts</div>
                      <div className="text-lg font-black text-slate-900">{d.count} bureau{d.count > 1 ? 'x' : ''}</div>
                      {d.isOutlier && <div className="text-[10px] text-[#e2001a] font-bold mt-1">⚠ Contient le bureau anomalique</div>}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[3, 3, 0, 0]} barSize={20} animationDuration={800}>
              {histogram.map((entry, index) => (
                <Cell 
                  key={index} 
                  fill={entry.isNegative ? '#ef4444' : entry.isOutlier ? '#f59e0b' : '#10b981'} 
                  opacity={0.85}
                />
              ))}
            </Bar>
            {stats && (
              <ReferenceLine 
                x={`+${Math.round(stats.avg)}`}
                stroke="#e2001a" 
                strokeWidth={2}
                strokeDasharray="6 3"
                label={{ value: `μ = +${stats.avg.toFixed(1)}`, position: 'top', style: { fontSize: 10, fill: '#e2001a', fontWeight: 800 } }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {outlier && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
          <span className="text-amber-500 text-lg">⚠</span>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Bureau anomalique</span>
            <p className="text-xs text-amber-800 mt-1">
              Le bureau <b>n°{outlier.id}</b> ({outlier.quartier}) est le seul à connaître une baisse de participation 
              ({outlier.delta > 0 ? '+' : ''}{outlier.delta.toFixed(1)} pts), à contre-courant de la tendance générale.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
