import { TavilySearch } from '@langchain/tavily';
import env from '../config/env.js';

/**
 * Creates a Tavily search tool instance configured for investment research.
 *
 * @param {object} [options]
 * @param {number} [options.maxResults=5] - Max search results to return
 * @returns {TavilySearch}
 */
export function createSearchTool(options = {}) {
  const { maxResults = 5 } = options;

  return new TavilySearch({
    tavilyApiKey: env.TAVILY_API_KEY,
    maxResults,
    topic: 'finance',
  });
}

/**
 * Performs multiple searches and aggregates results.
 * Used to get broader coverage across different aspects of a company.
 *
 * @param {string} companyName
 * @returns {Promise<{ results: string, sourceUrls: { title: string, url: string }[] }>}
 */
export async function searchCompany(companyName) {
  const tool = createSearchTool({ maxResults: 5 });

  // Run parallel searches for different aspects of the company
  // TavilySearch.invoke() expects { query: "..." } not a raw string
  const queries = [
    `${companyName} company business model revenue financials 2024 2025`,
    `${companyName} competitive landscape market position competitors`,
    `${companyName} recent news sentiment analyst opinions`,
  ];

  const searchPromises = queries.map(query =>
    tool.invoke({ query }).catch(err => {
      console.warn(`[Search] Query failed: "${query}" — ${err.message}`);
      return '';
    })
  );

  const rawResults = await Promise.all(searchPromises);

  // Parse and deduplicate sources from Tavily results
  const sourceUrls = [];
  const seenUrls = new Set();

  for (const raw of rawResults) {
    if (!raw) continue;

    // Tavily can return either a string or a structured response object
    const text = typeof raw === 'string' ? raw : JSON.stringify(raw);

    // Extract URLs
    const urlMatches = text.match(/https?:\/\/[^\s"'<>}\]]+/g) || [];
    for (const url of urlMatches) {
      const cleanUrl = url.replace(/[.,;:)}\]]+$/, ''); // strip trailing punctuation
      if (!seenUrls.has(cleanUrl) && !cleanUrl.includes('tavily.com')) {
        seenUrls.add(cleanUrl);
        // Extract a readable title from the URL
        const pathSegments = new URL(cleanUrl).pathname.split('/').filter(Boolean);
        const title = (pathSegments.pop() || new URL(cleanUrl).hostname)
          .replace(/[-_]/g, ' ')
          .replace(/\.\w+$/, '')
          .slice(0, 80);
        sourceUrls.push({ title, url: cleanUrl });
      }
    }
  }

  // Build combined text from results
  const combinedResults = rawResults
    .map(r => (typeof r === 'string' ? r : JSON.stringify(r)))
    .filter(Boolean)
    .join('\n\n---\n\n');

  return {
    results: combinedResults,
    sourceUrls: sourceUrls.slice(0, 10), // cap at 10 deduplicated sources
  };
}
