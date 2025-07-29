import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MarketplacePage from '@/app/marketplace/page';
import { SessionProvider } from 'next-auth/react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock fetch
global.fetch = vi.fn();

const mockAgents = [
  {
    id: '1',
    name: 'Test Agent 1',
    description: 'Test description 1',
    model_type: 'gpt-4',
    framework: 'langchain',
    price: 10.99,
    download_count: 100,
    created_at: new Date().toISOString(),
    file_path: '/test/path1',
    user_id: 'user1',
    status: 'active',
    version: '1.0.0',
    category: 'productivity',
    tags: ['ai', 'automation'],
    rating: 4.5,
    review_count: 10,
  },
  {
    id: '2',
    name: 'Test Agent 2',
    description: 'Test description 2',
    model_type: 'gpt-3.5',
    framework: 'openai',
    price: 5.99,
    download_count: 50,
    created_at: new Date().toISOString(),
    file_path: '/test/path2',
    user_id: 'user2',
    status: 'active',
    version: '1.0.0',
    category: 'communication',
    tags: ['chat', 'support'],
    rating: 4.0,
    review_count: 5,
  }
];

const mockSession = {
  data: null,
  status: 'unauthenticated' as const,
};

describe('MarketplacePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAgents),
    });
  });

  it('renders loading state initially', () => {
    render(
      <SessionProvider session={mockSession}>
        <MarketplacePage />
      </SessionProvider>
    );

    expect(screen.getByText(/Loading agents/i)).toBeInTheDocument();
  });

  it('renders marketplace content after loading', async () => {
    render(
      <SessionProvider session={mockSession}>
        <MarketplacePage />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Discover & Deploy/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/AI Agents/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse our curated collection/i)).toBeInTheDocument();
  });

  it('displays correct stats after loading', async () => {
    render(
      <SessionProvider session={mockSession}>
        <MarketplacePage />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Total Agents
    });

    expect(screen.getByText('24')).toBeInTheDocument(); // Categories
    expect(screen.getByText('1.2K')).toBeInTheDocument(); // Downloads
    expect(screen.getByText('4.9★')).toBeInTheDocument(); // Avg Rating
  });

  it('renders marketplace search component', async () => {
    render(
      <SessionProvider session={mockSession}>
        <MarketplacePage />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Filters/i)).toBeInTheDocument();
    });
  });

  it('renders marketplace filters component', async () => {
    render(
      <SessionProvider session={mockSession}>
        <MarketplacePage />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Total Agents/i)).toBeInTheDocument();
    });
  });

  it('renders marketplace grid with agents', async () => {
    render(
      <SessionProvider session={mockSession}>
        <MarketplacePage />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
      expect(screen.getByText('Test Agent 2')).toBeInTheDocument();
    });
  });

  it('handles fetch error gracefully', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    render(
      <SessionProvider session={mockSession}>
        <MarketplacePage />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Loading agents/i)).toBeInTheDocument();
    });
  });

  it('has correct navigation links', async () => {
    render(
      <SessionProvider session={mockSession}>
        <MarketplacePage />
      </SessionProvider>
    );

    await waitFor(() => {
      const uploadLink = screen.getByText(/Upload Agent/i).closest('a');
      expect(uploadLink).toHaveAttribute('href', '/upload');


    });
  });

  it('displays agent marketplace badge', async () => {
    render(
      <SessionProvider session={mockSession}>
        <MarketplacePage />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/AI Agent Marketplace/i)).toBeInTheDocument();
    });
  });
}); 