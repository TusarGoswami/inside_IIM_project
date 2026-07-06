/**
 * Postgres Connection Pool.
 * Uses DATABASE_URL from environment. If not set, exports a null pool
 * so the app still boots without Postgres (graceful degradation).
 */
import pg from 'pg';
import env from '../config/env.js';

const { Pool } = pg;

/** @type {pg.Pool | null} */
let pool = null;

if (env.DATABASE_URL) {
  pool = new Pool({
    connectionString: env.DATABASE_URL,
    // Sensible defaults for a single-table history store
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  // Log connection errors without crashing
  pool.on('error', (err) => {
    console.warn('[Postgres Pool] Unexpected error on idle client:', err.message);
  });
} else {
  console.warn('[Postgres] DATABASE_URL not set — history persistence disabled.');
}

/**
 * Run a parameterized SQL query.
 * @param {string} text - SQL query string
 * @param {any[]} [params] - Query parameters
 * @returns {Promise<pg.QueryResult | null>}
 */
export async function query(text, params) {
  if (!pool) return null;
  return pool.query(text, params);
}

export { pool };
