import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HomePage from '@/app/page';
import { SessionProvider } from 'next-auth/react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

const mockSession = {
  data: null,
  status: 'unauthenticated' as const,
};

describe('HomePage', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('renders the hero section with correct content', () => {
    render(
      <SessionProvider session={mockSession}>
        <HomePage />
      </SessionProvider>
    );

    // Check for main heading
    expect(screen.getByText(/Transform Your Business/i)).toBeInTheDocument();
    expect(screen.getByText(/with AI/i)).toBeInTheDocument();

    // Check for subtitle
    expect(screen.getByText(/We build custom AI tools for free/i)).toBeInTheDocument();

    // Check for CTA buttons
    expect(screen.getByText(/Explore Marketplace/i)).toBeInTheDocument();
    expect(screen.getByText(/Watch Demo/i)).toBeInTheDocument();

    // Check for badge
    expect(screen.getByText(/AI-Powered Solutions/i)).toBeInTheDocument();
  });

  it('displays stats section with correct values', () => {
    render(
      <SessionProvider session={mockSession}>
        <HomePage />
      </SessionProvider>
    );

    // Check for stats
    expect(screen.getByText('10K+')).toBeInTheDocument();
    expect(screen.getByText('500+')).toBeInTheDocument();
    expect(screen.getByText('99.9%')).toBeInTheDocument();
    expect(screen.getByText('99.99%')).toBeInTheDocument();

    // Check for stat labels
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('AI Agents')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    expect(screen.getByText('Uptime')).toBeInTheDocument();
  });

  it('renders features section', () => {
    render(
      <SessionProvider session={mockSession}>
        <HomePage />
      </SessionProvider>
    );

    // Check for features section heading
    expect(screen.getByText(/Powerful Features/i)).toBeInTheDocument();

    // Check for feature titles
    expect(screen.getByText('AI Agents')).toBeInTheDocument();
    expect(screen.getByText('Smart Automation')).toBeInTheDocument();
    expect(screen.getByText('Data Processing')).toBeInTheDocument();
    expect(screen.getByText('Cloud Deployment')).toBeInTheDocument();
  });

  it('renders testimonials section', () => {
    render(
      <SessionProvider session={mockSession}>
        <HomePage />
      </SessionProvider>
    );

    // Check for testimonials
    expect(screen.getByText(/Sarah Johnson/i)).toBeInTheDocument();
    expect(screen.getByText(/Michael Chen/i)).toBeInTheDocument();
    expect(screen.getByText(/Emily Rodriguez/i)).toBeInTheDocument();
  });

  it('has correct navigation links', () => {
    render(
      <SessionProvider session={mockSession}>
        <HomePage />
      </SessionProvider>
    );

    // Check that marketplace link exists
    const marketplaceLink = screen.getByText(/Explore Marketplace/i).closest('a');
    expect(marketplaceLink).toHaveAttribute('href', '/marketplace');

    // Check that guide link exists
    const guideLink = screen.getByText(/Watch Demo/i).closest('a');
    expect(guideLink).toHaveAttribute('href', '/guide');
  });

  it('renders with proper accessibility attributes', () => {
    render(
      <SessionProvider session={mockSession}>
        <HomePage />
      </SessionProvider>
    );

    // Check for proper heading structure
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();

    // Check for proper button roles
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
}); 