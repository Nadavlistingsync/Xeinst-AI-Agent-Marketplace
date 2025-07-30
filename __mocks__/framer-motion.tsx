import React from 'react';

// Create mock motion components
const createMockComponent = (tag: string) => {
  return React.forwardRef(({ children, ...props }: any, ref: any) => {
    // Remove framer-motion specific props
    const { 
      whileInView, initial, animate, transition, 
      layout, layoutId, layoutDependency, layoutScroll,
      drag, dragConstraints, dragElastic, dragMomentum,
      dragPropagation, dragSnapToOrigin, dragTransition,
      onDrag, onDragEnd, onDragStart, onDragTransitionEnd,
      ...restProps 
    } = props;
    return React.createElement(tag, { ...restProps, ref }, children);
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

// Create a proper AnimatePresence component
const AnimatePresence = React.forwardRef(({ children, mode, ...props }: any, ref: any) => {
  // Remove framer-motion specific props
  const { 
    whileInView, initial, animate, transition,
    layout, layoutId, layoutDependency, layoutScroll,
    drag, dragConstraints, dragElastic, dragMomentum,
    dragPropagation, dragSnapToOrigin, dragTransition,
    onDrag, onDragEnd, onDragStart, onDragTransitionEnd,
    ...restProps 
  } = props;
  
  // Simply render children without animation logic
  return React.createElement('div', { ...restProps, ref }, children);
});

export {
  motion: motionComponents,
  AnimatePresence,
  useAnimation: () => ({
    start: () => {},
    stop: () => {},
    set: () => {},
  }),
  useAnimationControls: () => ({
    start: () => {},
    stop: () => {},
    set: () => {},
  }),
  useMotionValue: (initial: any) => ({
    get: () => initial,
    set: () => {},
    on: () => {},
  }),
  useTransform: (value: any, input: any, output: any) => ({
    get: () => output,
    set: () => {},
    on: () => {},
  }),
  useSpring: (value: any, config: any) => ({
    get: () => value,
    set: () => {},
    on: () => {},
  }),
  useMotionValueEvent: () => {},
  useInView: () => ({ ref: () => {}, inView: false }),
  useScroll: () => ({
    scrollX: { get: () => 0, on: () => {} },
    scrollY: { get: () => 0, on: () => {} },
    scrollXProgress: { get: () => 0, on: () => {} },
    scrollYProgress: { get: () => 0, on: () => {} },
  }),
  useScrollControls: () => ({
    scrollTo: () => {},
    scrollToTop: () => {},
    scrollToBottom: () => {},
  }),
  useCycle: (...args: any[]) => [args[0], () => {}],
  useReducedMotion: () => false,
  usePresence: () => ({ isPresent: true, safeToRemove: () => {} }),
  useIsPresent: () => true,
  useAnimate: () => [() => {}, () => {}],
  useMotionTemplate: (template: any) => template,
  LazyMotion: ({ children }: any) => children,
  domAnimation: {},
  domTransition: {},
}; 