import { Router } from 'express';
import { getRecentRuns, getRunById } from '../services/history.service.js';

const router = Router();

/**
 * GET /api/history
 * Returns the last 20 completed runs (lightweight: no full result_json).
 */
router.get('/history', async (_req, res) => {
  try {
    const runs = await getRecentRuns(20);
    res.json(runs);
  } catch (err) {
    console.error('[History Route] Error fetching history:', err.message);
    res.json([]);
  }
});

/**
 * GET /api/history/:id
 * Returns the full stored result_json for one past run.
 */
router.get('/history/:id', async (req, res) => {
  try {
    const result = await getRunById(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Run not found in history.' });
    }
    res.json(result);
  } catch (err) {
    console.error('[History Route] Error fetching run:', err.message);
    res.status(500).json({ error: 'Failed to fetch run from history.' });
  }
});

export default router;
