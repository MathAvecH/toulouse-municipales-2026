import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function ResultsChart({ data, title }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [
      { name: 'Moudenc', value: data.reduce((acc, r) => acc + (r['Nombre de voix de la liste 01'] || 0), 0) },
      { name: 'Piquemal', value: data.reduce((acc, r) => acc + (r['Nombre de voix de la liste 02'] || 0), 0) }
    ].sort((a, b) => b.value - a.value);
  }, [data]);

  const total = chartData.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="flex flex-col h-full w-full p-4 text-slate-100">
      <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-6 px-2">{title}</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e2001a" stopOpacity={1}/>
                <stop offset="100%" stopColor="#b91c1c" stopOpacity={0.9}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
              dy={15}
            />
            <YAxis hide />
            <Tooltip 
              cursor={{ fill: '#f8fafc', radius: 4 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pct = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : 0;
                  return (
                    <div className="bg-white border border-slate-200 px-4 py-3 rounded-lg shadow-xl">
                      <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">{payload[0].name}</div>
                      <div className="text-xl font-black text-slate-900">{pct}%</div>
                      <div className="mono text-[9px] text-[#e2001a] mt-1 font-bold">{payload[0].value.toLocaleString()} voix</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} animationDuration={1000}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.name === 'Moudenc' ? 'url(#redGradient)' : '#334155'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ResultsChart;
