import { createLLM } from '../../services/llm.service.js';
import { bullBearSchema } from '../../schemas/research.schema.js';
import { bearPrompt } from '../../prompts/bear.prompt.js';

const MAX_RETRIES = 2;

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

  const llm = createLLM('pro');
  const structuredLlm = llm.withStructuredOutput(bullBearSchema);

  const prompt = bearPrompt
    .replace('{companyName}', companyName)
    .replace('{memoJson}', JSON.stringify(memo, null, 2));

  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      console.log(`[Bear] LLM attempt ${attempt}...`);
      const result = await structuredLlm.invoke(prompt);

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
    } catch (err) {
      lastError = err;
      console.warn(`[Bear] Attempt ${attempt} failed: ${err.message}`);
      if (attempt <= MAX_RETRIES) {
        // Backoff delay before retry (2s, 4s) to respect RPM rate limits
        const backoffMs = 2000 * attempt;
        console.log(`[Bear] Backing off ${backoffMs}ms before retry (${attempt}/${MAX_RETRIES})...`);
        await new Promise(r => setTimeout(r, backoffMs));
      }
    }
  }

  throw new Error(`Bear node failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`);
}
