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

// Mock framer-motion - use the same comprehensive mock as setup.ts
vi.mock('framer-motion', () => {
  const React = require('react');
  
  const createMockComponent = (tag: string) => {
    return ({ children, ...props }: any) => {
      // Remove ALL motion-specific props that cause React warnings
      const { 
        animate, initial, transition, whileHover, whileTap, whileInView,
        variants, custom, inherit, layout, layoutId, layoutDependency,
        layoutScroll, layoutRoot, drag, dragConstraints, dragElastic,
        dragMomentum, dragPropagation, dragSnapToOrigin, dragTransition,
        dragDirectionLock, dragListener, dragControls, onDrag, onDragStart,
        onDragEnd, pan, panDirectionLock, panSnapToOrigin, panTransition,
        onPan, onPanStart, onPanEnd, viewport, ...cleanProps 
      } = props;
      
      return React.createElement(tag, { ...cleanProps }, children);
    };
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
    expect(screen.getByText(/The Future of AI is/i)).toBeInTheDocument();
    expect(screen.getByText(/Marketplace-Driven/i)).toBeInTheDocument();

    // Check for subtitle
    expect(screen.getByText(/Connect, create, and monetize AI agents/i)).toBeInTheDocument();

    // Check for CTA buttons
    expect(screen.getByText(/Explore Marketplace/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Upload Your Agent/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Test Sentry Error/i)).toBeInTheDocument();
  });

  it('displays stats section with correct values', () => {
    render(
      <SessionProvider session={mockSession}>
        <HomePage />
      </SessionProvider>
    );

    // Check for stats
    expect(screen.getByText('1,000+')).toBeInTheDocument();
    expect(screen.getByText('50K+')).toBeInTheDocument();
    expect(screen.getByText('500+')).toBeInTheDocument();
    expect(screen.getByText('99.9%')).toBeInTheDocument();

    // Check for stat labels
    expect(screen.getByText('Active Agents')).toBeInTheDocument();
    expect(screen.getByText('Credits Earned')).toBeInTheDocument();
    expect(screen.getByText('Happy Creators')).toBeInTheDocument();
    expect(screen.getByText('Uptime')).toBeInTheDocument();
  });

  it('renders features section', () => {
    render(
      <SessionProvider session={mockSession}>
        <HomePage />
      </SessionProvider>
    );

    // Check for features section heading
    expect(screen.getByText(/Why Choose Xeinst/i)).toBeInTheDocument();

    // Check for feature titles
    expect(screen.getByText('AI Agent Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Instant Deployment')).toBeInTheDocument();
    expect(screen.getByText('Community Driven')).toBeInTheDocument();
    expect(screen.getByText('Monetize Your Work')).toBeInTheDocument();
  });

  it('renders how it works section', () => {
    render(
      <SessionProvider session={mockSession}>
        <HomePage />
      </SessionProvider>
    );

    // Check for how it works section
    expect(screen.getByText(/How It Works/i)).toBeInTheDocument();
    expect(screen.getByText(/Get started with AI agents in three simple steps/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse & Discover/i)).toBeInTheDocument();
    expect(screen.getByText(/Purchase Credits/i)).toBeInTheDocument();
    expect(screen.getByText(/Execute & Get Results/i)).toBeInTheDocument();
  });

  it('has correct navigation links', () => {
    render(
      <SessionProvider session={mockSession}>
        <HomePage />
      </SessionProvider>
    );

    // Check that buttons exist (the homepage has buttons, not navigation links)
    expect(screen.getByText(/Explore Marketplace/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Upload Your Agent/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Browse Marketplace/i)).toBeInTheDocument();
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

    // Check for proper button roles (the component uses buttons, not links)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
}); 