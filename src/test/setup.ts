import '@testing-library/jest-dom';
import { vi, beforeAll, afterAll, afterEach } from 'vitest';
import React from 'react';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

// Mock Prisma Client
const mockPrisma = {
  deployment: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  agentLog: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  agentMetrics: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  account: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  session: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  verificationToken: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  agentFeedback: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  $disconnect: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
  prisma: mockPrisma,
}));

// Export mock Prisma for tests
export const prisma = mockPrisma;

// Mock Sentry in tests
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  init: vi.fn(),
  setUser: vi.fn(),
  setTag: vi.fn(),
  setExtra: vi.fn(),
  addBreadcrumb: vi.fn(),
  Severity: {
    Error: 'error',
    Warning: 'warning',
    Info: 'info',
  },
}));

// Mock window.matchMedia
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Create a test database client
const prismaClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ai_agency_test',
    },
  },
});

// Global setup
beforeAll(async () => {
  try {
    // Run migrations for test database
    execSync('npx prisma migrate deploy', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
    });

    // Clean up the database before tests
    const tables = await prismaClient.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    for (const { tablename } of tables) {
      if (tablename !== '_prisma_migrations') {
        await prismaClient.$executeRawUnsafe(
          `TRUNCATE TABLE "public"."${tablename}" CASCADE;`
        );
      }
    }
  } catch (error) {
    console.error('Failed to set up test database:', error);
    throw error; // Fail fast if database setup fails
  }
});

// Global teardown
// afterAll(async () => {
//   try {
//     // Only disconnect if we're using a real Prisma client
//     if (prismaClient instanceof PrismaClient) {
//       await Promise.race([
//         prismaClient.$disconnect(),
//         new Promise((_, reject) => setTimeout(() => reject(new Error('Disconnect timeout')), 5000))
//       ]);
//     }
//   } catch (error) {
//     console.error('Failed to disconnect from database:', error);
//   }
// }, 10000); // Reduce timeout to 10 seconds

// Clean up after each test
afterEach(async () => {
  try {
    const tables = await prismaClient.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations'`;
    
    for (const { tablename } of tables) {
      await prismaClient.$executeRawUnsafe(
        `TRUNCATE TABLE "public"."${tablename}" CASCADE;`
      );
    }
  } catch (error) {
    console.error('Failed to clean up tables:', error);
    throw error; // Fail fast if cleanup fails
  }
});

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(() => Promise.resolve(null)),
  useSession: vi.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
}));

// Mock fetch
global.fetch = vi.fn();

// Mock next/image
vi.mock('next/image', () => ({
  default: function Image(props: React.ComponentProps<'img'>) {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', props);
  },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
})); 