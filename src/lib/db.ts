import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export { prisma };

export async function query<T>(queryString: string, params?: any[]): Promise<T[]> {
  return await prisma.$queryRaw<T[]>(Prisma.sql([queryString], params || []))
}

export async function queryOne<T>(queryString: string, params?: any[]): Promise<T | null> {
  const results = await query<T>(queryString, params)
  return results[0] || null
}

export async function execute(queryString: string, params?: any[]): Promise<number> {
  const result = await prisma.$executeRaw(Prisma.sql([queryString], params || []))
  return result
}

export async function transaction<T>(
  queries: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    return await queries(tx);
  });
}

export async function transactionWithIsolation<T>(
  queries: (tx: PrismaClient) => Promise<T>,
  isolationLevel: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable'
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    return await queries(tx);
  }, {
    isolationLevel,
  });
}

export async function rawQuery<T>(queryString: string, params?: any[]): Promise<T[]> {
  return await prisma.$queryRaw<T[]>(Prisma.sql([queryString], params || []))
}

export async function rawExecute(queryString: string, params?: any[]): Promise<number> {
  const result = await prisma.$executeRaw(Prisma.sql([queryString], params || []))
  return result
}

export async function rawTransaction<T>(queries: (tx: PrismaClient) => Promise<T>): Promise<T> {
  return await prisma.$transaction(queries)
} 