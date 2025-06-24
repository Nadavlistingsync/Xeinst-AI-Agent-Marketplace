import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { FeaturedAgents } from '@/components/FeaturedAgents';
import { Agent } from '@/types/agent';

const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Agent 1',
    description: 'Description for Agent 1',
    category: 'Test',
    price: 0,
    fileUrl: 'https://example.com/agent1',
    version: '1.0.0',
    environment: 'production',
    framework: 'custom',
    modelType: 'custom',
    isPublic: true,
    createdBy: 'user1',
    image: 'image1.jpg',
    rating: 4.5,
    reviews: 10,
    isFeatured: true,
    isTrending: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Agent 2',
    description: 'Description for Agent 2',
    category: 'Test',
    price: 0,
    fileUrl: 'https://example.com/agent2',
    version: '1.0.0',
    environment: 'production',
    framework: 'custom',
    modelType: 'custom',
    isPublic: true,
    createdBy: 'user2',
    image: 'image2.jpg',
    rating: 4.0,
    reviews: 5,
    isFeatured: false,
    isTrending: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('FeaturedAgents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders featured and trending agents', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ agents: mockAgents }),
    });

    render(<FeaturedAgents />);

    // Wait for loading state
    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Loading agents' })).toBeInTheDocument();
    });

    // Then wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('Agent 1')).toBeInTheDocument();
      expect(screen.getByText('Agent 2')).toBeInTheDocument();
    });
  });

  it('renders "No featured agents found" when no featured agents', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ agents: [] }),
    });

    render(<FeaturedAgents />);

    // Wait for loading state
    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Loading agents' })).toBeInTheDocument();
    });

    // Then wait for the empty state
    await waitFor(() => {
      expect(screen.getByText('No featured agents found')).toBeInTheDocument();
      expect(screen.getByText('No trending agents found')).toBeInTheDocument();
    });
  });

  it('handles non-200 response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<FeaturedAgents />);

    // Wait for loading state
    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Loading agents' })).toBeInTheDocument();
    });

    // Then wait for the error state
    await waitFor(() => {
      expect(screen.getByText('Failed to load featured agents')).toBeInTheDocument();
    });
  });

  it('handles fetch error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<FeaturedAgents />);

    // Wait for loading state
    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Loading agents' })).toBeInTheDocument();
    });

    // Then wait for the error state
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
}); 