import { invokeStructuredLLM } from '../../services/llm.service.js';
import { bullBearSchema } from '../../schemas/research.schema.js';
import { bearPrompt } from '../../prompts/bear.prompt.js';

/**
 * Bear Node — builds the strongest possible case AGAINST investing,
 * using only the memo as its evidence base.
 *
 * @param {import('../state.js').ICState} state
 * @returns {Promise<Partial<import('../state.js').ICState>>}
 */
export async function bearNode(state) {
  const { companyName, memo } = state;
  console.log(`[Bear] Building counter-case for "${companyName}"...`);

  if (!memo) {
    throw new Error('Bear node received null memo — cannot build case.');
  }

  const prompt = bearPrompt
    .replace('{companyName}', companyName)
    .replace('{memoJson}', JSON.stringify(memo, null, 2));

  const result = await invokeStructuredLLM({
    schema: bullBearSchema,
    prompt,
    tier: 'pro',
  });

  // Clamp strength to valid range
  result.strength = Math.max(0, Math.min(100, Math.round(result.strength)));

  console.log(`[Bear] Case built — ${result.arguments.length} arguments, strength: ${result.strength}/100`);

  return {
    bearCase: result,
    reasoningTrail: [
      `[Bear] Built counter-case with ${result.arguments.length} arguments. ` +
      `Strength: ${result.strength}/100. ` +
      `Lead argument: "${result.arguments[0]?.point?.slice(0, 80)}..."`,
    ],
  };
}
