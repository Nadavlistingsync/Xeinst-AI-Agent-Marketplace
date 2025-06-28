# Testing Guide for AI Agency Website

This guide covers all aspects of testing for the AI Agency Website project, including unit tests, integration tests, end-to-end tests, and performance testing.

## 🚀 Quick Start

### Run All Tests
```bash
# Run all tests
pnpm test:all

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui
```

### Run Specific Test Types
```bash
# Unit tests only
pnpm test:unit

# Component tests only
pnpm test:components

# API tests only
pnpm test:api

# Library/utility tests only
pnpm test:lib

# End-to-end tests only
pnpm test:e2e

# Integration tests (API + Library)
pnpm test:integration
```

## 📁 Test Structure

```
src/test/
├── components/          # React component tests
│   ├── HomePage.test.tsx
│   ├── MarketplacePage.test.tsx
│   └── ...
├── api/                # API endpoint tests
│   ├── agents.test.ts
│   ├── health.test.ts
│   └── ...
├── lib/                # Library/utility tests
│   ├── validation.test.ts
│   ├── auth.test.ts
│   └── ...
├── e2e/                # End-to-end tests
│   ├── health-check.test.ts
│   └── ...
├── utils/              # Test utilities and helpers
│   └── test-helpers.ts
└── setup.ts            # Global test setup
```

## 🧪 Test Types

### 1. Unit Tests
Test individual functions, components, and utilities in isolation.

**Examples:**
- Component rendering
- Utility functions
- Validation schemas
- Helper functions

**Run with:**
```bash
pnpm test:unit
```

### 2. Component Tests
Test React components with mocked dependencies.

**Examples:**
- Page components
- UI components
- Form components
- Interactive components

**Run with:**
```bash
pnpm test:components
```

### 3. API Tests
Test API endpoints with mocked database and external services.

**Examples:**
- GET/POST endpoints
- Error handling
- Authentication
- Data validation

**Run with:**
```bash
pnpm test:api
```

### 4. Integration Tests
Test interactions between different parts of the system.

**Examples:**
- API + Database interactions
- Component + API interactions
- Authentication flows

**Run with:**
```bash
pnpm test:integration
```

### 5. End-to-End Tests
Test complete user workflows and system health.

**Examples:**
- Health check endpoints
- User registration flow
- Agent deployment process

**Run with:**
```bash
pnpm test:e2e
```

## 🛠️ Testing Tools

### Vitest
- Fast test runner
- TypeScript support
- Coverage reporting
- Watch mode

### Testing Library
- React component testing
- Accessibility testing
- User-centric testing

### MSW (Mock Service Worker)
- API mocking
- Network interception
- Realistic test scenarios

## 📝 Writing Tests

### Component Test Example
```typescript
import { render, screen } from '@/test/utils/test-helpers';
import { describe, it, expect } from 'vitest';
import HomePage from '@/app/page';

describe('HomePage', () => {
  it('renders hero section', () => {
    render(<HomePage />);
    
    expect(screen.getByText(/Transform Your Business/i)).toBeInTheDocument();
    expect(screen.getByText(/Explore Marketplace/i)).toBeInTheDocument();
  });
});
```

### API Test Example
```typescript
import { describe, it, expect, vi } from 'vitest';
import { GET } from '@/app/api/agents/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/test/setup';

describe('Agents API', () => {
  it('returns list of agents', async () => {
    const mockAgents = [/* test data */];
    (prisma.agent.findMany as any).mockResolvedValue(mockAgents);

    const request = new NextRequest('http://localhost:3000/api/agents');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.agents).toHaveLength(1);
  });
});
```

### Validation Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { agentSchema } from '@/lib/validation';

describe('agentSchema', () => {
  it('validates valid agent data', () => {
    const validAgent = {
      name: 'Test Agent',
      description: 'Test description',
      model_type: 'gpt-4',
      framework: 'langchain',
      price: 10.99,
      category: 'productivity',
    };

    const result = agentSchema.safeParse(validAgent);
    expect(result.success).toBe(true);
  });
});
```

## 🎯 Test Coverage

### Current Coverage Targets
- **Components**: 80%+
- **API Endpoints**: 90%+
- **Utilities**: 95%+
- **Overall**: 85%+

### Generate Coverage Report
```bash
pnpm test:coverage
```

This will generate:
- Console output with coverage summary
- HTML report in `coverage/` directory
- JSON report for CI/CD integration

## 🔧 Test Configuration

### Vitest Config (`vitest.config.ts`)
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.ts',
      ],
    },
  },
});
```

### Test Setup (`src/test/setup.ts`)
- Global mocks
- Environment setup
- Database mocking
- External service mocking

## 🚨 Common Testing Patterns

### 1. Mocking External Dependencies
```typescript
// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  useSession: () => mockSession,
}));

// Mock API calls
global.fetch = vi.fn();
```

### 2. Testing Async Operations
```typescript
it('handles async data loading', async () => {
  render(<AsyncComponent />);
  
  expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText(/Data loaded/i)).toBeInTheDocument();
  });
});
```

### 3. Testing Error States
```typescript
it('handles API errors', async () => {
  (global.fetch as any).mockRejectedValue(new Error('Network error'));
  
  render(<DataComponent />);
  
  await waitFor(() => {
    expect(screen.getByText(/Error loading data/i)).toBeInTheDocument();
  });
});
```

### 4. Testing User Interactions
```typescript
it('handles form submission', async () => {
  render(<FormComponent />);
  
  fireEvent.change(screen.getByLabelText(/Name/i), {
    target: { value: 'Test Name' },
  });
  
  fireEvent.click(screen.getByText(/Submit/i));
  
  await waitFor(() => {
    expect(screen.getByText(/Success/i)).toBeInTheDocument();
  });
});
```

## 🔄 Continuous Integration

### GitHub Actions
Tests run automatically on:
- Pull requests
- Push to main branch
- Scheduled runs

### Pre-commit Hooks
- Linting
- Type checking
- Unit tests
- Formatting

## 📊 Performance Testing

### Lighthouse CI
```bash
# Run performance tests
pnpm lighthouse

# Generate performance report
pnpm lighthouse:report
```

### Bundle Analysis
```bash
# Analyze bundle size
pnpm analyze

# Generate bundle report
pnpm build:analyze
```

## 🐛 Debugging Tests

### Debug Mode
```bash
# Run tests in debug mode
pnpm test:debug

# Run specific test file
pnpm test:debug src/test/components/HomePage.test.tsx
```

### Verbose Output
```bash
# Run with verbose output
pnpm test:ci

# Run with detailed logging
DEBUG=* pnpm test
```

## 📚 Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mocking Strategy
- Mock external dependencies
- Use realistic test data
- Avoid over-mocking

### 3. Test Data
- Use factories for test data
- Keep test data minimal
- Use meaningful test values

### 4. Assertions
- Test one thing per test
- Use specific assertions
- Test both success and error cases

### 5. Performance
- Keep tests fast
- Use proper cleanup
- Avoid unnecessary setup

## 🆘 Troubleshooting

### Common Issues

1. **Test Environment Issues**
   ```bash
   # Clear test cache
   pnpm test --clearCache
   
   # Reset test environment
   pnpm test --reporter=verbose
   ```

2. **Mock Issues**
   ```typescript
   // Clear all mocks
   vi.clearAllMocks();
   
   // Reset specific mock
   vi.mocked(fetch).mockReset();
   ```

3. **Async Test Issues**
   ```typescript
   // Use proper async/await
   it('handles async', async () => {
     await waitFor(() => {
       expect(element).toBeInTheDocument();
     });
   });
   ```

### Getting Help
- Check test logs for detailed error messages
- Use `console.log` for debugging (remember to remove)
- Check test setup and configuration
- Review mock implementations

## 📈 Monitoring Test Health

### Test Metrics
- Test execution time
- Coverage trends
- Flaky test detection
- Performance regression

### Quality Gates
- Minimum coverage thresholds
- Test execution time limits
- Performance benchmarks
- Security scan results

---

For more information, see the [Vitest documentation](https://vitest.dev/) and [Testing Library documentation](https://testing-library.com/). 