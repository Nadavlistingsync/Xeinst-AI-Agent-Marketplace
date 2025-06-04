import { render, screen, waitFor, act } from '@testing-library/react';
import { FeaturedAgents } from '@/components/FeaturedAgents';
import { vi } from 'vitest';
import { Agent } from '@/types/agent';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('FeaturedAgents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    // Mock a delayed response to ensure loading state is visible
    mockFetch.mockImplementationOnce(() => new Promise(resolve => {
      setTimeout(() => {
        resolve({
          ok: true,
          json: () => Promise.resolve({ agents: [] })
        });
      }, 100);
    }));

    render(<FeaturedAgents />);
    
    // Check for loading spinner
    const loadingSpinner = screen.getByRole('status');
    expect(loadingSpinner).toBeInTheDocument();
    expect(loadingSpinner.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders featured and trending agents after loading', async () => {
    const mockAgents: Agent[] = [
      {
        id: '1',
        name: 'Featured Test Agent',
        description: 'Test Description',
        image: '/test.jpg',
        rating: 4.5,
        reviews: 10,
        isFeatured: true,
        isTrending: false,
        status: 'active',
        metadata: {
          isFeatured: true,
          isTrending: false,
          rating: 4.5,
          reviews: 10,
          image: '/test.jpg'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Trending Test Agent',
        description: 'Test Description',
        image: '/test.jpg',
        rating: 4.5,
        reviews: 10,
        isFeatured: false,
        isTrending: true,
        status: 'active',
        metadata: {
          isFeatured: false,
          isTrending: true,
          rating: 4.5,
          reviews: 10,
          image: '/test.jpg'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ agents: mockAgents }),
    });

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('Featured Test Agent')).toBeInTheDocument();
      expect(screen.getByText('Trending Test Agent')).toBeInTheDocument();
    });
  });

  it('handles fetch errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });

  it('renders empty state when no agents are found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ agents: [] }),
    });

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('No featured agents found')).toBeInTheDocument();
      expect(screen.getByText('No trending agents found')).toBeInTheDocument();
    });
  });

  it('handles non-200 response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed to load featured agents' }),
    });

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load featured agents')).toBeInTheDocument();
    });
  });
}); 