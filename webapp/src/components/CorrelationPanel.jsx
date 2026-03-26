import React, { useMemo, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { pearsonR, linearRegression } from '../hooks/useData';

const ANALYSES = [
  {
    id: 'part-piquemal',
    title: 'Participation vs Score Piquemal',
    subtitle: 'T1 — Plus l\'abstention est forte, plus Piquemal score haut',
    xKey: 'participationT1',
    yKey: 'piquemalT1',
    xLabel: 'Participation T1 (%)',
    yLabel: 'Score Piquemal T1 (%)',
    color: '#cc2443',
  },
  {
    id: 'part-moudenc',
    title: 'Participation vs Score Moudenc',
    subtitle: 'T1 — Corrélation positive modérée',
    xKey: 'participationT1',
    yKey: 'moudencT1',
    xLabel: 'Participation T1 (%)',
    yLabel: 'Score Moudenc T1 (%)',
    color: '#e2001a',
  },
  {
    id: 'part-briancon',
    title: 'Participation vs Score Briançon',
    subtitle: 'T1 — Fort lien : forte participation = vote Briançon élevé',
    xKey: 'participationT1',
    yKey: 'brianconT1',
    xLabel: 'Participation T1 (%)',
    yLabel: 'Score Briançon T1 (%)',
    color: '#ff6b6b',
  },
  {
    id: 'moudenc-piquemal',
    title: 'Moudenc vs Piquemal',
    subtitle: 'T1 — Opposition quasi-parfaite (r ≈ -0.87)',
    xKey: 'piquemalT1',
    yKey: 'moudencT1',
    xLabel: 'Score Piquemal T1 (%)',
    yLabel: 'Score Moudenc T1 (%)',
    color: '#e2001a',
  },
  {
    id: 'delta-moudenc',
    title: 'Hausse participation vs Score Moudenc',
    subtitle: 'T2 — Vers où se sont dirigés les nouveaux votants ?',
    xKey: 'participationDelta',
    yKey: 'moudencT2',
    xLabel: 'Hausse participation T1→T2 (pts)',
    yLabel: 'Score Moudenc T2 (%)',
    color: '#e2001a',
  },
  {
    id: 'blancs-briancon',
    title: 'Votes blancs/nuls → Briançon T1',
    subtitle: 'Plus Briançon a scoré au T1, plus les blancs/nuls augmentent au T2',
    xKey: 'brianconT1',
    yKey: 'blancsNulsDelta',
    xLabel: 'Score Briançon T1 (%)',
    yLabel: 'Hausse blancs/nuls T2 (voix)',
    color: '#ff6b6b',
  },
];

function CorrelationScatter({ analysis, data, onSelectBureau }) {
  const { xKey, yKey, xLabel, yLabel, color } = analysis;

  const plotData = useMemo(() => {
    return data
      .filter(b => b[xKey] !== null && b[yKey] !== null && !isNaN(b[xKey]) && !isNaN(b[yKey]))
      .map(b => ({ x: b[xKey], y: b[yKey], id: b.id, quartier: b.quartier }));
  }, [data, xKey, yKey]);

  const stats = useMemo(() => {
    if (plotData.length < 2) return { r: 0, trendLine: [] };
    const xs = plotData.map(d => d.x);
    const ys = plotData.map(d => d.y);
    const r = pearsonR(xs, ys);
    const { slope, intercept } = linearRegression(xs, ys);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    return { r, slope, intercept, minX, maxX };
  }, [plotData]);

  const trendLine = useMemo(() => {
    if (plotData.length < 2) return [];
    return [
      { x: stats.minX, y: stats.slope * stats.minX + stats.intercept },
      { x: stats.maxX, y: stats.slope * stats.maxX + stats.intercept },
    ];
  }, [stats, plotData]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-1 mb-3">
        <div>
          <h4 className="text-sm font-extrabold text-slate-800 tracking-tight">{analysis.title}</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">{analysis.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xl font-black tracking-tight ${Math.abs(stats.r) > 0.5 ? 'text-[#e2001a]' : Math.abs(stats.r) > 0.3 ? 'text-amber-600' : 'text-slate-400'}`}>
            r = {stats.r.toFixed(3)}
          </span>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 5, right: 15, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="x" 
              type="number" 
              name={xLabel}
              tick={{ fontSize: 9, fill: '#94a3b8' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              label={{ value: xLabel, position: 'bottom', offset: 5, style: { fontSize: 9, fill: '#64748b', fontWeight: 600 } }}
            />
            <YAxis 
              dataKey="y" 
              type="number" 
              name={yLabel}
              tick={{ fontSize: 9, fill: '#94a3b8' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 15, style: { fontSize: 9, fill: '#64748b', fontWeight: 600 } }}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload?.length >= 2) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-xl text-xs">
                      <div className="font-black text-slate-900 mb-1">Bureau {d.id}</div>
                      <div className="text-[10px] text-slate-500 mb-1">{d.quartier}</div>
                      <div className="text-slate-600">{xLabel}: <b>{d.x.toFixed(1)}</b></div>
                      <div className="text-slate-600">{yLabel}: <b>{d.y.toFixed(1)}</b></div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter 
              data={plotData} 
              fill={color}
              fillOpacity={0.5}
              r={3}
              onClick={(data) => onSelectBureau && onSelectBureau(data?.id)}
            />
            {trendLine.length === 2 && (
              <ReferenceLine
                segment={[
                  { x: trendLine[0].x, y: trendLine[0].y },
                  { x: trendLine[1].x, y: trendLine[1].y },
                ]}
                stroke={color}
                strokeWidth={2}
                strokeDasharray="6 3"
                opacity={0.7}
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function CorrelationPanel({ merged, onSelectBureau }) {
  const [selectedAnalysis, setSelectedAnalysis] = useState(0);

  if (!merged.length) return <div className="text-center text-slate-400 py-12">Chargement des données...</div>;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Analysis selector tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {ANALYSES.map((a, i) => (
          <button
            key={a.id}
            onClick={() => setSelectedAnalysis(i)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all
              ${i === selectedAnalysis 
                ? 'bg-[#e2001a] text-white shadow-md shadow-red-500/20' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {a.title}
          </button>
        ))}
      </div>
      
      {/* Active chart */}
      <div className="flex-1 min-h-0">
        <CorrelationScatter 
          analysis={ANALYSES[selectedAnalysis]} 
          data={merged} 
          onSelectBureau={onSelectBureau}
        />
      </div>

      {/* Interpretation */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Interprétation</div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {selectedAnalysis === 0 && "Corrélation négative (r ≈ -0.47) : les bureaux à forte abstention votent davantage Piquemal. Cela reflète un électorat de gauche plus concentré dans les quartiers populaires à faible participation."}
          {selectedAnalysis === 1 && "Corrélation positive modérée (r ≈ 0.36) : Moudenc performe mieux dans les bureaux à forte participation, typiquement les quartiers résidentiels aisés."}
          {selectedAnalysis === 2 && "Corrélation la plus forte (r ≈ 0.57) : Briançon est le candidat le plus porté par la mobilisation. Son électorat se déplace massivement quand il se mobilise."}
          {selectedAnalysis === 3 && "Anti-corrélation quasi-parfaite (r ≈ -0.87) : Moudenc et Piquemal se disputent essentiellement le même terrain électoral. Là où l'un progresse, l'autre recule."}
          {selectedAnalysis === 4 && "Corrélation faible (r ≈ 0.14) : la hausse de participation au T2 ne bénéficie pas clairement à l'un des deux candidats. Les nouveaux votants se répartissent de manière dispersée."}
          {selectedAnalysis === 5 && "Corrélation notable (r ≈ 0.55) : dans les bureaux où Briançon a fait un bon score au T1, on observe une hausse plus marquée des votes blancs/nuls au T2, suggérant un refus partiel du choix T2."}
        </p>
      </div>
    </div>
  );
}
