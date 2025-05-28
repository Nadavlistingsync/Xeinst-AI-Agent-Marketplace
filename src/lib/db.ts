import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { schema } from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

export type DbClient = typeof db;

// Helper functions for common database operations
export async function query<T>(queryString: string, params?: any[]): Promise<T[]> {
  const result = await sql.query(queryString, params);
  return result as T[];
}

export async function queryOne<T>(queryString: string, params?: any[]): Promise<T | null> {
  const result = await sql.query(queryString, params);
  return (result as T[])[0] || null;
}

export async function execute(queryString: string, params?: any[]): Promise<void> {
  await sql.query(queryString, params);
}

export async function executeQuery(query: string, params: any[] = []) {
  try {
    const result = await sql.query(query, params);
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

export async function executeTransaction(queries: { query: string; params: any[] }[]) {
  try {
    const result = await (sql.transaction as any)(async (tx: any) => {
      const results = [];
      for (const { query, params } of queries) {
        const result = await tx.query(query, params);
        results.push(result);
      }
      return results;
    });
    return result;
  } catch (error) {
    console.error('Error executing transaction:', error);
    throw error;
  }
} 