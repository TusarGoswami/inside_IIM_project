import { createLLM } from '../../services/llm.service.js';
import { rebuttalSchema } from '../../schemas/research.schema.js';
import { rebuttalPrompt } from '../../prompts/rebuttal.prompt.js';

const MAX_RETRIES = 2;

/**
 * Rebuttal Node — each side directly counters the other's strongest point.
 * Only runs when bull/bear strength scores are within 15 points.
 *
 * @param {import('../state.js').ICState} state
 * @returns {Promise<Partial<import('../state.js').ICState>>}
 */
export async function rebuttalNode(state) {
  const { companyName, bullCase, bearCase } = state;
  console.log(`[Rebuttal] Running rebuttal round for "${companyName}"...`);

  if (!bullCase || !bearCase) {
    throw new Error('Rebuttal node requires both bull and bear cases.');
  }

  const llm = createLLM('pro');
  const structuredLlm = llm.withStructuredOutput(rebuttalSchema);

  const prompt = rebuttalPrompt
    .replace('{companyName}', companyName)
    .replace('{bullStrength}', String(bullCase.strength))
    .replace('{bearStrength}', String(bearCase.strength))
    .replace('{bullCaseJson}', JSON.stringify(bullCase, null, 2))
    .replace('{bearCaseJson}', JSON.stringify(bearCase, null, 2));

  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      console.log(`[Rebuttal] LLM attempt ${attempt}...`);
      const result = await structuredLlm.invoke(prompt);

      const trail = [];
      const updates = {
        rebuttalOccurred: true,
        rebuttal: {
          bullRebuttal: result.bullRebuttal,
          bearRebuttal: result.bearRebuttal,
        },
      };

      trail.push(`[Rebuttal] Bull rebuttal: "${result.bullRebuttal.slice(0, 100)}..."`);
      trail.push(`[Rebuttal] Bear rebuttal: "${result.bearRebuttal.slice(0, 100)}..."`);

      // Apply modest score adjustments if provided (±10 max, clamped)
      const bullAdj = Math.max(-10, Math.min(10, result.bullScoreAdjustment || 0));
      const bearAdj = Math.max(-10, Math.min(10, result.bearScoreAdjustment || 0));

      if (bullAdj !== 0 || bearAdj !== 0) {
        const newBullStrength = Math.max(0, Math.min(100, bullCase.strength + bullAdj));
        const newBearStrength = Math.max(0, Math.min(100, bearCase.strength + bearAdj));

        updates.bullCase = { ...bullCase, strength: newBullStrength };
        updates.bearCase = { ...bearCase, strength: newBearStrength };

        trail.push(
          `[Rebuttal] Score adjustments: bull ${bullCase.strength} → ${newBullStrength} (${bullAdj >= 0 ? '+' : ''}${bullAdj}), ` +
          `bear ${bearCase.strength} → ${newBearStrength} (${bearAdj >= 0 ? '+' : ''}${bearAdj}).`
        );
      } else {
        trail.push('[Rebuttal] No score adjustments applied.');
      }

      console.log(`[Rebuttal] Complete — bull adj: ${bullAdj}, bear adj: ${bearAdj}`);

      return {
        ...updates,
        reasoningTrail: trail,
      };
    } catch (err) {
      lastError = err;
      console.warn(`[Rebuttal] Attempt ${attempt} failed: ${err.message}`);
      if (attempt <= MAX_RETRIES) {
        const backoffMs = 2000 * attempt;
        console.log(`[Rebuttal] Backing off ${backoffMs}ms before retry (${attempt}/${MAX_RETRIES})...`);
        await new Promise(r => setTimeout(r, backoffMs));
      }
    }
  }

  throw new Error(`Rebuttal node failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`);
}
