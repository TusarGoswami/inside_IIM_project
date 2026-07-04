/**
 * Script to capture real output runs and save them into docs/example-runs/
 * for documentation and demonstration.
 *
 * Usage: node capture-example-run.js
 */
import fs from 'fs';
import path from 'path';
import { buildGraph } from './src/graph/graph.js';

const OUTPUT_DIR = path.resolve(process.cwd(), '../docs/example-runs');

async function captureRun(companyName, filename) {
  console.log(`\n=================================================`);
  console.log(`  Capturing IC Analysis for: ${companyName}`);
  console.log(`=================================================\n`);

  const app = buildGraph();
  const stream = await app.stream(
    { companyName },
    { streamMode: 'updates' }
  );

  const finalState = {};

  for await (const event of stream) {
    const [nodeName] = Object.keys(event);
    console.log(`✔ Node Completed: ${nodeName}`);
    Object.assign(finalState, event[nodeName]);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(finalState, null, 2), 'utf8');

  console.log(`\n🎉 Saved ${companyName} run to: ${filePath}`);
  console.log(`   Verdict: ${finalState.verdict}`);
  console.log(`   Conviction: ${finalState.conviction}/100`);
  console.log(`   Risk Penalty: -${finalState.scores?.riskPenalty || 0}`);
}

async function main() {
  await captureRun('Tesla', 'tesla_run.json');
  await captureRun('Paytm', 'paytm_run.json');
}

main().catch(err => {
  console.error('Failed to capture runs:', err);
});
