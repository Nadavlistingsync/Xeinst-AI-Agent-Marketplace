import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import FeaturedAgents from '@/components/FeaturedAgents';
import { useRouter } from 'next/navigation';
import { vi } from 'vitest';
import { prisma } from '@/test/setup';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('FeaturedAgents', () => {
  const mockRouter = {
    push: vi.fn(),
  };

  beforeEach(() => {
    (useRouter as any).mockReturnValue(mockRouter);
    vi.clearAllMocks();
  });

  const mockAgents = {
    agents: [
      {
        id: '1',
        name: 'Test Agent 1',
        description: 'Test Description 1',
        tag: 'Test Tag',
        price: 10,
        image_url: 'test-image-1.jpg',
        average_rating: 4.5,
        total_ratings: 100,
        download_count: 1000,
      },
      {
        id: '2',
        name: 'Test Agent 2',
        description: 'Test Description 2',
        tag: 'Test Tag',
        price: 0,
        image_url: 'test-image-2.jpg',
        average_rating: 4.0,
        total_ratings: 50,
        download_count: 500,
      },
    ],
  };

  it('renders loading state initially', () => {
    render(<FeaturedAgents />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders featured and trending agents after loading', async () => {
    global.fetch = vi.fn()
      .mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify(mockAgents), {
        status: 200,
        ok: true,
      })))
      .mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify(mockAgents), {
        status: 200,
        ok: true,
      })));

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getAllByText('Test Agent 1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Test Agent 2').length).toBeGreaterThan(0);
    });
  });

  it('handles fetch errors gracefully', async () => {
    global.fetch = vi.fn()
      .mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({ error: 'Failed to fetch' }), {
        status: 500,
        ok: false,
      })));

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });

  it('navigates to agent details when clicking view details', async () => {
    global.fetch = vi.fn()
      .mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify(mockAgents), {
        status: 200,
        ok: true,
      })))
      .mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify(mockAgents), {
        status: 200,
        ok: true,
      })));

    render(<FeaturedAgents />);

    await waitFor(() => {
      const viewDetailsButtons = screen.getAllByText('View Details');
      fireEvent.click(viewDetailsButtons[0]);
      expect(mockRouter.push).toHaveBeenCalledWith('/agent/1');
    });
  });

  it('renders empty state when no agents are found', async () => {
    global.fetch = vi.fn()
      .mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({ agents: [] }), {
        status: 200,
        ok: true,
      })))
      .mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({ agents: [] }), {
        status: 200,
        ok: true,
      })));

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getAllByText('No featured agents found')).toHaveLength(1);
      expect(screen.getAllByText('No trending agents found')).toHaveLength(1);
    });
  });

  it('renders featured agents', async () => {
    const mockAgents = [
      {
        id: '1',
        name: 'Test Agent',
        description: 'Test Description',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deployed_by: 'user1',
        status: 'active',
        category: 'test',
        is_featured: true,
        is_trending: true,
        usage_count: 0,
        rating: 4.5,
        price: 9.99,
        earnings_split: 0.7,
        deployment_count: 0,
        feedback_count: 0,
        total_earnings: 0,
        last_deployed: new Date().toISOString(),
        last_used: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        last_feedback: new Date().toISOString(),
        last_rating: 4.5,
        last_earnings: 0,
        last_deployment: new Date().toISOString(),
        last_usage: new Date().toISOString(),
        last_feedback_date: new Date().toISOString(),
        last_rating_date: new Date().toISOString(),
        last_earnings_date: new Date().toISOString(),
        last_deployment_date: new Date().toISOString(),
        last_usage_date: new Date().toISOString(),
      },
    ];

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ agents: mockAgents }),
    });

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('Test Agent')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('handles fetch errors', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load featured agents')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('handles empty response', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ agents: [] }),
    });

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('No featured agents found')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('renders featured agents section', async () => {
    // Mock the getFeaturedAgents function
    const mockAgents = [
      {
        id: '1',
        name: 'Test Agent',
        description: 'Test Description',
        price: 100,
        rating: 4.5,
        image_url: '/test-image.jpg',
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'user1',
        category: 'AI',
        status: 'active',
        is_featured: true,
        total_sales: 10,
        total_revenue: 1000,
      },
    ];

    // Mock the prisma client
    vi.spyOn(prisma.agent, 'findMany').mockResolvedValue(mockAgents);

    render(<FeaturedAgents />);

    // Check if the section title is rendered
    expect(screen.getByText('Featured AI Agents')).toBeInTheDocument();

    // Check if the agent name is rendered
    expect(await screen.findByText('Test Agent')).toBeInTheDocument();

    // Check if the agent description is rendered
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
}); 