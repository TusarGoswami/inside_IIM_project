import { invokeStructuredLLM } from '../../services/llm.service.js';
import { searchCompany } from '../../services/search.service.js';
import { researchSchema, pairsToRecord } from '../../schemas/research.schema.js';
import { researcherPrompt } from '../../prompts/researcher.prompt.js';

/**
 * Researcher Node — searches for company information using Tavily,
 * then uses Gemini with automatic model fallback to extract structured research data.
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

  // Step 2: Extract structured research using Gemini with fallback & backoff
  const prompt = researcherPrompt
    .replace('{companyName}', companyName)
    .replace('{searchResults}', searchResults);

  const result = await invokeStructuredLLM({
    schema: researchSchema,
    prompt,
    tier: 'flash',
  });

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
