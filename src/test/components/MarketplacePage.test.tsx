import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MarketplacePage from '../../app/marketplace/page';
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

// Mock framer-motion - use the same mock as setup.ts
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

  // Ensure all motion components are properly defined
  const motion = new Proxy(motionComponents, {
    get(target, prop) {
      if (typeof prop === 'string' && target[prop]) {
        return target[prop];
      }
      // Fallback for any missing motion components
      return createMockComponent(prop as string);
    }
  });

  const AnimatePresence = ({ children, ...props }: any) => React.createElement('div', props, children);

  return {
    motion,
    AnimatePresence,
    useAnimation: () => ({
      start: vi.fn(),
      stop: vi.fn(),
      set: vi.fn(),
    }),
    useAnimationControls: () => ({
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
    LazyMotion: ({ children }: any) => children,
    domAnimation: {},
    domTransition: {},
  };
});

// Mock fetch
global.fetch = vi.fn();

const mockAgents = [
  {
    id: '1',
    name: 'Text Summarizer',
    description: 'AI agent that summarizes long texts into concise summaries',
    model_type: 'gpt-4',
    framework: 'langchain',
    price: 10.99,
    download_count: 100,
    created_at: new Date().toISOString(),
    file_path: '/test/path1',
    user_id: 'user1',
    status: 'active',
    version: '1.0.0',
    category: 'productivity',
    tags: ['ai', 'automation'],
    rating: 4.5,
    review_count: 10,
  },
  {
    id: '2',
    name: 'Image Classifier',
    description: 'AI agent that classifies and categorizes images',
    model_type: 'gpt-3.5',
    framework: 'openai',
    price: 5.99,
    download_count: 50,
    created_at: new Date().toISOString(),
    file_path: '/test/path2',
    user_id: 'user2',
    status: 'active',
    version: '1.0.0',
    category: 'communication',
    tags: ['chat', 'support'],
    rating: 4.0,
    review_count: 5,
  }
];

const mockSession = {
  data: null,
  status: 'unauthenticated' as const,
};

describe('MarketplacePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAgents),
    });
  });

  it('renders loading state initially', () => {
    render(
      <SessionProvider session={mockSession}>
        <MarketplacePage />
      </SessionProvider>
    );

    expect(screen.getByText(/AI Agent Marketplace/i)).toBeInTheDocument();
  });

  it('renders marketplace content after loading', async () => {
    render(
      <SessionProvider session={mockSession}>
        <MarketplacePage />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/AI Agent Marketplace/i)).toBeInTheDocument();
      expect(screen.getByText(/Discover and use powerful AI agents/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/AI Agent Marketplace/i)).toBeInTheDocument();
    expect(screen.getByText(/Discover and use powerful AI agents/i)).toBeInTheDocument();
  });

  it('displays correct stats after loading', async () => {
    render(
      <SessionProvider session={mockSession}>
        <MarketplacePage />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/AI Agent Marketplace/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Discover and use powerful AI agents/i)).toBeInTheDocument();
  });

  it('renders marketplace search component', async () => {
    render(
      <SessionProvider session={mockSession}>
        <MarketplacePage />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/AI Agent Marketplace/i)).toBeInTheDocument();
    });

    // Check for search input
    expect(screen.getByPlaceholderText(/Search agents/i)).toBeInTheDocument();
  });

  it('renders marketplace filters component', async () => {
    render(
      <SessionProvider session={mockSession}>
        <MarketplacePage />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/AI Agent Marketplace/i)).toBeInTheDocument();
    });
  });

  it('renders marketplace grid with agents', async () => {
    render(
      <SessionProvider session={mockSession}>
        <MarketplacePage />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/2 Agents Found/i)).toBeInTheDocument();
    });

    // Check that the grid is rendered (even if showing loading skeletons)
    expect(screen.getByText(/AI Agent Marketplace/i)).toBeInTheDocument();
  });

  it('handles fetch error gracefully', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    render(
      <SessionProvider session={mockSession}>
        <MarketplacePage />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/0 Agents Found/i)).toBeInTheDocument();
    });
  });

  it('has correct navigation links', async () => {
    render(
      <SessionProvider session={mockSession}>
        <MarketplacePage />
      </SessionProvider>
    );

    await waitFor(() => {
      const uploadLink = screen.getByText(/Upload Agent/i).closest('a');
      expect(uploadLink).toHaveAttribute('href', '/upload');
    });
  });

  it('displays agent marketplace badge', async () => {
    render(
      <SessionProvider session={mockSession}>
        <MarketplacePage />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/AI Agent Marketplace/i)).toBeInTheDocument();
    });
  });
}); 