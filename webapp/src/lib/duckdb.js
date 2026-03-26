import * as duckdb from '@duckdb/duckdb-wasm';

let db = null;
let conn = null;

export async function initDB() {
    if (conn) return conn;

    console.log("Initializing DuckDB-Wasm (MVP Compatibility Mode)...");
    
    // Base resolution that works in both dev (root) and build (relative)
    const base = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '');
    
    // Using MVP build: no SharedArrayBuffer required, no COOP/COEP headers needed!
    const worker = new Worker(new URL(`${base}/duckdb/duckdb-browser-mvp.worker.js`).href);
    const logger = new duckdb.ConsoleLogger();
    db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(new URL(`${base}/duckdb/duckdb-mvp.wasm`).href);
    conn = await db.connect();
    
    console.log("DuckDB initialized. Registering tables...");
    
    await db.registerFileURL('results_t1.parquet', `${base}/data/t1.parquet`, duckdb.DuckDBDataProtocol.HTTP, false);
    await db.registerFileURL('results_t2.parquet', `${base}/data/t2.parquet`, duckdb.DuckDBDataProtocol.HTTP, false);
    
    return conn;
}

export async function query(sql) {
    const c = await initDB();
    const result = await c.query(sql);
    return JSON.parse(JSON.stringify(result.toArray(), (key, value) =>
        typeof value === 'bigint' ? Number(value) : value
    ));
}
