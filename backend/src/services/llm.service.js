import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import env from '../config/env.js';

/**
 * Creates a Gemini model instance.
 *
 * @param {"flash" | "pro"} tier
 * @param {object} [options]
 * @returns {ChatGoogleGenerativeAI}
 */
export function createLLM(tier = 'flash', options = {}) {
  const modelName = options.model || 'gemini-2.5-flash';

  return new ChatGoogleGenerativeAI({
    model: modelName,
    apiKey: env.GOOGLE_API_KEY,
    temperature: tier === 'pro' ? 0.4 : 0.2,
    ...options,
  });
}

/**
 * Invokes a structured LLM using verified active Gemini models.
 * Fallback chain: gemini-2.5-flash -> gemini-2.0-flash -> gemini-1.5-flash
 *
 * @param {object} params
 * @param {import('zod').ZodSchema} params.schema - Zod schema for structured output
 * @param {string} params.prompt - Formatted prompt string
 * @param {"flash" | "pro"} [params.tier="flash"] - Requested tier
 * @param {number} [params.maxRetries=2] - Max retries per model
 * @returns {Promise<any>} Structured output matching schema
 */
export async function invokeStructuredLLM({ schema, prompt, tier = 'flash', maxRetries = 2 }) {
  // Verified active model list with separate quota pools
  const models = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
  ];

  let lastError = null;

  for (const modelName of models) {
    const llm = createLLM(tier, { model: modelName });
    const structuredLlm = llm.withStructuredOutput(schema);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[LLM (${modelName})] Attempt ${attempt}/${maxRetries}...`);
        const result = await structuredLlm.invoke(prompt);
        return result;
      } catch (err) {
        lastError = err;
        const isQuotaExhausted =
          err.status === 429 ||
          err.statusCode === 429 ||
          err.message?.includes('RESOURCE_EXHAUSTED') ||
          err.message?.toLowerCase().includes('quota') ||
          err.message?.toLowerCase().includes('rate limit');

        console.warn(`[LLM (${modelName})] Attempt ${attempt} failed: ${err.message}`);

        if (isQuotaExhausted) {
          console.warn(`[LLM] Model ${modelName} rate limited / quota exhausted. Switching immediately to next active model...`);
          break; // Exit attempt loop for this model, fall through immediately to next model in list
        }

        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 1500 * attempt));
        }
      }
    }
  }

  // Format clean human-readable error if rate limited
  const isRateLimit =
    lastError?.status === 429 ||
    lastError?.statusCode === 429 ||
    lastError?.message?.includes('RESOURCE_EXHAUSTED') ||
    lastError?.message?.toLowerCase().includes('quota') ||
    lastError?.message?.toLowerCase().includes('rate limit');

  if (isRateLimit) {
    throw new Error('Gemini API Free-Tier rate limit reached across models. Please wait 15–20 seconds for your quota window to reset, then click Try Again.');
  }

  throw new Error(`Execution failed: ${lastError?.message || 'Unknown error'}`);
}
