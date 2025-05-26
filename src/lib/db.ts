import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.NEON_DATABASE_URL) {
  throw new Error('NEON_DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.NEON_DATABASE_URL);
export const db = drizzle(sql, { schema });

// Helper functions for common database operations
export async function query<T>(sql: string, params?: any[]): Promise<T[]> {
  const result = await sql.query(sql, params);
  return result.rows as T[];
}

export async function queryOne<T>(sql: string, params?: any[]): Promise<T | null> {
  const result = await sql.query(sql, params);
  return result.rows[0] as T || null;
}

export async function execute(sql: string, params?: any[]): Promise<void> {
  await sql.query(sql, params);
} 