/**
 * Phase 3 test — runs the real researcherNode + memoWriterNode pipeline
 * against 3 company names and inspects output quality.
 *
 * Prerequisites: .env file with GOOGLE_API_KEY and TAVILY_API_KEY
 *
 * Usage: node test-phase3.js
 */
import { researcherNode } from './src/graph/nodes/researcher.node.js';
import { memoWriterNode } from './src/graph/nodes/memoWriter.node.js';
import env, { validateEnv } from './src/config/env.js';

// Validate env before running
try {
  validateEnv();
} catch (err) {
  console.error('❌ ' + err.message);
  process.exit(1);
}

const TEST_COMPANIES = ['Tesla', 'Zomato', 'Paytm'];

async function testCompany(companyName) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  Testing: ${companyName}`);
  console.log(`${'═'.repeat(60)}\n`);

  // Step 1: Research
  const initialState = { companyName, reasoningTrail: [] };

  console.log('── Phase: Research ──');
  const researchResult = await researcherNode(initialState);
  const research = researchResult.research;

  console.log(`\n  Summary: ${research.summary.slice(0, 150)}...`);
  console.log(`  Financials: ${JSON.stringify(research.financials)}`);
  console.log(`  Competitors: ${research.competitors.join(', ')}`);
  console.log(`  Sources: ${research.sources.length}`);
  console.log(`  Low Data Confidence: ${research.lowDataConfidence}`);
  console.log(`  Sentiment: ${research.sentiment.slice(0, 100)}...`);

  // Step 2: Memo
  const stateWithResearch = {
    ...initialState,
    research,
    reasoningTrail: researchResult.reasoningTrail || [],
  };

  console.log('\n── Phase: Memo Writer ──');
  const memoResult = await memoWriterNode(stateWithResearch);
  const memo = memoResult.memo;

  console.log(`\n  Thesis: ${memo.thesis.slice(0, 200)}...`);
  console.log(`  Strengths (${memo.strengths.length}):`);
  memo.strengths.forEach(s => console.log(`    ✅ ${s}`));
  console.log(`  Weaknesses (${memo.weaknesses.length}):`);
  memo.weaknesses.forEach(w => console.log(`    ⚠️ ${w}`));
  console.log(`  Key Metrics: ${JSON.stringify(memo.keyMetrics)}`);
  console.log(`  Data Conflict: ${memo.dataConflict}`);

  // Validation checks
  const checks = [];
  checks.push({ name: 'Summary length >= 50', pass: research.summary.length >= 50 });
  checks.push({ name: 'Has financials', pass: Object.keys(research.financials).length > 0 });
  checks.push({ name: 'Has competitors', pass: research.competitors.length >= 1 });
  checks.push({ name: 'Has sources', pass: research.sources.length >= 1 });
  checks.push({ name: 'Memo thesis length >= 30', pass: memo.thesis.length >= 30 });
  checks.push({ name: 'Has strengths', pass: memo.strengths.length >= 1 });
  checks.push({ name: 'Has weaknesses', pass: memo.weaknesses.length >= 1 });
  checks.push({ name: 'Has keyMetrics', pass: Object.keys(memo.keyMetrics).length > 0 });

  console.log(`\n── Validation Checks ──`);
  let allPassed = true;
  for (const c of checks) {
    const icon = c.pass ? '✅' : '❌';
    console.log(`  ${icon} ${c.name}`);
    if (!c.pass) allPassed = false;
  }

  return { companyName, allPassed, research, memo };
}

async function main() {
  console.log('Phase 3 Test — Real Researcher + Memo Writer Pipeline');
  console.log(`Testing ${TEST_COMPANIES.length} companies against live APIs...\n`);

  const results = [];
  for (const company of TEST_COMPANIES) {
    try {
      const result = await testCompany(company);
      results.push(result);
    } catch (err) {
      console.error(`\n❌ FAILED for ${company}: ${err.message}`);
      results.push({ companyName: company, allPassed: false, error: err.message });
    }
  }

  // Summary
  console.log(`\n\n${'═'.repeat(60)}`);
  console.log('  SUMMARY');
  console.log(`${'═'.repeat(60)}`);
  for (const r of results) {
    const icon = r.allPassed ? '✅' : r.error ? '💥' : '⚠️';
    console.log(`  ${icon} ${r.companyName}: ${r.allPassed ? 'ALL CHECKS PASSED' : r.error || 'SOME CHECKS FAILED'}`);
  }

  const allGood = results.every(r => r.allPassed);
  if (allGood) {
    console.log('\n🎉 All companies passed all validation checks!');
  } else {
    console.log('\n⚠️ Some checks failed — review output above.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
