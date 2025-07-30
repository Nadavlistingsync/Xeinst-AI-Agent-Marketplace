// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock framer-motion
const React = require('react');

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal();
  const createMockComponent = (tag) => {
    return React.forwardRef(({ children, ...props }, ref) => {
      // Remove framer-motion specific props
      const { whileInView, initial, animate, transition, ...restProps } = props;
      return React.createElement(tag, { ...restProps, ref }, children);
    });
  };

  const motionComponents = {};
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

  const AnimatePresence = ({ children, mode, ...props }) => {
    // Remove framer-motion specific props
    const { whileInView, initial, animate, transition, ...restProps } = props;
    return React.createElement('div', restProps, children);
  };

  return {
    ...actual,
    motion: motionComponents,
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
    useMotionValue: (initial) => ({
      get: () => initial,
      set: vi.fn(),
      on: vi.fn(),
    }),
    useTransform: (value, input, output) => ({
      get: () => output,
      set: vi.fn(),
      on: vi.fn(),
    }),
    useSpring: (value, config) => ({
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
    useCycle: (...args) => [args[0], vi.fn()],
    useReducedMotion: () => false,
    usePresence: () => ({ isPresent: true, safeToRemove: vi.fn() }),
    useIsPresent: () => true,
    useAnimate: () => [vi.fn(), vi.fn()],
    useMotionTemplate: (template) => template,
    LazyMotion: ({ children }) => children,
    domAnimation: {},
    domTransition: {},
  };
});

// Mock next/router
vi.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      push: vi.fn(),
      replace: vi.fn(),
    }
  },
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    }
  },
  usePathname() {
    return ''
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock next/image
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}))

// Mock fetch
global.fetch = vi.fn();

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

global.Response = require('node-fetch').Response;

global.Headers = global.Headers || function(headers) { return headers || {}; };

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: vi.fn((message, options) => {
    return {
      id: 'mock-toast-id',
      message,
      options
    };
  }),
  Toaster: vi.fn(() => null),
}));

// Mock toast function
global.toast = vi.fn();
global.hotToast = vi.fn();
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => {
      const response = {
        json: () => Promise.resolve(data),
        status: init?.status || 200,
        headers: new Headers(init?.headers || {}),
      };
      return response;
    }),
  },
})); 