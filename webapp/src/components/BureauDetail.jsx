import React from 'react';
import { X, MapPin, Users, Vote } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BureauDetail({ bureau, merged, onClose }) {
  if (!bureau || !merged) return null;
  
  const data = merged.find(b => b.id === bureau);
  if (!data) return null;

  const t1 = data.t1;
  const t1Candidates = t1 ? Object.values(t1.candidates).sort((a, b) => b.votes - a.votes) : [];
  const t2Candidates = Object.values(data.candidates).sort((a, b) => b.votes - a.votes);

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 h-full w-[420px] bg-white border-l border-slate-200 z-50 shadow-2xl flex flex-col overflow-y-auto"
    >
      {/* Header */}
      <div className="p-6 pb-4 border-b border-slate-100">
        <button onClick={onClose} className="absolute top-5 right-5 p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
        
        <span className="text-[#e2001a] text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">Bureau de vote</span>
        <h4 className="text-3xl font-black text-slate-900 tracking-tight leading-none">N° {data.id}</h4>
        
        <div className="flex items-center gap-2 mt-3">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">{data.quartier}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-3 p-6 bg-slate-50 border-b border-slate-100">
        <MetricBox label="Inscrits" value={data.inscrits.toLocaleString()} icon={<Users className="w-3.5 h-3.5" />} />
        <MetricBox label="Part. T2" value={`${data.participationT2.toFixed(1)}%`} icon={<Vote className="w-3.5 h-3.5" />} />
        <MetricBox 
          label="Δ Part." 
          value={data.participationDelta !== null ? `${data.participationDelta > 0 ? '+' : ''}${data.participationDelta.toFixed(1)}pts` : '—'}
          highlight={data.participationDelta > 0 ? 'green' : 'red'}
        />
      </div>

      {/* T2 Results */}
      <div className="p-6 border-b border-slate-100">
        <h5 className="text-[10px] font-black uppercase tracking-[0.15em] text-[#e2001a] mb-4">Résultats 2nd Tour</h5>
        <div className="space-y-4">
          {t2Candidates.map(c => (
            <CandidateBar key={c.shortName} candidate={c} />
          ))}
        </div>
      </div>

      {/* T1 Results */}
      {t1 && (
        <div className="p-6 border-b border-slate-100">
          <h5 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-4">Résultats 1er Tour</h5>
          <div className="space-y-3">
            {t1Candidates.map(c => (
              <CandidateBar key={c.shortName} candidate={c} compact />
            ))}
          </div>
        </div>
      )}

      {/* Voting Details */}
      <div className="p-6">
        <h5 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-3">Détails du scrutin (T2)</h5>
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
          <DetailRow label="Inscrits" value={data.inscrits} />
          <DetailRow label="Abstentions" value={data.abstentions} />
          <DetailRow label="Votants" value={data.votants} />
          <DetailRow label="Émargements" value={data.emargements} />
          <DetailRow label="Blancs" value={data.blancs} />
          <DetailRow label="Nuls" value={data.nuls} />
          <DetailRow label="Exprimés" value={data.exprimes} bold />
        </div>
      </div>
    </motion.div>
  );
}

function MetricBox({ label, value, icon, highlight }) {
  const colors = {
    green: 'text-emerald-600',
    red: 'text-red-600',
  };
  return (
    <div className="flex flex-col items-center text-center">
      {icon && <div className="text-slate-400 mb-1">{icon}</div>}
      <span className={`text-lg font-black ${highlight ? colors[highlight] : 'text-slate-900'}`}>{value}</span>
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  );
}

function CandidateBar({ candidate, compact }) {
  const { shortName, party, pct, votes, color } = candidate;
  return (
    <div className={`flex flex-col gap-1.5 ${compact ? '' : ''}`}>
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2">
          <span className={`font-bold ${compact ? 'text-xs' : 'text-sm'} text-slate-800`}>{shortName}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase">{party}</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`font-black ${compact ? 'text-sm' : 'text-xl'} text-slate-900`}>{pct.toFixed(1)}%</span>
          <span className="mono text-[9px] text-slate-400 font-bold">{votes.toLocaleString()}</span>
        </div>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${Math.min(pct, 100)}%` }} 
          transition={{ type: 'spring', damping: 20, delay: 0.1 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function DetailRow({ label, value, bold }) {
  return (
    <>
      <span className={`text-slate-500 ${bold ? 'font-bold' : ''}`}>{label}</span>
      <span className={`text-right text-slate-900 mono ${bold ? 'font-black' : 'font-bold'}`}>{typeof value === 'number' ? value.toLocaleString() : value}</span>
    </>
  );
}
