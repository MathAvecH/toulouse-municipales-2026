import { useState, useEffect, useMemo } from 'react';
import { query } from '../lib/duckdb';
import { T1_CANDIDATES, T2_CANDIDATES, T1_CANDIDATE_PAIRS, T2_CANDIDATE_PAIRS } from '../lib/candidates';

function parseBureauRow(row, candidatePairs, candidateMap) {
  const bureau = {
    id: String(row.column_7),
    inscrits: Number(row.column_9),
    abstentions: Number(row.column_10),
    votants: Number(row.column_11),
    emargements: Number(row.column_12),
    blancs: Number(row.column_13),
    nuls: Number(row.column_14),
    exprimes: Number(row.column_15),
    candidates: {},
  };
  bureau.participation = bureau.inscrits > 0 ? (bureau.votants / bureau.inscrits) * 100 : 0;

  for (const pair of candidatePairs) {
    const code = String(row[pair.codeCol]);
    const votes = Number(row[pair.votesCol]);
    const candidate = candidateMap[code];
    if (candidate) {
      bureau.candidates[candidate.shortName] = {
        code,
        votes,
        pct: bureau.exprimes > 0 ? (votes / bureau.exprimes) * 100 : 0,
        ...candidate,
      };
    }
  }
  return bureau;
}

export function useElectionData() {
  const [data, setData] = useState({ t1: [], t2: [], loading: true, error: null });

  useEffect(() => {
    async function fetchData() {
      try {
        const rawT1 = await query("SELECT * FROM results_t1.parquet");
        const rawT2 = await query("SELECT * FROM results_t2.parquet");

        const t1Data = rawT1.map(r => parseBureauRow(r, T1_CANDIDATE_PAIRS, T1_CANDIDATES));
        const t2Data = rawT2.map(r => parseBureauRow(r, T2_CANDIDATE_PAIRS, T2_CANDIDATES));

        setData({ t1: t1Data, t2: t2Data, loading: false, error: null });
      } catch (err) {
        console.error("DuckDB Query Error:", err);
        setData(prev => ({ ...prev, loading: false, error: err.message }));
      }
    }
    fetchData();
  }, []);

  return data;
}

export function useQuartierData() {
  const [quartierMap, setQuartierMap] = useState(null);

  useEffect(() => {
    const base = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '');
    fetch(`${base}/data/bureau_to_quartier.json`)
      .then(res => res.json())
      .then(data => setQuartierMap(data))
      .catch(e => console.error("Quartier data error:", e));
  }, []);

  return quartierMap;
}

// Compute merged T1+T2 data for each bureau
export function useMergedData(t1, t2, quartierMap) {
  return useMemo(() => {
    if (!t1.length || !t2.length) return [];
    
    return t2.map(b2 => {
      const b1 = t1.find(b => b.id === b2.id);
      const quartier = quartierMap ? (quartierMap[b2.id] || 'Inconnu') : 'Chargement...';
      
      return {
        ...b2,
        quartier,
        t1: b1 || null,
        participationT1: b1 ? b1.participation : null,
        participationT2: b2.participation,
        participationDelta: b1 ? b2.participation - b1.participation : null,
        // T1 candidate scores for correlation analysis
        moudencT1: b1?.candidates?.Moudenc?.pct ?? null,
        piquemalT1: b1?.candidates?.Piquemal?.pct ?? null,
        brianconT1: b1?.candidates?.Briançon?.pct ?? null,
        leonardelliT1: b1?.candidates?.Leonardelli?.pct ?? null,
        // T2 scores
        moudencT2: b2.candidates?.Moudenc?.pct ?? null,
        piquemalT2: b2.candidates?.Piquemal?.pct ?? null,
        // Blank/null votes change
        blancsNulsT1: b1 ? b1.blancs + b1.nuls : null,
        blancsNulsT2: b2.blancs + b2.nuls,
        blancsNulsDelta: b1 ? (b2.blancs + b2.nuls) - (b1.blancs + b1.nuls) : null,
      };
    });
  }, [t1, t2, quartierMap]);
}

// Compute global stats
export function useGlobalStats(t1, t2, merged) {
  return useMemo(() => {
    if (!t1.length || !t2.length) return null;

    const totalInscritsT1 = t1.reduce((acc, b) => acc + b.inscrits, 0);
    const totalVotantsT1 = t1.reduce((acc, b) => acc + b.votants, 0);
    const totalVotantsT2 = t2.reduce((acc, b) => acc + b.votants, 0);
    const totalExprimesT2 = t2.reduce((acc, b) => acc + b.exprimes, 0);

    const partT1 = totalInscritsT1 > 0 ? (totalVotantsT1 / totalInscritsT1) * 100 : 0;
    const partT2 = totalInscritsT1 > 0 ? (totalVotantsT2 / totalInscritsT1) * 100 : 0;

    // Count bureaux won by each candidate (T2)
    let bureauxMoudenc = 0, bureauxPiquemal = 0;
    t2.forEach(b => {
      const m = b.candidates?.Moudenc?.votes ?? 0;
      const p = b.candidates?.Piquemal?.votes ?? 0;
      if (m > p) bureauxMoudenc++;
      else if (p > m) bureauxPiquemal++;
    });

    // Total votes T2
    const totalVoixMoudenc = t2.reduce((acc, b) => acc + (b.candidates?.Moudenc?.votes ?? 0), 0);
    const totalVoixPiquemal = t2.reduce((acc, b) => acc + (b.candidates?.Piquemal?.votes ?? 0), 0);

    // Average participation delta
    const deltas = merged.filter(b => b.participationDelta !== null);
    const avgDelta = deltas.length > 0 ? deltas.reduce((acc, b) => acc + b.participationDelta, 0) / deltas.length : 0;

    return {
      totalInscrits: totalInscritsT1,
      totalBureaux: t2.length,
      partT1, partT2,
      partDelta: partT2 - partT1,
      bureauxMoudenc, bureauxPiquemal,
      totalVoixMoudenc, totalVoixPiquemal,
      totalExprimesT2,
      pctMoudenc: totalExprimesT2 > 0 ? (totalVoixMoudenc / totalExprimesT2) * 100 : 0,
      pctPiquemal: totalExprimesT2 > 0 ? (totalVoixPiquemal / totalExprimesT2) * 100 : 0,
      avgParticipationDelta: avgDelta,
    };
  }, [t1, t2, merged]);
}

// Pearson correlation coefficient
export function pearsonR(xs, ys) {
  const n = xs.length;
  if (n < 2) return 0;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : num / den;
}

// Linear regression for trend lines
export function linearRegression(xs, ys) {
  const n = xs.length;
  if (n < 2) return { slope: 0, intercept: 0 };
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;
  return { slope, intercept };
}
