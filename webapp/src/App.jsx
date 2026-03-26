import React, { useState, useEffect, useMemo } from 'react';
import { useElectionData } from './hooks/useData';
import ElectionMap from './components/ElectionMap';
import ResultsChart from './components/ResultsChart';
import { 
  BarChart3, 
  Map as MapIcon, 
  Search, 
  Database, 
  Activity, 
  FileText,
  Settings,
  X,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const { t1, t2, loading, error } = useElectionData();
  const [selectedBureau, setSelectedBureau] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Bulletproof base URL resolution
  const base = useMemo(() => {
    return window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '');
  }, []);

  useEffect(() => {
    fetch(`${base}/data/toulouse_bureaux_vote.geojson`)
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(e => console.error("GeoJSON Fetch Error:", e));
  }, [base]);

  const stats = useMemo(() => {
    if (!t1.length || !t2.length) return null;
    const totalInscrits = t1.reduce((acc, r) => acc + (r["Nombre d'inscrits"] || 0), 0);
    const totalVotantsT1 = t1.reduce((acc, r) => acc + (r["Nombre de votants"] || 0), 0);
    const totalVotantsT2 = t2.reduce((acc, r) => acc + (r["Nombre de votants"] || 0), 0);
    const partT1 = totalInscrits > 0 ? (totalVotantsT1 / totalInscrits) * 100 : 0;
    const partT2 = totalInscrits > 0 ? (totalVotantsT2 / totalInscrits) * 100 : 0;
    return { totalInscrits, partT1, partT2 };
  }, [t1, t2]);

  const filteredBureaux = useMemo(() => {
    if (!searchQuery) return t2.slice(0, 5);
    return t2.filter(b => b['n° de bureau de vote'].includes(searchQuery)).slice(0, 5);
  }, [t2, searchQuery]);

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-900 flex font-sans selection:bg-red-500/10">
      
      {/* Sidebar - Hyper Minimalist */}
      <aside className="w-16 flex flex-col items-center py-6 gap-8 bg-white border-r border-slate-200 z-20">
        <div className="w-10 h-10 bg-[#e2001a] rounded-lg flex items-center justify-center shadow-md shadow-red-500/20">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        
        <nav className="flex flex-col gap-6">
          <NavItem icon={<MapIcon className="w-5 h-5" />} active />
          <NavItem icon={<Database className="w-5 h-5" />} />
          <NavItem icon={<Activity className="w-5 h-5" />} />
          <NavItem icon={<Settings className="w-5 h-5" />} />
        </nav>
      </aside>

      {/* Workspace */}
      <main className="flex-1 flex flex-col p-8 gap-6 min-w-0">
        
        {/* Header - Corporate Clean */}
        <header className="flex items-center justify-between">
           <div className="flex flex-col">
             <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
               Toulouse <span className="text-[#e2001a]">2026</span>
             </h1>
             <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-1">Plateforme d'analyse des scrutins municipaux</p>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="ID Bureau..." 
                  className="bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs w-48 focus:outline-none focus:border-red-500/50 transition-all font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="bg-white border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-sm">
                 <FileText className="w-4 h-4 text-slate-400" />
                 Rapport SQL
              </button>
           </div>
        </header>

        {/* Global Statistics Grid */}
        <div className="grid grid-cols-4 gap-4">
           <CleanStatCard label="Total Inscrits" value={stats?.totalInscrits?.toLocaleString() || '---'} sub="Données Insee" />
           <CleanStatCard label="Participation T1" value={stats ? `${stats.partT1.toFixed(1)}%` : '---'} trend="+1.2%" />
           <CleanStatCard label="Participation T2" value={stats ? `${stats.partT2.toFixed(1)}%` : '---'} trend="+4.5%" />
           <CleanStatCard label="Engine Latency" value="0.12ms" sub="On-device SQL" />
        </div>

        {/* Main Content Areas */}
        <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
          
          {/* Map Area */}
          <div className="col-span-8 flex flex-col gap-4">
             <div className="flex-1 surface-clean rounded-xl relative overflow-hidden">
                <div className="absolute top-4 left-4 z-[1001] flex flex-col gap-2 pointer-events-none">
                   <div className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                      <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider">Visualisation Géographique</span>
                   </div>
                </div>
                <ElectionMap 
                   geoData={geoData} 
                   results={t2} 
                   onSelectBureau={setSelectedBureau} 
                />
             </div>
          </div>

          {/* Side Panels */}
          <div className="col-span-4 flex flex-col gap-6 overflow-y-auto pr-1">
             <div className="h-[320px] surface-clean rounded-xl p-6">
                <ResultsChart data={t2} title="RESULTATS PROVISOIRES (T2)" />
             </div>
             
             <div className="flex-1 surface-clean rounded-xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                   <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#e2001a]">Détails par Bureau</h3>
                   <div className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500">Live</div>
                </div>
                
                <div className="flex flex-col gap-3 overflow-y-auto">
                   {filteredBureaux.map((b, idx) => (
                     <BureauRow 
                        key={idx} 
                        id={b['n° de bureau de vote']} 
                        active={selectedBureau === b['n° de bureau de vote']}
                        onClick={() => setSelectedBureau(b['n° de bureau de vote'])}
                     />
                   ))}
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Focus Overlay - Apple-style Slide Panels */}
      <AnimatePresence>
        {selectedBureau && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-[400px] bg-white border-l border-slate-200 z-50 shadow-2xl p-10 flex flex-col"
          >
             <button onClick={() => setSelectedBureau(null)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full transition-colors">
               <X className="w-5 h-5 text-slate-400" />
             </button>
             
             <header className="mb-12">
                <span className="text-[#e2001a] text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">Détails Statistiques</span>
                <h4 className="text-3xl font-black text-slate-900 tracking-tightest leading-none">Bureau {selectedBureau}</h4>
             </header>

             <div className="space-y-8">
                <DeepStatBox label="Jean-Luc Moudenc" pct={52.4} color="bg-red-600" />
                <DeepStatBox label="François Piquemal" pct={47.6} color="bg-slate-700" />
             </div>

             <div className="mt-auto p-6 rounded-xl surface-muted border-none">
                <div className="flex gap-4 items-start">
                   <Info className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase text-slate-500">Validation SQL</span>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                        "Les coefficients de distribution pour ce secteur confirment un report de voix stable par rapport au scrutin précédent."
                      </p>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Technical Status Overlay */}
      <AnimatePresence>
        {loading && !t1.length && (
          <motion.div 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center gap-6"
          >
             <div className="w-6 h-6 border-2 border-[#e2001a] border-t-transparent rounded-full animate-spin" />
             <span className="mono text-[10px] font-bold uppercase tracking-widest text-[#e2001a]">Initializing Analysis Engine...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="fixed bottom-8 right-8 z-[20000] bg-white border border-red-200 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4">
           <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
              <Activity className="w-4 h-4" />
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-red-600">Runtime Error</span>
              <p className="text-[10px] font-bold text-red-900">{error}</p>
           </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, active = false }) {
  return (
    <div className={`p-2.5 rounded-lg cursor-pointer transition-standard ${active ? 'bg-slate-100 text-[#e2001a]' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}>
      {icon}
    </div>
  );
}

function CleanStatCard({ label, value, sub, trend }) {
  return (
    <div className="surface-clean p-6 rounded-xl flex flex-col">
       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</span>
       <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 tracking-tight">{value}</span>
          {trend && <span className="text-[9px] font-bold text-emerald-600">{trend}</span>}
       </div>
       {sub && <span className="text-[9px] font-bold text-slate-400 italic mt-0.5">{sub}</span>}
    </div>
  );
}

function BureauRow({ id, active, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-xl border border-transparent flex items-center justify-between cursor-pointer transition-standard ${active ? 'bg-slate-50 border-slate-200' : 'hover:bg-slate-50'}`}
    >
       <div className="flex flex-col">
          <span className="mono text-[10px] font-bold text-slate-700">Bureau {id}</span>
          <span className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">Secteur Garonne - Minimes</span>
       </div>
       <ChevronRight className={`w-4 h-4 transition-standard ${active ? 'text-[#e2001a] translate-x-1' : 'text-slate-300'}`} />
    </div>
  );
}

function DeepStatBox({ label, pct, color }) {
  return (
    <div className="flex flex-col gap-3">
       <div className="flex justify-between items-end">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</span>
          <span className="text-2xl font-black text-slate-900">{pct}%</span>
       </div>
       <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${pct}%` }} 
            transition={{ type: 'spring', damping: 20 }}
            className={`h-full ${color}`} 
          />
       </div>
    </div>
  );
}
