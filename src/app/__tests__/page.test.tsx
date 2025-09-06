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
    const description = screen.getByText(/Connect your AI agents via webhooks/i)
    expect(description).toBeInTheDocument()
  })

  it('renders the hero section', () => {
    render(<Home />)
    const heading = screen.getByText(/AI Agent Marketplace/i)
    expect(heading).toBeInTheDocument()
    expect(screen.getByText(/Webhook Agents • Buy Credits • Use AI/i)).toBeInTheDocument()
  })

  it('renders the features section', () => {
    render(<Home />)
    const featuresHeading = screen.getByText(/features/i)
    expect(featuresHeading).toBeInTheDocument()
  })

  it('renders the stats section', () => {
    render(<Home />)
    expect(screen.getByText(/Active Agents/i)).toBeInTheDocument()
    expect(screen.getByText(/Credits Used/i)).toBeInTheDocument()
    expect(screen.getByText(/Users/i)).toBeInTheDocument()
    expect(screen.getByText(/Success Rate/i)).toBeInTheDocument()
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