import { invokeStructuredLLM } from '../../services/llm.service.js';
import { memoSchema, pairsToRecord } from '../../schemas/research.schema.js';
import { memoWriterPrompt } from '../../prompts/memoWriter.prompt.js';

/**
 * Memo Writer Node — synthesizes research into a structured investment memo.
 * Uses Gemini with automatic model fallback and rate-limit backoff.
 *
 * @param {import('../state.js').ICState} state
 * @returns {Promise<Partial<import('../state.js').ICState>>}
 */
export async function memoWriterNode(state) {
  const { companyName, research } = state;
  console.log(`[Memo Writer] Generating investment memo for "${companyName}"...`);

  if (!research) {
    throw new Error('Memo Writer received null research — cannot generate memo.');
  }

  const prompt = memoWriterPrompt
    .replace('{companyName}', companyName)
    .replace('{researchJson}', JSON.stringify(research, null, 2));

  const result = await invokeStructuredLLM({
    schema: memoSchema,
    prompt,
    tier: 'flash',
  });

  // Convert keyMetrics from array-of-pairs to Record format
  const keyMetrics = pairsToRecord(result.keyMetrics || []);

  // If research had lowDataConfidence and LLM didn't flag it in weaknesses
  const weaknesses = [...result.weaknesses];
  if (research.lowDataConfidence && !weaknesses.some(w => w.toLowerCase().includes('data') || w.toLowerCase().includes('limited'))) {
    weaknesses.push('Limited publicly available data reduces confidence in the analysis.');
  }

  const memo = {
    thesis: result.thesis,
    strengths: result.strengths,
    weaknesses,
    keyMetrics,
    dataConflict: result.dataConflict,
  };

  console.log(`[Memo Writer] Memo generated — thesis length: ${memo.thesis.length} chars, ` +
    `${memo.strengths.length} strengths, ${memo.weaknesses.length} weaknesses, ` +
    `dataConflict: ${memo.dataConflict}`);

  return {
    memo,
    reasoningTrail: [
      `[Memo Writer] Generated investment memo for "${companyName}". ` +
      `Thesis: ${memo.thesis.slice(0, 100)}... ` +
      `Data conflict: ${memo.dataConflict}.`,
    ],
  };
}
