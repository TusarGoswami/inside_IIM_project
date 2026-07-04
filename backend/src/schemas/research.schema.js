import { z } from 'zod';

// ─── Research Schema ─────────────────────────────────────────

export const sourceSchema = z.object({
  title: z.string().describe('Title or short description of the source'),
  url: z.string().describe('URL of the source'),
});

/**
 * Note: We avoid z.record() because Gemini's response_schema does not support
 * the "propertyNames" JSON Schema field that z.record() generates.
 * Instead, financials is an array of key-value pairs.
 */
export const financialMetricSchema = z.object({
  metric: z.string().describe('Name of the financial metric (e.g., "Revenue", "Net Income")'),
  value: z.string().describe('Value of the metric as a string (e.g., "$10B", "15%", "28.5")'),
});

export const researchSchema = z.object({
  summary: z
    .string()
    .min(50)
    .describe('Comprehensive 3-5 sentence summary of the company, its business model, and current state'),
  financials: z
    .array(financialMetricSchema)
    .describe('Key financial metrics as an array of {metric, value} pairs'),
  competitors: z
    .array(z.string())
    .min(1)
    .describe('List of primary competitors or comparable companies'),
  sentiment: z
    .string()
    .min(20)
    .describe('Overall market/analyst sentiment toward the company, including any notable recent shifts'),
  sources: z
    .array(sourceSchema)
    .describe('Sources used in research — titles and URLs'),
  lowDataConfidence: z
    .boolean()
    .describe('True if fewer than 2 usable high-quality sources were found, indicating limited data reliability'),
});

// ─── Memo Schema ─────────────────────────────────────────────

export const keyMetricSchema = z.object({
  metric: z.string().describe('Name of the key metric'),
  value: z.string().describe('Value of the metric as a string'),
});

export const memoSchema = z.object({
  thesis: z
    .string()
    .min(30)
    .describe('One-paragraph investment thesis summarizing the core opportunity or concern'),
  strengths: z
    .array(z.string())
    .min(1)
    .describe('Key strengths and competitive advantages (3-5 bullet points)'),
  weaknesses: z
    .array(z.string())
    .min(1)
    .describe('Key weaknesses, risks, and concerns (2-5 bullet points)'),
  keyMetrics: z
    .array(keyMetricSchema)
    .describe('Important financial/business metrics highlighted from research as {metric, value} pairs'),
  dataConflict: z
    .boolean()
    .describe('True if the research contained clearly conflicting data points (e.g., contradictory revenue figures from different sources)'),
});

// ─── Bull/Bear Case Schema ───────────────────────────────────

export const argumentSchema = z.object({
  point: z.string().describe('The argument point being made'),
  evidence: z.string().describe('Specific evidence from the memo supporting this point'),
});

export const bullBearSchema = z.object({
  arguments: z
    .array(argumentSchema)
    .min(3)
    .max(5)
    .describe('3-5 arguments, each with a specific piece of supporting evidence from the memo'),
  strength: z
    .number()
    .min(0)
    .max(100)
    .describe('Self-assessed strength score 0-100, justified by the quality and specificity of evidence cited'),
});

// ─── Rebuttal Schema ─────────────────────────────────────────

export const rebuttalSchema = z.object({
  bullRebuttal: z
    .string()
    .min(20)
    .describe('Bull side\'s direct counter to the bear\'s single strongest argument, in 1-2 sentences'),
  bearRebuttal: z
    .string()
    .min(20)
    .describe('Bear side\'s direct counter to the bull\'s single strongest argument, in 1-2 sentences'),
  bullScoreAdjustment: z
    .number()
    .min(-10)
    .max(10)
    .optional()
    .describe('Optional adjustment to bull strength score based on rebuttal quality (-10 to +10)'),
  bearScoreAdjustment: z
    .number()
    .min(-10)
    .max(10)
    .optional()
    .describe('Optional adjustment to bear strength score based on rebuttal quality (-10 to +10)'),
});

// ─── Risk Flag Schema ────────────────────────────────────────

export const riskFlagSchema = z.object({
  label: z.string().describe('Short label for the risk (e.g., "Regulatory Risk", "Governance Red Flag")'),
  severity: z
    .enum(['low', 'medium', 'high', 'critical'])
    .describe('Severity level: low, medium, high, or critical'),
  detail: z
    .string()
    .min(10)
    .describe('One-sentence explanation of the specific risk with concrete basis from the research'),
});

export const riskAuditSchema = z.object({
  riskFlags: z
    .array(riskFlagSchema)
    .describe('List of identified risk flags. Empty array if nothing concerning was found.'),
});

// ─── Score Dimensions Schema (from LLM for memo-derived scores) ──

export const scoreDimensionsSchema = z.object({
  marketPosition: z
    .number()
    .min(0)
    .max(100)
    .describe('Market position & moat score (0-100) based on competitive advantages, market share, brand strength'),
  financialHealth: z
    .number()
    .min(0)
    .max(100)
    .describe('Financial health score (0-100) based on revenue, margins, debt, cash flow'),
  growthTrajectory: z
    .number()
    .min(0)
    .max(100)
    .describe('Growth trajectory score (0-100) based on revenue growth, market expansion, innovation pipeline'),
});

// ─── Verdict Narrative Schema ────────────────────────────────

export const verdictNarrativeSchema = z.object({
  thesisSummary: z
    .string()
    .min(50)
    .describe('One-paragraph plain-English synthesis of the full investment committee analysis, covering the key factors that drove the verdict'),
});

// ─── Helpers to convert between array-of-pairs and Record formats ──

/**
 * Converts an array of {metric, value} pairs to a Record<string, string|number>.
 * Used to normalize LLM output for the rest of the pipeline.
 *
 * @param {Array<{metric: string, value: string}>} pairs
 * @returns {Record<string, string|number>}
 */
export function pairsToRecord(pairs) {
  const record = {};
  for (const { metric, value } of pairs) {
    // Try to parse numeric values
    const num = Number(value);
    record[metric] = isNaN(num) ? value : num;
  }
  return record;
}
