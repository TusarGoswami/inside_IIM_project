// In development, call backend port 3001 or environment override
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

/**
 * Starts a new research run for the given company name.
 * @param {string} companyName
 * @returns {Promise<{ runId: string, message: string }>}
 */
export async function startResearch(companyName) {
  const response = await fetch(`${API_BASE}/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyName }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to start research' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Constructs the SSE stream URL for a given runId.
 * @param {string} runId
 * @returns {string}
 */
export function getStreamUrl(runId) {
  return `${API_BASE}/research/${runId}/stream`;
}

/**
 * Fetches existing run state by runId (for refresh/reload).
 * @param {string} runId
 * @returns {Promise<{ runId: string, status: string, companyName: string, state: object }>}
 */
export async function fetchRunState(runId) {
  const response = await fetch(`${API_BASE}/research/${runId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch run state: HTTP ${response.status}`);
  }
  return response.json();
}
