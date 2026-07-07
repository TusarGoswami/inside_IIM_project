/**
 * In-memory run store keyed by runId.
 * No database required for V1 per specification.
 */
class RunStore {
  constructor() {
    /** @type {Map<string, { runId: string, companyName: string, state: object, status: 'running'|'completed'|'failed', createdAt: string, updatedAt: string }>} */
    this.runs = new Map();
  }

  /**
   * Create a new run record.
   * @param {string} runId
   * @param {string} companyName
   */
  createRun(runId, companyName) {
    const record = {
      runId,
      companyName,
      state: { companyName, reasoningTrail: [] },
      status: 'running',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.runs.set(runId, record);
    return record;
  }

  /**
   * Get run record by ID.
   * @param {string} runId
   */
  getRun(runId) {
    return this.runs.get(runId) || null;
  }

  /**
   * Update run state and status.
   * @param {string} runId
   * @param {Partial<import('../graph/state.js').ICState>} partialState
   * @param {'running'|'completed'|'failed'} [status]
   */
  updateRun(runId, partialState, status) {
    const run = this.runs.get(runId);
    if (!run) return null;

    run.state = {
      ...run.state,
      ...partialState,
      // Ensure arrays are merged cleanly if provided
      reasoningTrail: partialState.reasoningTrail
        ? [...(run.state.reasoningTrail || []), ...partialState.reasoningTrail]
        : (run.state.reasoningTrail || []),
    };

    if (status) {
      run.status = status;
    }
    run.updatedAt = new Date().toISOString();
    return run;
  }
}

export const runStore = new RunStore();

// Sweep every 5 minutes — remove completed/failed runs older than 1 hour
const RUN_TTL_MS = 60 * 60 * 1000; // 1 hour
setInterval(() => {
  const now = Date.now();
  for (const [id, run] of runStore.runs) {
    if (run.status === 'completed' || run.status === 'failed') {
      const age = now - new Date(run.updatedAt).getTime();
      if (age > RUN_TTL_MS) {
        runStore.runs.delete(id);
      }
    }
  }
}, 5 * 60 * 1000);
