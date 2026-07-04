/**
 * Debate Judge Check — deterministic node (no LLM call).
 * If bull and bear strength scores are within 15 points, route to rebuttal.
 * Otherwise skip directly to risk auditor.
 *
 * This node doesn't modify state — it's used purely for routing.
 * The actual routing logic is in graph.js via conditional edges.
 *
 * @param {import('../state.js').ICState} state
 * @returns {Partial<import('../state.js').ICState>}
 */
export function debateJudgeCheck(state) {
  const gap = Math.abs(
    (state.bullCase?.strength ?? 0) - (state.bearCase?.strength ?? 0)
  );
  const needsRebuttal = gap <= 15;

  return {
    reasoningTrail: [
      `[Debate Judge] Bull strength: ${state.bullCase?.strength}, Bear strength: ${state.bearCase?.strength}. ` +
      `Gap: ${gap}. ${needsRebuttal ? 'Triggering rebuttal round.' : 'Skipping rebuttal — gap too large.'}`,
    ],
  };
}

/**
 * Routing function for conditional edge — returns next node name.
 * @param {import('../state.js').ICState} state
 * @returns {string}
 */
export function shouldRebuttal(state) {
  const gap = Math.abs(
    (state.bullCase?.strength ?? 0) - (state.bearCase?.strength ?? 0)
  );
  return gap <= 15 ? 'rebuttalNode' : 'riskAuditorNode';
}
