import { invokeStructuredLLM } from '../../services/llm.service.js';
import { scoreDimensionsSchema } from '../../schemas/research.schema.js';

/**
 * Score Aggregator Node — gets LLM dimension scores, then applies
 * the deterministic verdict computation.
 *
 * The LLM ONLY scores 3 dimensions (market position, financial health, growth).
 * Everything else (bear-adjusted conviction, source quality, risk penalty,
 * verdict thresholds) is computed by pure deterministic code in computeVerdict().
 *
 * @param {import('../state.js').ICState} state
 * @returns {Promise<Partial<import('../state.js').ICState>>}
 */
export async function scoreAggregatorNode(state) {
  // Get dimension scores from LLM
  const dimensions = await scoreDimensions(state);

  // Run fully deterministic verdict computation
  const result = computeVerdict(state, dimensions);

  return {
    scores: result.scores,
    conviction: result.conviction,
    verdict: result.verdict,
    reasoningTrail: result.reasoningTrail,
  };
}

/**
 * Uses Gemini to score the 3 LLM-dependent dimensions.
 *
 * @param {import('../state.js').ICState} state
 * @returns {Promise<{marketPosition: number, financialHealth: number, growthTrajectory: number}>}
 */
async function scoreDimensions(state) {
  const prompt = `You are scoring a company on three investment dimensions based on its investment memo.

## Company: ${state.companyName}

## Memo:
${JSON.stringify(state.memo, null, 2)}

## Instructions:
Score each dimension from 0-100 based ONLY on evidence in the memo:

1. **marketPosition** (0-100): How strong is the company's competitive position? Consider market share, brand strength, switching costs, network effects, and barriers to entry. 50 = average, 70+ = strong moat, 30- = weak position.

2. **financialHealth** (0-100): How healthy are the company's finances? Consider revenue trends, profitability, margins, debt levels, and cash flow. 50 = adequate, 70+ = excellent, 30- = distressed.

3. **growthTrajectory** (0-100): What is the growth outlook? Consider revenue growth rate, market expansion potential, innovation pipeline, and TAM. 50 = moderate growth, 70+ = strong growth, 30- = declining.

Be calibrated: most companies should score between 35 and 75. Only exceptional companies score 80+. Only genuinely distressed companies score below 25.`;

  try {
    const result = await invokeStructuredLLM({
      schema: scoreDimensionsSchema,
      prompt,
      tier: 'flash',
    });

    return {
      marketPosition: Math.max(0, Math.min(100, Math.round(result.marketPosition))),
      financialHealth: Math.max(0, Math.min(100, Math.round(result.financialHealth))),
      growthTrajectory: Math.max(0, Math.min(100, Math.round(result.growthTrajectory))),
    };
  } catch (err) {
    console.warn(`[Score Aggregator] All LLM scoring attempts failed, using conservative defaults: ${err.message}`);
    return { marketPosition: 50, financialHealth: 50, growthTrajectory: 50 };
  }
}

/**
 * Pure, deterministic verdict computation.
 * Weights: Market 25%, Financial 25%, Growth 20%, BearAdjusted 15%, SourceQuality 10%
 *
 * @param {import('../state.js').ICState} state
 * @param {{ marketPosition: number, financialHealth: number, growthTrajectory: number }} dimensions
 * @returns {{
 *   scores: import('../state.js').ICState['scores'],
 *   conviction: number,
 *   verdict: "Invest"|"Watchlist"|"Pass",
 *   reasoningTrail: string[]
 * }}
 */
export function computeVerdict(state, dimensions = null) {
  const trail = [];

  // --- Dimension scores (0-100 each) ---
  const marketPosition = dimensions?.marketPosition ?? 50;
  const financialHealth = dimensions?.financialHealth ?? 50;
  const growthTrajectory = dimensions?.growthTrajectory ?? 50;

  // Bear-Adjusted Conviction (15%)
  // normalize(bullStrength - bearStrength) from [-100,100] to [0,100]
  const bullStrength = state.bullCase?.strength ?? 50;
  const bearStrength = state.bearCase?.strength ?? 50;
  const rawDiff = bullStrength - bearStrength; // range [-100, 100]
  const bearAdjustedConviction = Math.round(((rawDiff + 100) / 200) * 100);
  trail.push(`[Score] Bear-Adjusted: bull(${bullStrength}) - bear(${bearStrength}) = ${rawDiff} → normalized ${bearAdjustedConviction}/100`);

  // Source Quality (10%)
  const sourceCount = state.research?.sources?.length ?? 0;
  const lowData = state.research?.lowDataConfidence ?? false;
  let sourceQuality;
  if (sourceCount <= 2) {
    sourceQuality = Math.min(40, sourceCount * 20);
  } else if (sourceCount <= 4) {
    sourceQuality = Math.min(70, 40 + (sourceCount - 2) * 15);
  } else {
    sourceQuality = Math.min(100, 70 + (sourceCount - 4) * 10);
  }
  if (lowData) sourceQuality = Math.min(sourceQuality, 40);
  trail.push(`[Score] Source Quality: ${sourceCount} sources, lowData=${lowData} → ${sourceQuality}/100`);

  // --- Weighted base score ---
  const baseScore =
    marketPosition * 0.25 +
    financialHealth * 0.25 +
    growthTrajectory * 0.20 +
    bearAdjustedConviction * 0.15 +
    sourceQuality * 0.10;

  trail.push(`[Score] Base score: ${baseScore.toFixed(1)} (market=${marketPosition}×.25 + financial=${financialHealth}×.25 + growth=${growthTrajectory}×.20 + bearAdj=${bearAdjustedConviction}×.15 + source=${sourceQuality}×.10)`);

  // --- Risk penalty ---
  const severities = (state.riskFlags || []).map(f => f.severity);
  const hasCritical = severities.includes('critical');
  const hasHigh = severities.includes('high');
  const hasMedium = severities.includes('medium');

  let riskPenalty = 0;
  if (hasCritical) {
    riskPenalty = 0; // critical is handled as override, not penalty
  } else if (hasHigh) {
    riskPenalty = 15;
  } else if (hasMedium) {
    riskPenalty = 8;
  }
  trail.push(`[Score] Risk penalty: -${riskPenalty} (highest severity: ${hasCritical ? 'critical' : hasHigh ? 'high' : hasMedium ? 'medium' : 'low/none'})`);

  // --- Conviction ---
  let conviction = Math.round(Math.max(0, Math.min(100, baseScore - riskPenalty)));

  // Low-data cap
  if (lowData && conviction > 60) {
    trail.push(`[Score] Low-data cap applied: ${conviction} → 60`);
    conviction = 60;
  }

  // --- Verdict ---
  let verdict;

  // Critical override
  if (hasCritical) {
    verdict = 'Pass';
    trail.push(`[Verdict] CRITICAL FLAG OVERRIDE — verdict forced to Pass regardless of conviction (${conviction}).`);
  } else if (conviction >= 65) {
    verdict = 'Invest';
    trail.push(`[Verdict] Conviction ${conviction} >= 65 → Invest.`);
  } else if (conviction >= 45) {
    verdict = 'Watchlist';
    trail.push(`[Verdict] Conviction ${conviction} in [45, 65) → Watchlist.`);
  } else {
    // conviction < 45
    if (hasHigh && conviction >= 40) {
      verdict = 'Watchlist';
      trail.push(`[Verdict] Conviction ${conviction} < 45 but high-severity flag + conviction >= 40 → Watchlist (ambiguous case).`);
    } else {
      verdict = 'Pass';
      trail.push(`[Verdict] Conviction ${conviction} < 45 → Pass.`);
    }
  }

  const scores = {
    marketPosition,
    financialHealth,
    growthTrajectory,
    bearAdjustedConviction,
    sourceQuality,
    riskPenalty,
  };

  return { scores, conviction, verdict, reasoningTrail: trail };
}
