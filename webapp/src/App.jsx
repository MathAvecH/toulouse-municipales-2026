import React, { useState, useEffect, useMemo } from 'react';
import { useElectionData, useQuartierData, useMergedData, useGlobalStats } from './hooks/useData';
import ElectionMap from './components/ElectionMap';
import ResultsChart from './components/ResultsChart';
import CorrelationPanel from './components/CorrelationPanel';
import ParticipationChart from './components/ParticipationChart';
import QuartierSelector from './components/QuartierSelector';
import BureauDetail from './components/BureauDetail';
import DataTable from './components/DataTable';
import { 
  Map as MapIcon, 
  BarChart3,
  TrendingUp,
  TableProperties,
  Search,
  Activity,
  X,
  Users,
  Vote,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
  { id: 'carte', label: 'Carte', icon: MapIcon },
  { id: 'analyses', label: 'Analyses', icon: TrendingUp },
  { id: 'donnees', label: 'Données', icon: TableProperties },
];

const COLOR_MODES = [
  { id: 'result', label: 'Résultat T2' },
  { id: 'participation', label: 'Participation' },
  { id: 'swing', label: 'Δ Participation' },
];

export default function App() {
  const { t1, t2, loading, error } = useElectionData();
  const quartierMap = useQuartierData();
  const [selectedBureau, setSelectedBureau] = useState(null);
  const [selectedQuartier, setSelectedQuartier] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [activeTab, setActiveTab] = useState('carte');
  const [colorMode, setColorMode] = useState('result');

  const merged = useMergedData(t1, t2, quartierMap);
  const stats = useGlobalStats(t1, t2, merged);

  const base = useMemo(() => {
    return window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '');
  }, []);

  useEffect(() => {
    fetch(`${base}/data/toulouse_bureaux_vote.geojson`)
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(e => console.error("GeoJSON Fetch Error:", e));
  }, [base]);

  // Filtered results based on quartier
  const filteredT1 = useMemo(() => {
    if (!selectedQuartier || !quartierMap) return t1;
    return t1.filter(b => quartierMap[b.id] === selectedQuartier);
  }, [t1, selectedQuartier, quartierMap]);

  const filteredT2 = useMemo(() => {
    if (!selectedQuartier || !quartierMap) return t2;
    return t2.filter(b => quartierMap[b.id] === selectedQuartier);
  }, [t2, selectedQuartier, quartierMap]);

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-900 flex font-sans selection:bg-red-500/10">
      
      {/* Sidebar */}
      <aside className="w-[260px] flex flex-col bg-white border-r border-slate-200 z-20 shrink-0">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#e2001a] rounded-lg flex items-center justify-center shadow-md shadow-red-500/20">
              <BarChart3 className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-900">
                Toulouse <span className="text-[#e2001a]">2026</span>
              </h1>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Observatoire Électoral</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="px-3 py-4 border-b border-slate-100">
          <div className="flex flex-col gap-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all w-full text-left
                    ${activeTab === tab.id 
                      ? 'bg-[#e2001a]/10 text-[#e2001a]' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Quartier Selector */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <QuartierSelector 
            quartierMap={quartierMap}
            selected={selectedQuartier}
            onSelect={setSelectedQuartier}
            results={t2}
          />
        </div>

        {/* Tech footer */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">DuckDB-WASM · In-Browser SQL</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Stats Bar */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-slate-200 bg-white">
          <StatPill label="Bureaux" value={stats?.totalBureaux || '—'} icon={<Layers className="w-3.5 h-3.5" />} />
          <StatPill label="Inscrits" value={stats?.totalInscrits?.toLocaleString() || '—'} icon={<Users className="w-3.5 h-3.5" />} />
          <StatPill label="Part. T1" value={stats ? `${stats.partT1.toFixed(1)}%` : '—'} />
          <StatPill label="Part. T2" value={stats ? `${stats.partT2.toFixed(1)}%` : '—'} trend={stats ? `+${stats.partDelta.toFixed(1)}pts` : null} />
          <div className="flex-1" />
          <StatPill label="Moudenc T2" value={stats ? `${stats.pctMoudenc.toFixed(1)}%` : '—'} sub={stats ? `${stats.bureauxMoudenc} bur.` : ''} color="text-[#e2001a]" />
          <StatPill label="Piquemal T2" value={stats ? `${stats.pctPiquemal.toFixed(1)}%` : '—'} sub={stats ? `${stats.bureauxPiquemal} bur.` : ''} color="text-[#cc2443]" />
        </header>

        {/* Tab Content */}
        <div className="flex-1 min-h-0 relative">
          {/* Carte Tab */}
          {activeTab === 'carte' && (
            <div className="h-full flex">
              {/* Map */}
              <div className="flex-1 relative">
                {/* Color mode selector overlay */}
                <div className="absolute top-4 left-4 z-[1001] flex gap-1.5 bg-white/95 backdrop-blur-sm rounded-lg border border-slate-200 p-1 shadow-sm">
                  {COLOR_MODES.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setColorMode(m.id)}
                      className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all
                        ${colorMode === m.id 
                          ? 'bg-[#e2001a] text-white shadow-sm' 
                          : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <ElectionMap 
                  geoData={geoData} 
                  results={merged.length ? merged : t2} 
                  onSelectBureau={setSelectedBureau}
                  selectedBureau={selectedBureau}
                  quartierMap={quartierMap}
                  selectedQuartier={selectedQuartier}
                  colorMode={colorMode}
                />
              </div>
              
              {/* Side Charts */}
              <div className="w-[340px] border-l border-slate-200 bg-white flex flex-col overflow-y-auto">
                <div className="h-[280px] p-4 border-b border-slate-100 shrink-0">
                  <ResultsChart data={filteredT2} round="t2" title="2nd Tour" selectedQuartier={selectedQuartier} quartierMap={quartierMap} />
                </div>
                <div className="h-[320px] p-4 shrink-0">
                  <ResultsChart data={filteredT1} round="t1" title="1er Tour" selectedQuartier={selectedQuartier} quartierMap={quartierMap} />
                </div>
              </div>
            </div>
          )}

          {/* Analyses Tab */}
          {activeTab === 'analyses' && (
            <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto">
              {/* Correlation Charts */}
              <div className="surface-clean rounded-xl p-6 min-h-[450px]">
                <CorrelationPanel merged={merged} onSelectBureau={setSelectedBureau} />
              </div>
              
              {/* Participation Evolution */}
              <div className="surface-clean rounded-xl p-6 h-[380px]">
                <ParticipationChart merged={merged} />
              </div>
            </div>
          )}

          {/* Données Tab */}
          {activeTab === 'donnees' && (
            <div className="h-full p-6">
              <DataTable merged={merged} onSelectBureau={setSelectedBureau} selectedQuartier={selectedQuartier} />
            </div>
          )}
        </div>
      </main>

      {/* Bureau Detail Overlay */}
      <AnimatePresence>
        {selectedBureau && (
          <BureauDetail 
            bureau={selectedBureau} 
            merged={merged} 
            onClose={() => setSelectedBureau(null)} 
          />
        )}
      </AnimatePresence>

      {/* Loading Screen */}
      <AnimatePresence>
        {loading && !t1.length && (
          <motion.div 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center gap-6"
          >
            <div className="w-10 h-10 bg-[#e2001a] rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-[#e2001a] border-t-transparent rounded-full animate-spin" />
              <span className="mono text-[10px] font-bold uppercase tracking-widest text-[#e2001a]">Initialisation du moteur d'analyse...</span>
              <span className="text-[10px] text-slate-400 font-medium">DuckDB-WASM · Chargement des données Parquet</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-6 right-6 z-[20000] bg-white border border-red-200 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 max-w-md">
          <Activity className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <span className="text-[10px] font-black uppercase text-red-600">Erreur</span>
            <p className="text-[11px] font-bold text-red-900 mt-0.5">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value, icon, trend, sub, color }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
      {icon && <div className="text-slate-400">{icon}</div>}
      <div className="flex flex-col">
        <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className={`text-sm font-black tracking-tight ${color || 'text-slate-900'}`}>{value}</span>
          {trend && <span className="text-[9px] font-bold text-emerald-600">{trend}</span>}
          {sub && <span className="text-[9px] font-bold text-slate-400">{sub}</span>}
        </div>
      </div>
    </div>
  );
}
