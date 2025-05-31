import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient();
};

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export async function queryRaw<T>(queryString: string, params?: any[]): Promise<T[]> {
  return await prisma.$queryRaw<T[]>(Prisma.sql([queryString], params || []));
}

export async function executeRaw(queryString: string, params?: any[]): Promise<number> {
  const result = await prisma.$executeRaw(Prisma.sql([queryString], params || []));
  return result;
}

export async function transaction<T>(queries: (tx: PrismaClient) => Promise<T>): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    return await queries(tx);
  });
}

export async function queryRawUnsafe<T>(queryString: string, params?: any[]): Promise<T[]> {
  return await prisma.$queryRaw<T[]>(Prisma.sql([queryString], params || []));
}

export async function executeRawUnsafe(queryString: string, params?: any[]): Promise<number> {
  const result = await prisma.$executeRaw(Prisma.sql([queryString], params || []));
  return result;
}

export async function transactionUnsafe<T>(queries: (tx: PrismaClient) => Promise<T>): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    return await queries(tx);
  });
}

export default prisma; 