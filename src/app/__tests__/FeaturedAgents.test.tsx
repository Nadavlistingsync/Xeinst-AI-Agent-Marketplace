import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FeaturedAgents } from '@/components/FeaturedAgents';
import { vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

describe('FeaturedAgents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders featured agents', async () => {
    const mockAgents = [
      {
        id: '1',
        name: 'Test Agent',
        description: 'Test Description',
        rating: 4.5,
        downloadCount: 100,
        category: 'AI',
        price: 0,
        version: '1.0.0',
        environment: 'production',
        framework: 'custom',
        modelType: 'custom',
        isPublic: true,
        createdBy: 'user1',
        isFeatured: true,
        isTrending: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ agents: mockAgents }),
    });

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('Featured Agents')).toBeInTheDocument();
      expect(screen.getByText('Test Agent')).toBeInTheDocument();
    });
  });

  it('renders featured and trending agents after loading', async () => {
    const mockAgents = [
      {
        id: '1',
        name: 'Featured Agent',
        description: 'Featured Description',
        rating: 4.8,
        downloadCount: 200,
        category: 'AI',
        price: 0,
        version: '1.0.0',
        environment: 'production',
        framework: 'custom',
        modelType: 'custom',
        isPublic: true,
        createdBy: 'user1',
        isFeatured: true,
        isTrending: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Trending Agent',
        description: 'Trending Description',
        rating: 4.6,
        downloadCount: 150,
        category: 'AI',
        price: 0,
        version: '1.0.0',
        environment: 'production',
        framework: 'custom',
        modelType: 'custom',
        isPublic: true,
        createdBy: 'user2',
        isFeatured: false,
        isTrending: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ agents: mockAgents }),
    });

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('Featured Agents')).toBeInTheDocument();
      expect(screen.getByText('Trending Agents')).toBeInTheDocument();
      expect(screen.getByText('Featured Agent')).toBeInTheDocument();
      expect(screen.getByText('Trending Agent')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('API Error'));

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });
}); 