import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'travelx_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function migrate(): Promise<void> {
  const schema = fs.readFileSync(path.resolve(__dirname, '../../../database/schema.sql'), 'utf8');
  await pool.query(schema);
  console.log('Database schema applied.');
  await pool.end();
}

migrate().catch(async (error: unknown) => { console.error('Migration failed:', error); await pool.end(); process.exitCode = 1; });
