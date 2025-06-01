import { render, screen, waitFor } from '@testing-library/react';
import { FeaturedAgents } from '@/components/FeaturedAgents';
import { vi } from 'vitest';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('FeaturedAgents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<FeaturedAgents />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders featured and trending agents after loading', async () => {
    const mockAgents = [
      {
        id: '1',
        name: 'Test Agent',
        description: 'Test Description',
        image: '/test.jpg',
        rating: 4.5,
        reviews: 10,
        isFeatured: true,
        isTrending: true,
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockAgents }),
    });

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('Test Agent')).toBeInTheDocument();
    });
  });

  it('handles fetch errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });

  it('navigates to agent details when clicking view details', async () => {
    const mockAgents = [
      {
        id: '1',
        name: 'Test Agent',
        description: 'Test Description',
        image: '/test.jpg',
        rating: 4.5,
        reviews: 10,
        isFeatured: true,
        isTrending: true,
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockAgents }),
    });

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('Test Agent')).toBeInTheDocument();
    });

    const viewDetailsButton = screen.getByRole('link', { name: /view details/i });
    expect(viewDetailsButton).toHaveAttribute('href', '/agent/1');
  });

  it('renders empty state when no agents are found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('No featured agents found')).toBeInTheDocument();
      expect(screen.getByText('No trending agents found')).toBeInTheDocument();
    });
  });

  it('renders featured agents', async () => {
    const mockAgents = [
      {
        id: '1',
        name: 'Test Agent',
        description: 'Test Description',
        image: '/test.jpg',
        rating: 4.5,
        reviews: 10,
        isFeatured: true,
        isTrending: false,
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockAgents }),
    });

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('Test Agent')).toBeInTheDocument();
    });
  });

  it('handles fetch errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to load featured agents'));

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load featured agents')).toBeInTheDocument();
    });
  });

  it('handles empty response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('No featured agents found')).toBeInTheDocument();
    });
  });

  it('renders featured agents section', async () => {
    const mockAgents = [
      {
        id: '1',
        name: 'Test Agent',
        description: 'Test Description',
        image: '/test.jpg',
        rating: 4.5,
        reviews: 10,
        isFeatured: true,
        isTrending: false,
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockAgents }),
    });

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('Featured Agents')).toBeInTheDocument();
      expect(screen.getByText('Test Agent')).toBeInTheDocument();
    });
  });
}); 