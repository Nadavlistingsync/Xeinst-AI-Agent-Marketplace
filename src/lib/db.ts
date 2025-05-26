import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

// Helper functions for common database operations
export async function query<T>(sql: string, params?: any[]): Promise<T[]> {
  const result = await db.execute(sql, params);
  return result as T[];
}

export async function queryOne<T>(sql: string, params?: any[]): Promise<T | null> {
  const result = await db.execute(sql, params);
  return (result as T[])[0] || null;
}

export async function execute(sql: string, params?: any[]): Promise<void> {
  await db.execute(sql, params);
} 