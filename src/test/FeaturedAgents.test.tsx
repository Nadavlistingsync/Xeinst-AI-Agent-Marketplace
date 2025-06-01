import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { FeaturedAgents } from '@/components/FeaturedAgents';
import { Agent } from '@/types/agent';

const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Test Agent 1',
    description: 'Test Description 1',
    image: '/test-image-1.jpg',
    rating: 4.5,
    reviews: 100,
    isFeatured: true,
    isTrending: false,
  },
  {
    id: '2',
    name: 'Test Agent 2',
    description: 'Test Description 2',
    image: '/test-image-2.jpg',
    rating: 4.8,
    reviews: 150,
    isFeatured: false,
    isTrending: true,
  },
];

describe('FeaturedAgents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<FeaturedAgents />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
  });

  it('renders error state when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Failed to fetch'));
    render(<FeaturedAgents />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });

  it('renders featured and trending agents successfully', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockAgents }),
    });

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('Featured Agents')).toBeInTheDocument();
      expect(screen.getByText('Trending Agents')).toBeInTheDocument();
    });

    // Check featured agent
    expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
    expect(screen.getByText('Test Description 1')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(100 reviews)')).toBeInTheDocument();

    // Check trending agent
    expect(screen.getByText('Test Agent 2')).toBeInTheDocument();
    expect(screen.getByText('Test Description 2')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('(150 reviews)')).toBeInTheDocument();
  });

  it('renders "No featured agents found" when no featured agents', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('No featured agents found')).toBeInTheDocument();
      expect(screen.getByText('No trending agents found')).toBeInTheDocument();
    });
  });

  it('handles non-200 response', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load featured agents')).toBeInTheDocument();
    });
  });
}); 