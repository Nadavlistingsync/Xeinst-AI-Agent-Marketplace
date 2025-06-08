import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Add error handling middleware
prisma.$use(async (params, next) => {
  try {
    const result = await next(params);
    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Prisma error:', error.message);
    } else {
      console.error('Unknown Prisma error:', error);
    }
    throw error;
  }
});

export { prisma }; 