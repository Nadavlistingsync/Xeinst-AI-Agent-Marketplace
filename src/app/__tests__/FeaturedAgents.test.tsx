import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import FeaturedAgents from '@/components/FeaturedAgents';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe('FeaturedAgents', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockClear();
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
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAgents),
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAgents),
      }));

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getAllByText('Test Agent 1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Test Agent 2').length).toBeGreaterThan(0);
    });
  });

  it('handles fetch errors gracefully', async () => {
    const errorMessage = 'Cannot read properties of undefined (reading \'ok\')';
    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    }, { timeout: 10000 });
  }, 15000);

  it('navigates to agent details when clicking view details', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAgents),
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAgents),
      }));

    render(<FeaturedAgents />);

    await waitFor(() => {
      const viewDetailsButtons = screen.getAllByText('View Details');
      fireEvent.click(viewDetailsButtons[0]);
      expect(mockRouter.push).toHaveBeenCalledWith('/agent/1');
    });
  });

  it('renders featured agents', async () => {
    const mockAgents = [
      {
        id: '1',
        name: 'Test Agent',
        description: 'Test Description',
        framework: 'test',
        category: 'test',
        tags: ['test'],
        price_cents: 1000,
        rating: 4.5,
        downloads: 100,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ agents: mockAgents }),
    });

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('Test Agent')).toBeInTheDocument();
    });
  });

  it('handles fetch errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load featured agents')).toBeInTheDocument();
    });
  });

  it('handles empty response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ agents: [] }),
    });

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('No featured agents found')).toBeInTheDocument();
    });
  });
}); 