/**
 * Test script to verify Zod retry-on-validation-failure behavior.
 * Simulates LLM schema validation failures on early attempts,
 * verifying that retry loops catch errors, log retry attempts, and recover or fail cleanly.
 *
 * Usage: node test-zod-retries.js
 */
import { z } from 'zod';

const testSchema = z.object({
  score: z.number().min(0).max(100),
  reason: z.string().min(10),
});

/**
 * Simulates a retry wrapper identical to the node retry pattern.
 */
async function runWithRetry(mockInvokeFn, maxRetries = 2) {
  let lastError = null;
  const attemptsLog = [];

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      attemptsLog.push(`Attempt ${attempt}: invoking...`);
      const rawResult = await mockInvokeFn(attempt);
      
      // Validate against Zod schema (same as structured output)
      const validated = testSchema.parse(rawResult);
      attemptsLog.push(`Attempt ${attempt}: SUCCESS`);
      return { success: true, data: validated, attemptsLog };
    } catch (err) {
      lastError = err;
      attemptsLog.push(`Attempt ${attempt}: FAILED (${err.message})`);
      if (attempt <= maxRetries) {
        attemptsLog.push(`[Retry ${attempt}/${maxRetries}] Retrying...`);
      }
    }
  }

  return { success: false, error: lastError?.message, attemptsLog };
}

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('TESTING ZOD RETRY-ON-FAILURE LOGIC');
  console.log('═══════════════════════════════════════════\n');

  // Scenario 1: Fails on attempt 1 (invalid score & short reason), succeeds on attempt 2
  console.log('--- Scenario 1: Fails on attempt 1, succeeds on attempt 2 ---');
  let calls = 0;
  const mockScenario1 = async (attempt) => {
    calls++;
    if (attempt === 1) {
      // Invalid schema output: score is string, reason is too short
      return { score: 'not-a-number', reason: 'short' };
    }
    // Valid output on attempt 2
    return { score: 85, reason: 'This is a valid detailed reasoning string.' };
  };

  const res1 = await runWithRetry(mockScenario1);
  console.log(res1.attemptsLog.join('\n'));
  console.log(`Result: ${res1.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Total attempts made: ${calls} (Expected: 2)\n`);

  // Scenario 2: Fails on attempts 1, 2, and 3 (exhausts all retries)
  console.log('--- Scenario 2: Fails all attempts (max 2 retries = 3 attempts total) ---');
  let calls2 = 0;
  const mockScenario2 = async () => {
    calls2++;
    return { score: -50, reason: 'bad' }; // Always invalid
  };

  const res2 = await runWithRetry(mockScenario2);
  console.log(res2.attemptsLog.join('\n'));
  console.log(`Result: ${!res2.success ? '✅ PASSED (Clean failure after retries)' : '❌ FAILED'}`);
  console.log(`Total attempts made: ${calls2} (Expected: 3)\n`);

  // Final assertions
  const p1 = res1.success && calls === 2;
  const p2 = !res2.success && calls2 === 3;

  if (p1 && p2) {
    console.log('🎉 Zod retry-on-failure logic verified successfully!');
  } else {
    console.error('❌ Retry logic verification failed.');
    process.exit(1);
  }
}

main();
