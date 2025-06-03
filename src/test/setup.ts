import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });
console.log('Loaded DATABASE_URL:', process.env.DATABASE_URL);
import '@testing-library/jest-dom';
import { vi, beforeAll, afterAll, afterEach } from 'vitest';
import React from 'react';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

// Set test environment
process.env.NODE_ENV = 'test' as const;
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ai_agency_test';

// Mock Sentry in tests
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  init: vi.fn(),
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
const prisma = new PrismaClient({
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
    const tables = await prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    for (const { tablename } of tables) {
      if (tablename !== '_prisma_migrations') {
        await prisma.$executeRawUnsafe(
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
afterAll(async () => {
  await prisma.$disconnect();
});

// Clean up after each test
afterEach(async () => {
  try {
    const tables = await prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations'`;
    
    for (const { tablename } of tables) {
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "public"."${tablename}" CASCADE;`
      );
    }
  } catch (error) {
    console.error('Failed to clean up tables:', error);
    throw error; // Fail fast if cleanup fails
  }
});

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));

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

// Export test utilities
export { prisma }; 