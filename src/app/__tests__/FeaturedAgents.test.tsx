import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import FeaturedAgents from '@/components/FeaturedAgents';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

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
      expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
      expect(screen.getByText('Test Agent 2')).toBeInTheDocument();
    });
  });

  it('handles fetch errors gracefully', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => Promise.reject(new Error('Network error')));

    render(<FeaturedAgents />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    // Test retry functionality
    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

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
}); 