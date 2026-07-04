/**
 * Test script — runs the stubbed graph START→END and prints the final state.
 * Usage: node test-graph.js
 */
import { buildGraph } from './src/graph/graph.js';

async function main() {
  console.log('=== Building graph... ===');
  const app = buildGraph();

  console.log('=== Running graph with stubs for "Tesla"... ===\n');

  // Stream events to verify each node fires in the correct order
  const stream = await app.stream(
    { companyName: 'Tesla' },
    { streamMode: 'updates' }
  );

  let stepCount = 0;
  let finalState = {};

  for await (const event of stream) {
    stepCount++;
    const [nodeName] = Object.keys(event);
    console.log(`Step ${stepCount}: ${nodeName}`);
    console.log(`  Keys updated: ${Object.keys(event[nodeName]).join(', ')}`);

    // Merge into final state for inspection
    Object.assign(finalState, event[nodeName]);
  }

  console.log('\n=== Graph completed ===');
  console.log(`Total steps: ${stepCount}`);
  console.log(`\nFinal verdict: ${finalState.verdict}`);
  console.log(`Conviction: ${finalState.conviction}`);
  console.log(`Rebuttal occurred: ${finalState.rebuttalOccurred}`);
  console.log(`\nReasoning trail:`);
  if (Array.isArray(finalState.reasoningTrail)) {
    finalState.reasoningTrail.forEach(r => console.log(`  • ${r}`));
  }
  console.log(`\nThesis: ${finalState.thesisSummary}`);
  console.log('\n=== Full final state (JSON) ===');
  console.log(JSON.stringify(finalState, null, 2));
}

main().catch(err => {
  console.error('Graph test failed:', err);
  process.exit(1);
});
