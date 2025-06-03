import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { FeaturedAgents } from '@/components/FeaturedAgents';
import { Agent } from '@/types/agent';

const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Agent 1',
    description: 'Description for Agent 1',
    image: 'image1.jpg',
    rating: 4.5,
    reviews: 10,
    isFeatured: true,
    isTrending: false,
    status: 'active',
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Agent 2',
    description: 'Description for Agent 2',
    image: 'image2.jpg',
    rating: 4.0,
    reviews: 5,
    isFeatured: false,
    isTrending: true,
    status: 'active',
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
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
    expect(screen.getByText('Agent 1')).toBeInTheDocument();
    expect(screen.getByText('Description for Agent 1')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(10 reviews)')).toBeInTheDocument();

    // Check trending agent
    expect(screen.getByText('Agent 2')).toBeInTheDocument();
    expect(screen.getByText('Description for Agent 2')).toBeInTheDocument();
    expect(screen.getByText('4.0')).toBeInTheDocument();
    expect(screen.getByText('(5 reviews)')).toBeInTheDocument();
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