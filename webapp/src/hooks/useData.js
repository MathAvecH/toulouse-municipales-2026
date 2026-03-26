import { useState, useEffect } from 'react';
import { query } from '../lib/duckdb';

export function useElectionData() {
    const [data, setData] = useState({ t1: [], t2: [], loading: true, error: null });

    useEffect(() => {
        async function fetchData() {
            try {
                console.log("DEBUG: fetchData starting...");
                const rawT1 = await query("SELECT * FROM results_t1.parquet");
                const rawT2 = await query("SELECT * FROM results_t2.parquet");

                // Map generic Parquet columns to the expected UI fields
                const mapT1 = (rows) => rows.map(r => ({
                    "n° de bureau de vote": String(r.column_7),
                    "Nombre d'inscrits": Number(r.column_9),
                    "Nombre de votants": Number(r.column_11),
                    "Nombre d'exprimés": Number(r.column_15)
                }));

                const mapT2 = (rows) => rows.map(r => ({
                    "n° de bureau de vote": String(r.column_7),
                    "Nombre d'inscrits": Number(r.column_9),
                    "Nombre de votants": Number(r.column_11),
                    "Nombre d'exprimés": Number(r.column_15),
                    "Nombre de voix de la liste 01": Number(r.column_18), // Moudenc (005)
                    "Nombre de voix de la liste 02": Number(r.column_20), // Piquemal (012)
                }));

                const t1Data = mapT1(rawT1);
                const t2Data = mapT2(rawT2);

                console.log("DEBUG: T1 Length:", t1Data.length);
                console.log("DEBUG: T2 Length:", t2Data.length);

                if (t1Data.length > 0) {
                    console.log("DEBUG: T1 keys:", Object.keys(t1Data[0]));
                    console.log("DEBUG: T1[0]:", JSON.stringify(t1Data[0]).substring(0, 200));
                }
                if (t2Data.length > 0) {
                    console.log("DEBUG: T2 keys:", Object.keys(t2Data[0]));
                }

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
