/**
 * @typedef {"idle" | "researching" | "writing_memo" | "debating" | "auditing_risk" | "voting" | "completed" | "error"} Stage
 *
 * @typedef {Object} Source
 * @property {string} title
 * @property {string} url
 *
 * @typedef {Object} ResearchData
 * @property {string} summary
 * @property {Record<string, string|number>} financials
 * @property {string[]} competitors
 * @property {string} sentiment
 * @property {Source[]} sources
 * @property {boolean} lowDataConfidence
 *
 * @typedef {Object} MemoData
 * @property {string} thesis
 * @property {string[]} strengths
 * @property {string[]} weaknesses
 * @property {Record<string, string|number>} keyMetrics
 * @property {boolean} dataConflict
 *
 * @typedef {Object} DebateArgument
 * @property {string} point
 * @property {string} evidence
 *
 * @typedef {Object} DebateCase
 * @property {DebateArgument[]} arguments
 * @property {number} strength
 *
 * @typedef {Object} RebuttalData
 * @property {string} bullRebuttal
 * @property {string} bearRebuttal
 *
 * @typedef {Object} RiskFlag
 * @property {string} label
 * @property {"low"|"medium"|"high"|"critical"} severity
 * @property {string} detail
 *
 * @typedef {Object} ScoreBreakdown
 * @property {number} marketPosition
 * @property {number} financialHealth
 * @property {number} growthTrajectory
 * @property {number} bearAdjustedConviction
 * @property {number} sourceQuality
 * @property {number} riskPenalty
 *
 * @typedef {Object} FinalVerdictState
 * @property {string} companyName
 * @property {ResearchData} [research]
 * @property {MemoData} [memo]
 * @property {DebateCase} [bullCase]
 * @property {DebateCase} [bearCase]
 * @property {boolean} [rebuttalOccurred]
 * @property {RebuttalData} [rebuttal]
 * @property {RiskFlag[]} [riskFlags]
 * @property {ScoreBreakdown} [scores]
 * @property {number} [conviction]
 * @property {"Invest"|"Watchlist"|"Pass"} [verdict]
 * @property {string} [thesisSummary]
 * @property {string[]} [reasoningTrail]
 * @property {string} [error]
 */

export const STAGES = {
  IDLE: 'idle',
  RESEARCHING: 'researching',
  WRITING_MEMO: 'writing_memo',
  DEBATING: 'debating',
  AUDITING_RISK: 'auditing_risk',
  VOTING: 'voting',
  COMPLETED: 'completed',
  ERROR: 'error',
};
