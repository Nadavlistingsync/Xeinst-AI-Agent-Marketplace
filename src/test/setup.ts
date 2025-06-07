import '@testing-library/jest-dom';
import { vi, beforeAll, afterEach } from 'vitest';
import React from 'react';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

// Set test environment using vi.stubEnv
vi.stubEnv('NODE_ENV', 'test');

// Suppress console.error in tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Only log errors that aren't from our error handling
  if (!args[0]?.includes('Database Error:')) {
    originalConsoleError(...args);
  }
};

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
    // Check if we can connect to the database
    await prismaClient.$connect();
    
    // Run migrations for test database
    execSync('npx prisma migrate deploy', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ai_agency_test',
        NODE_ENV: 'test',
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
    // Don't log the error in test environment
    // Just continue with mocked Prisma
  }
});

// Clean up after each test
afterEach(async () => {
  try {
    // Reset all mock functions
    Object.values(mockPrisma).forEach((value) => {
      if (typeof value === 'object' && value !== null) {
        Object.values(value).forEach((fn) => {
          if (typeof fn === 'function' && 'mockClear' in fn) {
            fn.mockClear();
          }
        });
      }
    });

    // Only attempt database cleanup if we're using a real connection
    if (prismaClient instanceof PrismaClient) {
      const tables = await prismaClient.$queryRaw<
        Array<{ tablename: string }>
      >`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations'`;
      
      for (const { tablename } of tables) {
        await prismaClient.$executeRawUnsafe(
          `TRUNCATE TABLE "public"."${tablename}" CASCADE;`
        );
      }
    }
  } catch (error) {
    console.error('Failed to clean up after test:', error);
    // Don't throw the error, just log it
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
  default: function Image(props: React.ComponentProps<'img'> & { fill?: boolean }) {
    // Convert boolean fill prop to string
    const imgProps = { ...props };
    if (typeof imgProps.fill === 'boolean') {
      const { fill, ...rest } = imgProps;
      return React.createElement('img', { ...rest, fill: fill.toString() });
    }
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', imgProps);
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