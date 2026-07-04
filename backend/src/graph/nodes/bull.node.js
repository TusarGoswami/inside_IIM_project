import { invokeStructuredLLM } from '../../services/llm.service.js';
import { bullBearSchema } from '../../schemas/research.schema.js';
import { bullPrompt } from '../../prompts/bull.prompt.js';

/**
 * Bull Node — builds the strongest possible case FOR investing,
 * using only the memo as its evidence base.
 *
 * @param {import('../state.js').ICState} state
 * @returns {Promise<Partial<import('../state.js').ICState>>}
 */
export async function bullNode(state) {
  const { companyName, memo } = state;
  console.log(`[Bull] Building investment case for "${companyName}"...`);

  if (!memo) {
    throw new Error('Bull node received null memo — cannot build case.');
  }

  const prompt = bullPrompt
    .replace('{companyName}', companyName)
    .replace('{memoJson}', JSON.stringify(memo, null, 2));

  const result = await invokeStructuredLLM({
    schema: bullBearSchema,
    prompt,
    tier: 'pro',
  });

  // Clamp strength to valid range
  result.strength = Math.max(0, Math.min(100, Math.round(result.strength)));

  console.log(`[Bull] Case built — ${result.arguments.length} arguments, strength: ${result.strength}/100`);

  return {
    bullCase: result,
    reasoningTrail: [
      `[Bull] Built investment case with ${result.arguments.length} arguments. ` +
      `Strength: ${result.strength}/100. ` +
      `Lead argument: "${result.arguments[0]?.point?.slice(0, 80)}..."`,
    ],
  };
}
