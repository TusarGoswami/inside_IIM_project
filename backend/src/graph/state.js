import { Annotation } from '@langchain/langgraph';

/**
 * @typedef {Object} ICState
 * @property {string} companyName
 * @property {{
 *   summary: string,
 *   financials: Record<string, string|number>,
 *   competitors: string[],
 *   sentiment: string,
 *   sources: { title: string, url: string }[],
 *   lowDataConfidence: boolean
 * } | null} research
 * @property {{
 *   thesis: string,
 *   strengths: string[],
 *   weaknesses: string[],
 *   keyMetrics: Record<string, string|number>,
 *   dataConflict: boolean
 * } | null} memo
 * @property {{ arguments: { point: string, evidence: string }[], strength: number } | null} bullCase
 * @property {{ arguments: { point: string, evidence: string }[], strength: number } | null} bearCase
 * @property {boolean} rebuttalOccurred
 * @property {{ bullRebuttal: string, bearRebuttal: string } | null} rebuttal
 * @property {{ label: string, severity: "low"|"medium"|"high"|"critical", detail: string }[]} riskFlags
 * @property {{
 *   marketPosition: number,
 *   financialHealth: number,
 *   growthTrajectory: number,
 *   bearAdjustedConviction: number,
 *   sourceQuality: number,
 *   riskPenalty: number
 * } | null} scores
 * @property {number | null} conviction
 * @property {"Invest"|"Watchlist"|"Pass" | null} verdict
 * @property {string | null} thesisSummary
 * @property {string[]} reasoningTrail
 * @property {string | null} error
 */

/**
 * LangGraph state annotation for the Investment Committee workflow.
 * Each channel corresponds to a field in ICState.
 * Uses default reducers (last-write-wins) for all fields except
 * reasoningTrail which appends entries.
 */
export const ICStateAnnotation = Annotation.Root({
  companyName: Annotation({
    reducer: (_, next) => next,
    default: () => '',
  }),

  research: Annotation({
    reducer: (_, next) => next,
    default: () => null,
  }),

  memo: Annotation({
    reducer: (_, next) => next,
    default: () => null,
  }),

  bullCase: Annotation({
    reducer: (_, next) => next,
    default: () => null,
  }),

  bearCase: Annotation({
    reducer: (_, next) => next,
    default: () => null,
  }),

  rebuttalOccurred: Annotation({
    reducer: (_, next) => next,
    default: () => false,
  }),

  rebuttal: Annotation({
    reducer: (_, next) => next,
    default: () => null,
  }),

  riskFlags: Annotation({
    reducer: (_, next) => next,
    default: () => [],
  }),

  scores: Annotation({
    reducer: (_, next) => next,
    default: () => null,
  }),

  conviction: Annotation({
    reducer: (_, next) => next,
    default: () => null,
  }),

  verdict: Annotation({
    reducer: (_, next) => next,
    default: () => null,
  }),

  thesisSummary: Annotation({
    reducer: (_, next) => next,
    default: () => null,
  }),

  reasoningTrail: Annotation({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),

  error: Annotation({
    reducer: (_, next) => next,
    default: () => null,
  }),
});
