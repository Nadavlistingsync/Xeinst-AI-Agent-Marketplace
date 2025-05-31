import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export type DbClient = typeof prisma;

// Helper functions for common database operations
export async function query<T>(queryString: string, params?: any[]): Promise<T[]> {
  return prisma.$queryRaw<T[]>(queryString, ...(params || []));
}

export async function queryOne<T>(queryString: string, params?: unknown[]): Promise<T | null> {
  const result = await prisma.$queryRaw<T[]>(queryString, ...(params || []));
  return result[0] || null;
}

export async function execute(queryString: string, params?: any[]): Promise<void> {
  await prisma.$executeRaw(queryString, ...(params || []));
}

export async function executeQuery(query: string, params: unknown[] = []) {
  try {
    return await prisma.$queryRaw(query, ...params);
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

export async function transaction<T>(queries: (tx: PrismaClient) => Promise<T>): Promise<T> {
  return await prisma.$transaction(queries);
} 