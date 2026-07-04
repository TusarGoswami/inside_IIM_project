/**
 * Quick single-company test for Phase 3 — researcher + memoWriter only.
 * Usage: node test-phase3-quick.js
 */
import { researcherNode } from './src/graph/nodes/researcher.node.js';
import { memoWriterNode } from './src/graph/nodes/memoWriter.node.js';
import { validateEnv } from './src/config/env.js';

try { validateEnv(); } catch (err) { console.error('❌ ' + err.message); process.exit(1); }

async function main() {
  const companyName = 'Tesla';
  console.log(`\nTesting researcher + memoWriter for "${companyName}"...\n`);

  // Research
  console.log('── Step 1: Research ──');
  const t0 = Date.now();
  const researchResult = await researcherNode({ companyName, reasoningTrail: [] });
  console.log(`  Done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  console.log(`  Summary: ${researchResult.research.summary.slice(0, 200)}`);
  console.log(`  Sources: ${researchResult.research.sources.length}`);
  console.log(`  lowDataConfidence: ${researchResult.research.lowDataConfidence}`);
  console.log(`  Financials keys: ${Object.keys(researchResult.research.financials).join(', ')}`);
  console.log(`  Competitors: ${researchResult.research.competitors.join(', ')}`);

  // Memo
  console.log('\n── Step 2: Memo Writer ──');
  const t1 = Date.now();
  const memoResult = await memoWriterNode({
    companyName,
    research: researchResult.research,
    reasoningTrail: researchResult.reasoningTrail || [],
  });
  console.log(`  Done in ${((Date.now() - t1) / 1000).toFixed(1)}s`);
  console.log(`  Thesis: ${memoResult.memo.thesis.slice(0, 200)}`);
  console.log(`  Strengths: ${memoResult.memo.strengths.length}`);
  memoResult.memo.strengths.forEach(s => console.log(`    ✅ ${s}`));
  console.log(`  Weaknesses: ${memoResult.memo.weaknesses.length}`);
  memoResult.memo.weaknesses.forEach(w => console.log(`    ⚠️  ${w}`));
  console.log(`  Key Metrics: ${JSON.stringify(memoResult.memo.keyMetrics, null, 2)}`);
  console.log(`  Data Conflict: ${memoResult.memo.dataConflict}`);

  console.log('\n✅ Pipeline completed successfully!');
}

main().catch(err => {
  console.error('\n💥 Pipeline failed:', err);
  process.exit(1);
});
