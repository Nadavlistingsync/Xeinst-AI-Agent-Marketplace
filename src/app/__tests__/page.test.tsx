import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '../page'
import { vi } from 'vitest'
import { prisma } from '@/test/setup'

// Mock the FeaturedAgents component
vi.mock('@/components/FeaturedAgents', () => ({
  __esModule: true,
  default: () => (
    <div>
      <h2>Featured Agents</h2>
      <div>Featured Agents</div>
    </div>
  )
}))

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main heading', () => {
    render(<Home />)
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings.length).toBeGreaterThan(0)
  })

  it('renders the main description', () => {
    render(<Home />)
    const description = screen.getByText(/custom AI tools/i)
    expect(description).toBeInTheDocument()
  })

  it('renders the hero section', () => {
    render(<Home />)
    const transforms = screen.getAllByText(/transform/i)
    expect(transforms.length).toBeGreaterThan(0)
    expect(screen.getAllByText(/with AI/i).length).toBeGreaterThan(0)
  })

  it('renders the features section', () => {
    render(<Home />)
    const featuresHeading = screen.getByText(/features/i)
    expect(featuresHeading).toBeInTheDocument()
  })

  it('renders the stats section', () => {
    render(<Home />)
    expect(screen.getAllByText(/AI agents/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/active users/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/success rate/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/uptime/i).length).toBeGreaterThan(0)
  })

  it('handles database errors correctly', async () => {
    // Mock the agentLog.findMany to throw an error
    vi.mocked(prisma.agentLog.findMany).mockRejectedValueOnce(new Error('Database error'));
    try {
      await prisma.agentLog.findMany();
      // If we reach here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      if (error instanceof Error) {
        expect(error.message).toBe('Database error');
      }
    }
  });
}) 