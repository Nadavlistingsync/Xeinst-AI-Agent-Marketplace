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
vi.mock('framer-motion', () => {
  const React = require('react');
  
  const createMockComponent = (tag: string) => {
    return React.forwardRef(({ children, ...props }: any, ref: any) => {
      return React.createElement(tag, { ...props, ref }, children);
    });
  };

  const motionComponents: any = {};
  const htmlElements = [
    'div', 'button', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'li', 'nav', 'section', 'article', 'aside', 'header', 'footer',
    'main', 'form', 'input', 'textarea', 'select', 'option', 'label',
    'a', 'img', 'svg', 'path', 'circle', 'rect', 'line', 'polyline',
    'polygon', 'ellipse', 'g', 'defs', 'clipPath', 'linearGradient',
    'radialGradient', 'stop', 'pattern', 'mask', 'filter', 'feGaussianBlur',
    'feOffset', 'feComposite', 'feMerge', 'feMergeNode', 'feFlood',
    'feColorMatrix', 'feBlend', 'feMorphology', 'feDisplacementMap',
    'feTurbulence', 'feDiffuseLighting', 'feSpecularLighting', 'feDistantLight',
    'fePointLight', 'feSpotLight', 'feConvolveMatrix', 'feImage', 'feTile',
    'feComponentTransfer', 'feFuncR', 'feFuncG', 'feFuncB', 'feFuncA', 'feDropShadow'
  ];

  htmlElements.forEach(tag => {
    motionComponents[tag] = createMockComponent(tag);
  });

  return {
    motion: motionComponents,
    AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
    useAnimation: () => ({
      start: vi.fn(),
      stop: vi.fn(),
      set: vi.fn(),
    }),
    useMotionValue: (initial: any) => ({
      get: () => initial,
      set: vi.fn(),
      on: vi.fn(),
    }),
    useTransform: (value: any, input: any, output: any) => ({
      get: () => output,
      set: vi.fn(),
      on: vi.fn(),
    }),
    useSpring: (value: any, config: any) => ({
      get: () => value,
      set: vi.fn(),
      on: vi.fn(),
    }),
    useMotionValueEvent: vi.fn(),
    useInView: () => ({ ref: vi.fn(), inView: false }),
    useScroll: () => ({
      scrollX: { get: () => 0, on: vi.fn() },
      scrollY: { get: () => 0, on: vi.fn() },
      scrollXProgress: { get: () => 0, on: vi.fn() },
      scrollYProgress: { get: () => 0, on: vi.fn() },
    }),
    useScrollControls: () => ({
      scrollTo: vi.fn(),
      scrollToTop: vi.fn(),
      scrollToBottom: vi.fn(),
    }),
    useCycle: (...args: any[]) => [args[0], vi.fn()],
    useReducedMotion: () => false,
    usePresence: () => ({ isPresent: true, safeToRemove: vi.fn() }),
    useIsPresent: () => true,
    useAnimate: () => [vi.fn(), vi.fn()],
    useMotionTemplate: (template: any) => template,
  };
});

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
    expect(screen.getAllByText(/XEINST Platform/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/AI Solutions/i)[0]).toBeInTheDocument();

    // Check for subtitle
    expect(screen.getByText(/Browse, create, and upload AI agents/i)).toBeInTheDocument();

    // Check for CTA buttons
    expect(screen.getAllByText(/Browse & Use/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Get Started/i)[0]).toBeInTheDocument();

    // Check for badge
    expect(screen.getAllByText(/XEINST Platform/i)[1]).toBeInTheDocument();
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
    expect(screen.getByText('AI Agents Available')).toBeInTheDocument();
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
    expect(screen.getByText(/Platform Features/i)).toBeInTheDocument();

    // Check for feature titles
    expect(screen.getByText('AI Agent Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Upload & Embed System')).toBeInTheDocument();
    expect(screen.getByText('Smart Automation')).toBeInTheDocument();
  });

  it('renders testimonials section', () => {
    render(
      <SessionProvider session={mockSession}>
        <HomePage />
      </SessionProvider>
    );

    // Check for main user journeys section
    expect(screen.getAllByText(/Main User Journeys/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Path 1: Browse & Use/i)).toBeInTheDocument();
    expect(screen.getByText(/Path 2: Create & Deploy/i)).toBeInTheDocument();
    expect(screen.getByText(/Path 3: Upload & Manage/i)).toBeInTheDocument();
  });

  it('has correct navigation links', () => {
    render(
      <SessionProvider session={mockSession}>
        <HomePage />
      </SessionProvider>
    );

    // Check that marketplace link exists
    const marketplaceLink = screen.getAllByText(/Browse & Use/i)[0].closest('a');
    expect(marketplaceLink).toHaveAttribute('href', '/marketplace');

    // Check that guide link exists
    const guideLink = screen.getAllByText(/Get Started/i)[0].closest('a');
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

    // Check for proper link roles (the component uses links, not buttons)
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
}); 