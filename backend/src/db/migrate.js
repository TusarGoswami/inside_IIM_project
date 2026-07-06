#!/usr/bin/env node
/**
 * One-time migration script.
 * Creates the `runs` table if it does not exist.
 *
 * Usage:
 *   node src/db/migrate.js
 *   npm run db:migrate
 */
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
dotenv.config({ path: resolve(__dirname, '../../../.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in .env — cannot run migration.');
  process.exit(1);
}

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS runs (
  id UUID PRIMARY KEY,
  company_name TEXT NOT NULL,
  verdict TEXT NOT NULL,
  conviction INTEGER NOT NULL,
  result_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
`;

async function migrate() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });

  try {
    console.log('🔄 Running migration...');
    await pool.query(CREATE_TABLE_SQL);
    console.log('✅ Table "runs" is ready.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
