import { render, screen, waitFor } from '@testing-library/react';
import { FeaturedAgents } from '../FeaturedAgents';
import { vi } from 'vitest';

// Mock the fetch function
global.fetch = vi.fn();

const mockAgents = [
  {
    id: '1',
    name: 'Test Agent',
    description: 'Test Description',
    model: 'gpt-4',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {},
  },
];

describe('FeaturedAgents', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAgents)
      } as Response)
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders featured agents', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAgents,
    } as Response);

    render(<FeaturedAgents />);

    // Wait for the agent name to appear
    const agentName = await screen.findByText('Test Agent');
    expect(agentName).toBeInTheDocument();
  });

  it('renders loading state initially', () => {
    render(<FeaturedAgents />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders featured and trending agents after loading', async () => {
    render(<FeaturedAgents />);
    await waitFor(() => {
      expect(screen.getByText('Test Agent')).toBeInTheDocument();
    });
  });

  it('handles fetch errors gracefully', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );
    render(<FeaturedAgents />);
    await waitFor(() => {
      expect(screen.getByText('Error loading agents')).toBeInTheDocument();
    });
  });

  it('renders empty state when no agents are found', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      } as Response)
    );
    render(<FeaturedAgents />);
    await waitFor(() => {
      expect(screen.getByText('No agents found')).toBeInTheDocument();
    });
  });

  it('handles non-200 response', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Server error' })
      } as Response)
    );
    render(<FeaturedAgents />);
    await waitFor(() => {
      expect(screen.getByText('Error loading agents')).toBeInTheDocument();
    });
  });
}); 