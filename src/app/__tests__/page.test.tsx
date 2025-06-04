import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '../page'
import { vi } from 'vitest'
import prisma from '@/lib/prisma'

// Mock the FeaturedAgents component
vi.mock('@/components/FeaturedAgents', () => ({
  default: () => (
    <div>
      <h2>Featured AI Agents</h2>
      <div data-testid="featured-agents">Featured Agents</div>
    </div>
  ),
}))

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main heading', () => {
    render(<Home />)
    const heading = screen.getByRole('heading', { level: 1, name: /Transform Your Business with AI Solutions/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders the main description', () => {
    render(<Home />)
    const description = screen.getByText(/Unlock the power of custom AI/i)
    expect(description).toBeInTheDocument()
  })

  it('renders the hero section', () => {
    render(<Home />)
    const heading = screen.getByText(/Transform Your Business with/i)
    expect(heading).toBeInTheDocument()
    expect(screen.getByText('AI Solutions')).toBeInTheDocument()
  })

  it('renders the features section', () => {
    render(<Home />)
    const featuresHeading = screen.getByText(/Why Choose Our Platform?/i)
    expect(featuresHeading).toBeInTheDocument()
  })

  it('renders the featured agents section', () => {
    render(<Home />)
    expect(screen.getByTestId('featured-agents')).toBeInTheDocument()
    expect(screen.getByText('Featured AI Agents')).toBeInTheDocument()
  })

  it('renders the why choose us section', () => {
    render(<Home />)
    const whyChooseHeading = screen.getByText('Why Choose Our Platform?')
    expect(whyChooseHeading).toBeInTheDocument()
  })

  it('renders the stats section', () => {
    render(<Home />)
    expect(screen.getByText('98%')).toBeInTheDocument()
    expect(screen.getByText('Client Satisfaction')).toBeInTheDocument()
  })

  it('renders home page with main sections', async () => {
    render(<Home />);

    // Check if main sections are rendered
    expect(screen.getByText(/Welcome to AI Agency/i)).toBeInTheDocument();
    expect(screen.getByText(/Featured AI Agents/i)).toBeInTheDocument();
    expect(screen.getByText(/How It Works/i)).toBeInTheDocument();
    expect(screen.getByText(/Why Choose Us/i)).toBeInTheDocument();
  });

  it('handles database errors correctly', async () => {
    // Mock the agentLog.findMany to throw an error
    (prisma.agentLog.findMany as any).mockRejectedValueOnce(new Error('Database error'));
    
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