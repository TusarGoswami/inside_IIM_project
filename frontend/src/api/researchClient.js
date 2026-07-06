// Location-aware API base — automatically uses localhost locally and hardcoded Render in production
const getApiBase = () => {
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isLocal 
    ? 'http://localhost:3001/api' 
    : 'https://deal-desk-backend-k90s.onrender.com/api';
};

const API_BASE = getApiBase();

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

/**
 * Fetches the list of past completed runs (lightweight: no full JSON).
 * @returns {Promise<Array<{ id: string, company_name: string, verdict: string, conviction: number, created_at: string }>>}
 */
export async function fetchHistory() {
  const response = await fetch(`${API_BASE}/history`);
  if (!response.ok) {
    throw new Error(`Failed to fetch history: HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Fetches the full stored result_json for a single past run.
 * @param {string} id - Run UUID
 * @returns {Promise<object>}
 */
export async function fetchHistoryRun(id) {
  const response = await fetch(`${API_BASE}/history/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch history run: HTTP ${response.status}`);
  }
  return response.json();
}
