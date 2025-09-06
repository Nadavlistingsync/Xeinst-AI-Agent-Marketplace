import '@testing-library/jest-dom';
import { vi, beforeAll, afterEach } from 'vitest';
import React from 'react';
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

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        credits: 100,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    status: 'authenticated',
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock framer-motion
vi.mock('framer-motion', () => {
  const createMockComponent = (tag: string) => {
    return React.forwardRef(({ children, ...props }: any, ref: any) => {
      return React.createElement(tag, { ...props, ref }, children);
    });
  };

  const motionComponents: any = {};
  const htmlElements = [
    'div', 'button', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'li', 'nav', 'section', 'article', 'aside', 'header', 'footer',
    'main', 'form', 'input', 'textarea', 'select', 'option', 'label',
    'a', 'img', 'svg', 'path', 'circle', 'rect', 'line', 'polyline',
    'polygon', 'ellipse', 'g', 'defs', 'clipPath', 'linearGradient',
    'radialGradient', 'stop', 'pattern', 'mask', 'filter', 'feGaussianBlur',
    'feOffset', 'feComposite', 'feMerge', 'feMergeNode', 'feFlood',
    'feColorMatrix', 'feBlend', 'feMorphology', 'feDisplacementMap',
    'feTurbulence', 'feDiffuseLighting', 'feSpecularLighting', 'feDistantLight',
    'fePointLight', 'feSpotLight', 'feConvolveMatrix', 'feImage', 'feTile',
    'feComponentTransfer', 'feFuncR', 'feFuncG', 'feFuncB', 'feFuncA', 'feDropShadow'
  ];

  htmlElements.forEach(tag => {
    motionComponents[tag] = createMockComponent(tag);
  });

  const AnimatePresence = ({ children, ...props }: any) => React.createElement('div', props, children);

  return {
    motion: motionComponents,
    AnimatePresence,
    useAnimation: () => ({
      start: vi.fn(),
      stop: vi.fn(),
      set: vi.fn(),
    }),
    useAnimationControls: () => ({
      start: vi.fn(),
      stop: vi.fn(),
      set: vi.fn(),
    }),
    useMotionValue: (initial: any) => ({
      get: () => initial,
      set: vi.fn(),
      on: vi.fn(),
    }),
    useTransform: (value: any, input: any, output: any) => ({
      get: () => output,
      set: vi.fn(),
      on: vi.fn(),
    }),
    useSpring: (value: any, config: any) => ({
      get: () => value,
      set: vi.fn(),
      on: vi.fn(),
    }),
    useMotionValueEvent: vi.fn(),
    useInView: () => ({ ref: vi.fn(), inView: false }),
    useScroll: () => ({
      scrollX: { get: () => 0, on: vi.fn() },
      scrollY: { get: () => 0, on: vi.fn() },
      scrollXProgress: { get: () => 0, on: vi.fn() },
      scrollYProgress: { get: () => 0, on: vi.fn() },
    }),
    useScrollControls: () => ({
      scrollTo: vi.fn(),
      scrollToTop: vi.fn(),
      scrollToBottom: vi.fn(),
    }),
    useCycle: (...args: any[]) => [args[0], vi.fn()],
    useReducedMotion: () => false,
    usePresence: () => ({ isPresent: true, safeToRemove: vi.fn() }),
    useIsPresent: () => true,
    useAnimate: () => [vi.fn(), vi.fn()],
    useMotionTemplate: (template: any) => template,
    LazyMotion: ({ children }: any) => children,
    domAnimation: {},
    domTransition: {},
  };
});

// Mock IntersectionObserver for framer-motion
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

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
    findFirst: vi.fn(),
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
  agent: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  $disconnect: vi.fn().mockResolvedValue(undefined),
};

// Patch: ensure error classes are reference-equal between @prisma/client and @prisma/client/runtime/library
const errorClassPatch: any = {};
vi.mock('@prisma/client', () => {
  // Mock DeploymentStatus enum as used in the codebase
  const DeploymentStatus = {
    pending: 'pending',
    deploying: 'deploying',
    active: 'active',
    failed: 'failed',
    stopped: 'stopped',
  };

  // Mock Prisma error classes
  class PrismaClientKnownRequestError extends Error {
    code: string;
    clientVersion: string;
    meta: any;
    constructor(message: string, { code, clientVersion, meta }: { code: string; clientVersion: string; meta: any }) {
      super(message);
      this.code = code;
      this.clientVersion = clientVersion;
      this.meta = meta;
      this.name = 'PrismaClientKnownRequestError';
    }
  }
  class PrismaClientValidationError extends Error {
    clientVersion: string;
    constructor(message: string, { clientVersion }: { clientVersion: string }) {
      super(message);
      this.clientVersion = clientVersion;
      this.name = 'PrismaClientValidationError';
    }
  }
  class PrismaClientInitializationError extends Error {
    clientVersion: string;
    constructor(message: string, { clientVersion }: { clientVersion: string }) {
      super(message);
      this.clientVersion = clientVersion;
      this.name = 'PrismaClientInitializationError';
    }
  }
  // Patch for reference equality
  errorClassPatch.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
  errorClassPatch.PrismaClientValidationError = PrismaClientValidationError;
  errorClassPatch.PrismaClientInitializationError = PrismaClientInitializationError;

  const Prisma = {
    PrismaClientKnownRequestError,
    PrismaClientValidationError,
  };

  return {
    PrismaClient: vi.fn(() => mockPrisma),
    DeploymentStatus,
    Prisma,
  };
});

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

// Global setup
beforeAll(async () => {
  try {
    // Generate Prisma client
    execSync('pnpm prisma generate', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ai_agency_test',
        NODE_ENV: 'test',
      },
    });
  } catch (error) {
    console.error('Failed to generate Prisma client:', error);
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
  } catch (error) {
    console.error('Failed to clean up after test:', error);
  }
});

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
  toast: vi.fn(),
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

// Mock @prisma/client/runtime/library for error instanceof checks in db.ts
vi.mock('@prisma/client/runtime/library', () => {
  return {
    PrismaClientKnownRequestError: errorClassPatch.PrismaClientKnownRequestError,
    PrismaClientValidationError: errorClassPatch.PrismaClientValidationError,
    PrismaClientInitializationError: errorClassPatch.PrismaClientInitializationError,
  };
}); 