import { render, screen } from '@testing-library/react'
import Home from '../page'

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    const heading = screen.getByRole('heading', { level: 1, name: 'Xeinst' })
    expect(heading).toBeInTheDocument()
  })

  it('renders the main description', () => {
    render(<Home />)
    const description = screen.getByText('Building the future of AI, one innovation at a time')
    expect(description).toBeInTheDocument()
  })

  it('renders the products section', () => {
    render(<Home />)
    const productsHeading = screen.getByText('Our Products')
    expect(productsHeading).toBeInTheDocument()
  })
}) 