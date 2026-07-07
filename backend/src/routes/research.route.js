import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from 'express-rate-limit';
import { runStore } from '../utils/runStore.js';
import { buildGraph } from '../graph/graph.js';
import { initSSEResponse, sendSSEEvent, closeSSEStream, errorSSEStream } from '../utils/sseEmitter.js';
import { saveRun } from '../services/history.service.js';

const router = Router();
// Singleton instance of compiled LangGraph
let compiledGraph = null;

function getGraph() {
  if (!compiledGraph) {
    compiledGraph = buildGraph();
  }
  return compiledGraph;
}

// Rate limiter: max 5 research requests per IP per minute
const researchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please wait a minute before starting another analysis.' },
});

/**
 * POST /api/research
 * Accepts body: { companyName: string }
 * Returns: { runId: string } (202 Accepted)
 */
router.post('/research', researchLimiter, async (req, res) => {
  const { companyName } = req.body || {};

  if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
    return res.status(400).json({ error: 'Company name must be a non-empty string.' });
  }

  if (companyName.length > 100) {
    return res.status(400).json({ error: 'Company name must be 100 characters or fewer.' });
  }

  // Strip anything except letters, digits, spaces, hyphens, and periods
  const sanitized = companyName.trim().replace(/[^a-zA-Z0-9\s.\-]/g, '');

  if (!sanitized) {
    return res.status(400).json({ error: 'Company name contains no valid characters.' });
  }

  const cleanName = sanitized;
  const runId = uuidv4();

  // Create record in run store
  runStore.createRun(runId, cleanName);

  // Return runId immediately without waiting for graph completion (202 Accepted)
  res.status(202).json({ runId, message: 'Research process started.' });
});

/**
 * GET /api/research/:runId/stream
 * Server-Sent Events endpoint for streaming graph updates in real time.
 */
router.get('/research/:runId/stream', async (req, res) => {
  const { runId } = req.params;
  const run = runStore.getRun(runId);

  if (!run) {
    return res.status(404).json({ error: 'Run ID not found.' });
  }

  // Set up SSE headers
  initSSEResponse(res);

  // If already completed or failed, send final state or error immediately
  if (run.status === 'completed') {
    closeSSEStream(res, run.state);
    return;
  }
  if (run.status === 'failed') {
    errorSSEStream(res, run.state.error || 'Research failed.');
    return;
  }

  try {
    const graph = getGraph();

    // Stream graph execution updates
    const stream = await graph.stream(
      { companyName: run.companyName },
      { streamMode: 'updates' }
    );

    for await (const event of stream) {
      if (res.writableEnded || res.destroyed) break;

      const [nodeName] = Object.keys(event);
      const nodeData = event[nodeName];

      // Update in-memory store
      runStore.updateRun(runId, nodeData);

      // Emit event to client over SSE
      sendSSEEvent(res, nodeName, nodeData);

      // If node returned an unrecoverable state error, stop
      if (nodeData.error) {
        runStore.updateRun(runId, {}, 'failed');
        errorSSEStream(res, nodeData.error);
        return;
      }
    }

    // Graph finished executing
    const finalRun = runStore.getRun(runId);
    runStore.updateRun(runId, {}, 'completed');

    if (finalRun) {
      if (!res.writableEnded) {
        closeSSEStream(res, finalRun.state);
      }

      // Persist completed run to Postgres (fire-and-forget, never blocks SSE)
      try {
        const s = finalRun.state;
        await saveRun(runId, finalRun.companyName, s.verdict || 'Unknown', s.conviction || 0, s);
      } catch (dbErr) {
        console.warn('[Research Route] Failed to persist run to history:', dbErr.message);
      }
    }
  } catch (err) {
    console.error(`[SSE Stream Error - runId ${runId}]:`, err);
    runStore.updateRun(runId, { error: err.message }, 'failed');
    if (!res.writableEnded) {
      errorSSEStream(res, err.message);
    }
  }
});

/**
 * GET /api/research/:runId
 * Returns current or final state for a given run ID (for reload/refresh).
 */
router.get('/research/:runId', (req, res) => {
  const { runId } = req.params;
  const run = runStore.getRun(runId);

  if (!run) {
    return res.status(404).json({ error: 'Run ID not found.' });
  }

  res.json({
    runId: run.runId,
    status: run.status,
    companyName: run.companyName,
    state: run.state,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
  });
});

export default router;
