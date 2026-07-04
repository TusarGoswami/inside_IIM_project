import { createLLM } from '../../services/llm.service.js';
import { verdictNarrativeSchema } from '../../schemas/research.schema.js';
import { verdictJudgePrompt } from '../../prompts/verdictJudge.prompt.js';

const MAX_RETRIES = 2;

/**
 * Verdict Judge Node — writes a narrative thesis summary (LLM),
 * but the verdict label itself comes from the deterministic scoreAggregatorNode.
 * Never sets the verdict or conviction — those are already finalized.
 *
 * @param {import('../state.js').ICState} state
 * @returns {Promise<Partial<import('../state.js').ICState>>}
 */
export async function verdictJudgeNode(state) {
  const { companyName, verdict, conviction, bullCase, bearCase, riskFlags, memo, rebuttalOccurred } = state;
  console.log(`[Verdict Judge] Writing thesis summary for "${companyName}"...`);

  const llm = createLLM('pro');
  const structuredLlm = llm.withStructuredOutput(verdictNarrativeSchema);

  // Build risk flags summary for the prompt
  const riskFlagsSummary = (riskFlags || []).length > 0
    ? riskFlags.map(f => `- [${f.severity.toUpperCase()}] ${f.label}: ${f.detail}`).join('\n')
    : 'No significant risk flags identified.';

  const prompt = verdictJudgePrompt
    .replace('{companyName}', companyName)
    .replace('{verdict}', verdict || 'Unknown')
    .replace('{conviction}', String(conviction ?? 0))
    .replace('{memoThesis}', memo?.thesis || 'No memo available.')
    .replace('{bullStrength}', String(bullCase?.strength ?? 0))
    .replace('{bullLead}', bullCase?.arguments?.[0]?.point || 'No bull case.')
    .replace('{bearStrength}', String(bearCase?.strength ?? 0))
    .replace('{bearLead}', bearCase?.arguments?.[0]?.point || 'No bear case.')
    .replace('{riskFlagsSummary}', riskFlagsSummary)
    .replace('{rebuttalOccurred}', String(rebuttalOccurred ?? false));

  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      console.log(`[Verdict Judge] LLM attempt ${attempt}...`);
      const result = await structuredLlm.invoke(prompt);

      console.log(`[Verdict Judge] Summary generated — ${result.thesisSummary.length} chars.`);

      // NOTE: We do NOT override verdict or conviction here — those are set by scoreAggregatorNode
      return {
        thesisSummary: result.thesisSummary,
        reasoningTrail: [
          `[Verdict Judge] Final verdict: ${verdict} (${conviction}/100). ` +
          `Summary: "${result.thesisSummary.slice(0, 100)}..."`,
        ],
      };
    } catch (err) {
      lastError = err;
      console.warn(`[Verdict Judge] Attempt ${attempt} failed: ${err.message}`);
      if (attempt <= MAX_RETRIES) {
        const backoffMs = 2000 * attempt;
        console.log(`[Verdict Judge] Backing off ${backoffMs}ms before retry (${attempt}/${MAX_RETRIES})...`);
        await new Promise(r => setTimeout(r, backoffMs));
      }
    }
  }

  // Fallback: generate a basic summary without LLM rather than failing the whole pipeline
  console.warn('[Verdict Judge] All LLM attempts failed — generating fallback summary.');
  return {
    thesisSummary: `The investment committee reviewed ${companyName} and reached a ${verdict} verdict with ${conviction}/100 conviction. The analysis considered multiple factors including market position, financial health, and risk profile.`,
    reasoningTrail: [
      `[Verdict Judge] LLM narrative generation failed — using fallback summary. Verdict: ${verdict} (${conviction}/100).`,
    ],
  };
}
