/**
 * History Service — Postgres-backed persistence for completed runs.
 * All methods are safe to call even if Postgres is unreachable;
 * they log warnings and return graceful fallbacks.
 */
import { query, pool } from '../db/client.js';

/**
 * Persist a completed run to Postgres.
 * @param {string} id - Run UUID
 * @param {string} companyName
 * @param {string} verdict - "Invest" | "Watchlist" | "Pass"
 * @param {number} conviction - 0–100
 * @param {object} resultJson - Full final state object
 */
export async function saveRun(id, companyName, verdict, conviction, resultJson) {
  if (!pool) return;

  try {
    await query(
      `INSERT INTO runs (id, company_name, verdict, conviction, result_json)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [id, companyName, verdict, conviction, JSON.stringify(resultJson)]
    );
  } catch (err) {
    console.warn('[History] Failed to save run to Postgres:', err.message);
  }
}

/**
 * Fetch the most recent completed runs (lightweight — no full JSON).
 * @param {number} [limit=20]
 * @returns {Promise<Array<{ id: string, company_name: string, verdict: string, conviction: number, created_at: string }>>}
 */
export async function getRecentRuns(limit = 20) {
  if (!pool) return [];

  try {
    const result = await query(
      `SELECT id, company_name, verdict, conviction, created_at
       FROM runs
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );
    return result?.rows ?? [];
  } catch (err) {
    console.warn('[History] Failed to fetch recent runs:', err.message);
    return [];
  }
}

/**
 * Fetch the full stored result_json for a single past run.
 * @param {string} id - Run UUID
 * @returns {Promise<object | null>}
 */
export async function getRunById(id) {
  if (!pool) return null;

  try {
    const result = await query(
      `SELECT result_json FROM runs WHERE id = $1`,
      [id]
    );
    if (result?.rows?.length > 0) {
      return result.rows[0].result_json;
    }
    return null;
  } catch (err) {
    console.warn('[History] Failed to fetch run by id:', err.message);
    return null;
  }
}
