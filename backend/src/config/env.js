import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the project root (two levels up from config/)
dotenv.config({ path: resolve(__dirname, '../../../.env') });

/** @type {{ GOOGLE_API_KEY: string, TAVILY_API_KEY: string, PORT: number, DATABASE_URL: string }} */
const env = {
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
  TAVILY_API_KEY: process.env.TAVILY_API_KEY || '',
  PORT: parseInt(process.env.PORT || '3001', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
};

/**
 * Validates that required environment variables are set.
 * Throws if any are missing.
 */
export function validateEnv() {
  const missing = [];
  if (!env.GOOGLE_API_KEY) missing.push('GOOGLE_API_KEY');
  if (!env.TAVILY_API_KEY) missing.push('TAVILY_API_KEY');

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}.\n` +
      `Copy .env.example to .env and fill in your API keys.`
    );
  }
}

export default env;
