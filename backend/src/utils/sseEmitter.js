/**
 * Server-Sent Events (SSE) Emitter Utility.
 * Manages SSE connections and formats events for Express routes.
 */

/**
 * Sets proper HTTP headers for Server-Sent Events.
 * @param {import('express').Response} res
 */
export function initSSEResponse(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering in Nginx if deployed
  res.flushHeaders?.();
}

/**
 * Emits a structured SSE event to the client.
 * @param {import('express').Response} res
 * @param {string} eventName - Node name or event type (e.g. 'researcherNode', 'done', 'error')
 * @param {object} data - Data payload to send
 */
export function sendSSEEvent(res, eventName, data) {
  if (res.writableEnded || res.destroyed) return;

  const payload = {
    node: eventName,
    data,
    timestamp: new Date().toISOString(),
  };

  res.write(`data: ${JSON.stringify(payload)}\n\n`);
  // Flush output buffer if supported
  if (typeof res.flush === 'function') {
    res.flush();
  }
}

/**
 * Sends a final 'done' event and closes the response stream.
 * @param {import('express').Response} res
 * @param {object} finalState
 */
export function closeSSEStream(res, finalState) {
  if (res.writableEnded || res.destroyed) return;

  sendSSEEvent(res, 'done', finalState);
  res.end();
}

/**
 * Sends an 'error' event and closes the response stream.
 * @param {import('express').Response} res
 * @param {string} errorMessage
 */
export function errorSSEStream(res, errorMessage) {
  if (res.writableEnded || res.destroyed) return;

  sendSSEEvent(res, 'error', { error: errorMessage });
  res.end();
}
