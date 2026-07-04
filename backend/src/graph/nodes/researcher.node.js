import { createLLM } from '../../services/llm.service.js';
import { searchCompany } from '../../services/search.service.js';
import { researchSchema, pairsToRecord } from '../../schemas/research.schema.js';
import { researcherPrompt } from '../../prompts/researcher.prompt.js';

const MAX_RETRIES = 2;

/**
 * Researcher Node — searches for company information using Tavily,
 * then uses Gemini (flash) to extract structured research data.
 * Validates output against Zod schema with up to 2 retries.
 *
 * @param {import('../state.js').ICState} state
 * @returns {Promise<Partial<import('../state.js').ICState>>}
 */
export async function researcherNode(state) {
  const { companyName } = state;
  console.log(`[Researcher] Starting research on "${companyName}"...`);

  // Step 1: Search for company information via Tavily
  const { results: searchResults, sourceUrls } = await searchCompany(companyName);

  if (!searchResults || searchResults.trim().length < 50) {
    console.warn(`[Researcher] Very little search data found for "${companyName}".`);
    return {
      research: {
        summary: `Limited information found for ${companyName}. Search returned insufficient data for a thorough analysis.`,
        financials: {},
        competitors: [],
        sentiment: 'Unable to determine — insufficient data.',
        sources: sourceUrls,
        lowDataConfidence: true,
      },
      reasoningTrail: [`[Researcher] Searched for "${companyName}" — insufficient data returned. Marked as low confidence.`],
    };
  }

  // Step 2: Use Gemini to extract structured research from raw search results
  const llm = createLLM('flash');
  const structuredLlm = llm.withStructuredOutput(researchSchema);

  const prompt = researcherPrompt
    .replace('{companyName}', companyName)
    .replace('{searchResults}', searchResults);

  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      console.log(`[Researcher] LLM extraction attempt ${attempt}...`);
      const result = await structuredLlm.invoke(prompt);

      // Convert financials from array-of-pairs to Record format
      const financials = pairsToRecord(result.financials || []);

      // Merge Tavily-discovered source URLs with LLM-extracted ones
      const allSources = mergeAndDeduplicateSources(result.sources || [], sourceUrls);

      // Apply lowDataConfidence logic: if fewer than 2 usable sources
      const lowDataConfidence = allSources.length < 2 || result.lowDataConfidence;

      const research = {
        summary: result.summary,
        financials,
        competitors: result.competitors,
        sentiment: result.sentiment,
        sources: allSources,
        lowDataConfidence,
      };

      console.log(`[Researcher] Research complete — ${allSources.length} sources, lowDataConfidence=${lowDataConfidence}`);

      return {
        research,
        reasoningTrail: [
          `[Researcher] Completed research on "${companyName}" — found ${allSources.length} sources. ` +
          `Low data confidence: ${lowDataConfidence}. ` +
          `Sentiment: ${result.sentiment?.slice(0, 80)}...`,
        ],
      };
    } catch (err) {
      lastError = err;
      console.warn(`[Researcher] Attempt ${attempt} failed: ${err.message}`);

      if (attempt <= MAX_RETRIES) {
        const backoffMs = 3000 * attempt;
        console.log(`[Researcher] Backing off ${backoffMs}ms before retry (${attempt}/${MAX_RETRIES})...`);
        await new Promise(r => setTimeout(r, backoffMs));
      }
    }
  }

  // All retries exhausted
  throw new Error(`Researcher node failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`);
}

/**
 * Merges and deduplicates source arrays, preferring sources with real URLs.
 *
 * @param {Array<{title: string, url: string}>} llmSources - Sources extracted by LLM
 * @param {Array<{title: string, url: string}>} searchSources - Sources from Tavily search
 * @returns {Array<{title: string, url: string}>}
 */
function mergeAndDeduplicateSources(llmSources, searchSources) {
  const seen = new Set();
  const merged = [];

  for (const source of [...llmSources, ...searchSources]) {
    if (source.url && !seen.has(source.url)) {
      seen.add(source.url);
      merged.push(source);
    }
  }

  return merged.slice(0, 10);
}
