/**
 * Prompt for the Rebuttal Node.
 * Each side directly counters the other's strongest point.
 */
export const rebuttalPrompt = `You are moderating an investment committee debate. The bull and bear sides have each made their case. Now each side gets ONE rebuttal to directly counter the other side's STRONGEST argument.

## Company: {companyName}

## Bull Case (strength: {bullStrength}/100):
{bullCaseJson}

## Bear Case (strength: {bearStrength}/100):
{bearCaseJson}

## Instructions:
1. **bullRebuttal**: Write 1-2 sentences where the bull side directly counters the bear's single strongest argument (the one with the most damaging evidence). The bull should concede what's true but explain why it doesn't change the investment thesis, OR present counter-evidence from the cases above.

2. **bearRebuttal**: Write 1-2 sentences where the bear side directly counters the bull's single strongest argument. The bear should explain why the bull's best point is less compelling than it appears, OR point out what the bull is overlooking.

3. **bullScoreAdjustment**: Based on how well the bull's rebuttal landed against the bear's strongest point, suggest a score adjustment from -10 to +10:
   - Positive = the bull's rebuttal was compelling and weakens the bear case
   - Negative = the bull's rebuttal was weak and the bear's point stands
   - 0 = the rebuttal was adequate but didn't change the picture

4. **bearScoreAdjustment**: Same logic for the bear's rebuttal against the bull's strongest point.

Keep rebuttals sharp and specific. No generalities — reference the actual arguments and evidence from the cases above.`;
