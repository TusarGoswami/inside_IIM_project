import { invokeStructuredLLM } from '../../services/llm.service.js';
import { riskAuditSchema } from '../../schemas/research.schema.js';
import { riskAuditorPrompt } from '../../prompts/riskAuditor.prompt.js';

/**
 * Risk Auditor Node — scans for concrete red flags across governance,
 * regulatory, financial, and competitive dimensions.
 *
 * @param {import('../state.js').ICState} state
 * @returns {Promise<Partial<import('../state.js').ICState>>}
 */
export async function riskAuditorNode(state) {
  const { companyName, memo, research } = state;
  console.log(`[Risk Auditor] Scanning for risk flags on "${companyName}"...`);

  if (!memo || !research) {
    throw new Error('Risk Auditor requires both memo and research data.');
  }

  const prompt = riskAuditorPrompt
    .replace('{companyName}', companyName)
    .replace('{memoJson}', JSON.stringify(memo, null, 2))
    .replace('{researchJson}', JSON.stringify(research, null, 2))
    .replace('{lowDataConfidence}', String(research.lowDataConfidence))
    .replace('{dataConflict}', String(memo.dataConflict));

  const result = await invokeStructuredLLM({
    schema: riskAuditSchema,
    prompt,
    tier: 'flash',
  });

  let riskFlags = result.riskFlags || [];

  // Enforce: if lowDataConfidence or dataConflict, must have at least a data reliability flag
  const hasDataFlag = riskFlags.some(f =>
    f.label.toLowerCase().includes('data') ||
    f.label.toLowerCase().includes('reliability') ||
    f.label.toLowerCase().includes('confidence')
  );

  if ((research.lowDataConfidence || memo.dataConflict) && !hasDataFlag) {
    const severity = research.lowDataConfidence ? 'medium' : 'low';
    riskFlags.push({
      label: 'Data Reliability Risk',
      severity,
      detail: research.lowDataConfidence
        ? 'Limited publicly available data reduces confidence in the analysis — fewer than 2 substantive sources were found.'
        : 'Conflicting data points were found across sources, reducing the reliability of key financial figures.',
    });
  }

  // Sort by severity for consistent display (critical first)
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  riskFlags.sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4));

  const severityCounts = riskFlags.reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {});

  console.log(`[Risk Auditor] Found ${riskFlags.length} risk flags: ${JSON.stringify(severityCounts)}`);

  return {
    riskFlags,
    reasoningTrail: [
      `[Risk Auditor] Identified ${riskFlags.length} risk flags for "${companyName}": ` +
      Object.entries(severityCounts).map(([s, c]) => `${c} ${s}`).join(', ') +
      '.',
    ],
  };
}
