import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '../page'

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    const heading = screen.getByRole('heading', { level: 1, name: /Transform Your Business with AI Solutions/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders the main description', () => {
    render(<Home />)
    const description = screen.getByText(/We help businesses leverage cutting-edge AI technology/i)
    expect(description).toBeInTheDocument()
  })

  it('renders the featured agents section', () => {
    render(<Home />)
    const featuredHeading = screen.getByText('Featured Agents')
    expect(featuredHeading).toBeInTheDocument()
  })

  it('renders the why choose us section', () => {
    render(<Home />)
    const whyChooseHeading = screen.getByText('Why Choose Our Platform?')
    expect(whyChooseHeading).toBeInTheDocument()
  })
}) 