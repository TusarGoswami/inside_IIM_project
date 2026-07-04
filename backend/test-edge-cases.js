/**
 * Edge-case tests for computeVerdict() — the deterministic scoring function.
 * 
 * Test 1: Critical risk flag → verdict forced to Pass regardless of score.
 * Test 2: lowDataConfidence → conviction capped at 60 even if raw score is higher.
 * 
 * Usage: node test-edge-cases.js
 */
import { computeVerdict } from './src/graph/nodes/scoreAggregator.node.js';

// Realistic dimension scores to use across tests
const highDimensions = { marketPosition: 75, financialHealth: 72, growthTrajectory: 70 };
const highLowDataDimensions = { marketPosition: 75, financialHealth: 75, growthTrajectory: 75 };

// ──────────────────────────────────────────────
// TEST 1: Critical flag override
// ──────────────────────────────────────────────
console.log('═══════════════════════════════════════════');
console.log('TEST 1: Critical Risk Flag Override');
console.log('═══════════════════════════════════════════\n');

const criticalState = {
  companyName: 'HighScoreButCriticalRisk Corp',
  research: {
    summary: 'Great company on the surface.',
    financials: { revenue: '$50B' },
    competitors: ['CompA'],
    sentiment: 'Positive',
    sources: [
      { title: 'Source 1', url: 'https://example.com/1' },
      { title: 'Source 2', url: 'https://example.com/2' },
      { title: 'Source 3', url: 'https://example.com/3' },
      { title: 'Source 4', url: 'https://example.com/4' },
      { title: 'Source 5', url: 'https://example.com/5' },
    ],
    lowDataConfidence: false,
  },
  memo: { thesis: 'Strong', strengths: ['A'], weaknesses: [], keyMetrics: {}, dataConflict: false },
  bullCase: { arguments: [], strength: 90 },  // very strong bull
  bearCase: { arguments: [], strength: 30 },  // weak bear → big gap favoring bull
  riskFlags: [
    { label: 'Minor Issue', severity: 'low', detail: 'Nothing major.' },
    { label: 'SEC Investigation', severity: 'critical', detail: 'Active SEC fraud investigation against CEO.' },
  ],
};

const result1 = computeVerdict(criticalState, highDimensions);

console.log(`Conviction score: ${result1.conviction}`);
console.log(`Verdict:          ${result1.verdict}`);
console.log(`\nReasoning trail:`);
result1.reasoningTrail.forEach(r => console.log(`  • ${r}`));

// Assertions
const test1Pass = result1.verdict === 'Pass';
console.log(`\n✅ ASSERTION: verdict === "Pass"  →  ${test1Pass ? 'PASSED' : '❌ FAILED'}`);
const test1ScoreHigh = result1.conviction > 60;
console.log(`✅ ASSERTION: conviction > 60 (it's ${result1.conviction}, proving override isn't just a low score)  →  ${test1ScoreHigh ? 'PASSED' : '❌ FAILED'}`);


// ──────────────────────────────────────────────
// TEST 2: Low data confidence cap
// ──────────────────────────────────────────────
console.log('\n\n═══════════════════════════════════════════');
console.log('TEST 2: Low Data Confidence Cap at 60');
console.log('═══════════════════════════════════════════\n');

const lowDataState = {
  companyName: 'ObscureStartup Inc',
  research: {
    summary: 'Promising startup but limited public info.',
    financials: { revenue: 'Unknown' },
    competitors: ['CompX'],
    sentiment: 'Mixed',
    sources: [
      { title: 'Blog Post', url: 'https://example.com/blog' },
    ],
    lowDataConfidence: true,   // ← This is the key flag
  },
  memo: { thesis: 'Promising', strengths: ['A', 'B'], weaknesses: ['C'], keyMetrics: {}, dataConflict: false },
  bullCase: { arguments: [], strength: 85 },   // very strong bull
  bearCase: { arguments: [], strength: 25 },   // weak bear
  riskFlags: [
    { label: 'Data Reliability', severity: 'low', detail: 'Limited public data available.' },
  ],
};

const result2 = computeVerdict(lowDataState, highLowDataDimensions);

console.log(`Conviction score: ${result2.conviction}`);
console.log(`Verdict:          ${result2.verdict}`);
console.log(`\nScores breakdown:`);
console.log(`  Market Position:        ${result2.scores.marketPosition}`);
console.log(`  Financial Health:       ${result2.scores.financialHealth}`);
console.log(`  Growth Trajectory:      ${result2.scores.growthTrajectory}`);
console.log(`  Bear-Adjusted:          ${result2.scores.bearAdjustedConviction}`);
console.log(`  Source Quality:          ${result2.scores.sourceQuality}`);
console.log(`  Risk Penalty:           -${result2.scores.riskPenalty}`);

console.log(`\nReasoning trail:`);
result2.reasoningTrail.forEach(r => console.log(`  • ${r}`));

// Calculate what the uncapped score would be
const uncapped = 
  result2.scores.marketPosition * 0.25 +
  result2.scores.financialHealth * 0.25 +
  result2.scores.growthTrajectory * 0.20 +
  result2.scores.bearAdjustedConviction * 0.15 +
  result2.scores.sourceQuality * 0.10 -
  result2.scores.riskPenalty;

console.log(`\nUncapped base score would be: ${uncapped.toFixed(1)}`);

// Assertions
const test2Capped = result2.conviction <= 60;
console.log(`\n✅ ASSERTION: conviction <= 60  →  ${test2Capped ? 'PASSED' : '❌ FAILED'}`);
const test2WouldBeHigher = uncapped > 60;
console.log(`✅ ASSERTION: uncapped score > 60 (it's ${uncapped.toFixed(1)}, proving cap actually triggered)  →  ${test2WouldBeHigher ? 'PASSED' : '❌ FAILED'}`);

// Check the reasoning trail mentions the cap
const capMentioned = result2.reasoningTrail.some(r => r.includes('Low-data cap'));
console.log(`✅ ASSERTION: reasoning trail mentions "Low-data cap"  →  ${capMentioned ? 'PASSED' : '❌ FAILED'}`);


// ──────────────────────────────────────────────
// Summary
// ──────────────────────────────────────────────
console.log('\n\n═══════════════════════════════════════════');
console.log('SUMMARY');
console.log('═══════════════════════════════════════════');
const allPassed = test1Pass && test1ScoreHigh && test2Capped && test2WouldBeHigher && capMentioned;
if (allPassed) {
  console.log('🎉 All 5 assertions PASSED.');
} else {
  console.log('⚠️  Some assertions FAILED — review output above.');
  process.exit(1);
}
