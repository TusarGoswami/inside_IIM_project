import env from './src/config/env.js';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

async function invokeWithRetry(prompt) {
  const llm = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash',
    apiKey: env.GOOGLE_API_KEY,
    temperature: 0.2,
  });

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`[Attempt ${attempt}] Invoking Gemini...`);
      const res = await llm.invoke(prompt);
      return res.content;
    } catch (err) {
      console.warn(`[Attempt ${attempt}] Failed: ${err.message.slice(0, 120)}...`);
      
      if (err.status === 429 || err.message?.includes('429')) {
        // Extract retryDelay if available (e.g. "29s")
        let delaySec = 15;
        const details = err.errorDetails || [];
        const retryInfo = details.find(d => d['@type']?.includes('RetryInfo'));
        if (retryInfo?.retryDelay) {
          delaySec = parseInt(retryInfo.retryDelay, 10) || 15;
        }

        console.log(`[Rate Limit 429] Waiting ${delaySec + 2}s for quota window to reset...`);
        await new Promise(r => setTimeout(r, (delaySec + 2) * 1000));
      } else {
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  throw new Error('Exhausted all retries.');
}

async function main() {
  console.log('Testing rate limit auto-wait logic...');
  const reply = await invokeWithRetry('Hello, return the word SUCCESS.');
  console.log('🎉 Reply received:', reply);
}

main().catch(console.error);
