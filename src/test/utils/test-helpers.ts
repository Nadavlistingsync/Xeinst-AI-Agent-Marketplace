import { render, RenderOptions } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { ReactElement } from 'react';

// Mock session for testing
export const mockSession = {
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
  status: 'authenticated' as const,
};

export const mockUnauthenticatedSession = {
  data: null,
  status: 'unauthenticated' as const,
};

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider session={mockSession}>
      {children}
    </SessionProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock API responses
export const mockApiResponse = (data: any, status = 200) => {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  };
};

// Mock API error response
export const mockApiError = (message: string, status = 500) => {
  return {
    ok: false,
    status,
    json: () => Promise.resolve({ error: message }),
    text: () => Promise.resolve(message),
  };
};

// Test data factories
export const createMockAgent = (overrides = {}) => ({
  id: 'test-agent-id',
  name: 'Test Agent',
  description: 'A test agent',
  model_type: 'gpt-4',
  framework: 'langchain',
  price: 10.99,
  download_count: 100,
  created_at: new Date().toISOString(),
  file_path: '/test/path',
  user_id: 'test-user-id',
  status: 'active',
  version: '1.0.0',
  category: 'productivity',
  tags: ['ai', 'automation'],
  rating: 4.5,
  review_count: 10,
  ...overrides,
});

export const createMockDeployment = (overrides = {}) => ({
  id: 'test-deployment-id',
  agent_id: 'test-agent-id',
  user_id: 'test-user-id',
  name: 'Test Deployment',
  description: 'A test deployment',
  status: 'active',
  environment: 'production',
  config: {
    max_concurrent_requests: 10,
    timeout: 30000,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockFeedback = (overrides = {}) => ({
  id: 'test-feedback-id',
  agent_id: 'test-agent-id',
  user_id: 'test-user-id',
  rating: 5,
  comment: 'Great agent!',
  category: 'performance',
  sentiment: 'positive',
  created_at: new Date().toISOString(),
  ...overrides,
});

// Wait for async operations
export const waitForAsync = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

// Mock environment variables
export const mockEnvVars = {
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  NEXTAUTH_SECRET: 'test-secret',
  NEXTAUTH_URL: 'http://localhost:3000',
  STRIPE_SECRET_KEY: 'sk_test_...',
  STRIPE_WEBHOOK_SECRET: 'whsec_test_...',
  UPSTASH_REDIS_REST_URL: 'https://test.upstash.io',
  UPSTASH_REDIS_REST_TOKEN: 'test-token',
};

// Setup test environment
export const setupTestEnv = () => {
  // Mock environment variables
  Object.entries(mockEnvVars).forEach(([key, value]) => {
    process.env[key] = value;
  });

  // Mock console methods to reduce noise in tests
  const originalConsole = { ...console };
  console.log = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();

  return () => {
    // Restore console methods
    Object.assign(console, originalConsole);
  };
};

// Export everything
export * from '@testing-library/react';
export { customRender as render }; 