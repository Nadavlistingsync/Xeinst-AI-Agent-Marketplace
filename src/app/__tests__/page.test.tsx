import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '../page'
import { vi } from 'vitest'

// Mock the FeaturedAgents component
vi.mock('@/components/FeaturedAgents', () => ({
  default: () => <div data-testid="featured-agents">Featured Agents</div>,
}))

describe('Home Page', () => {
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
}) 