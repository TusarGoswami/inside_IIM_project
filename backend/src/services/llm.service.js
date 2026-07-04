import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import env from '../config/env.js';

/**
 * Creates a Gemini model instance.
 *
 * @param {"flash" | "pro"} tier - Model tier requested.
 *   Note: For free-tier API keys, gemini-2.5-flash is used for all nodes to prevent
 *   429 quota errors (gemini-2.5-pro has 0 quota or strict rate limits on standard free keys).
 * @param {object} [options] - Additional options passed to ChatGoogleGenerativeAI
 * @returns {ChatGoogleGenerativeAI}
 */
export function createLLM(tier = 'flash', options = {}) {
  // Use gemini-2.5-flash across the board for reliability and speed on free API keys
  const modelName = 'gemini-2.5-flash';

  return new ChatGoogleGenerativeAI({
    model: modelName,
    apiKey: env.GOOGLE_API_KEY,
    temperature: tier === 'pro' ? 0.4 : 0.2, // slightly higher temp for reasoning/debates
    ...options,
  });
}
