import React from 'react';

// Create mock motion components
const createMockComponent = (tag: string) => {
  return React.forwardRef(({ children, ...props }: any, ref: any) => {
    // Remove framer-motion specific props
    const { 
      whileInView, whileHover, whileTap, whileFocus, whileDrag,
      initial, animate, transition, 
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
    whileInView, whileHover, whileTap, whileFocus, whileDrag,
    initial, animate, transition,
    layout, layoutId, layoutDependency, layoutScroll,
    drag, dragConstraints, dragElastic, dragMomentum,
    dragPropagation, dragSnapToOrigin, dragTransition,
    onDrag, onDragEnd, onDragStart, onDragTransitionEnd,
    ...restProps 
  } = props;
  
  // Simply render children without animation logic
  return React.createElement('div', { ...restProps, ref }, children);
});

// Export motion components
export const motion = motionComponents;
export { AnimatePresence };

// Export hooks and utilities
export const useAnimation = () => ({
  start: () => {},
  stop: () => {},
  set: () => {},
});

export const useAnimationControls = () => ({
  start: () => {},
  stop: () => {},
  set: () => {},
});

export const useMotionValue = (initial: any) => ({
  get: () => initial,
  set: () => {},
  on: () => {},
});

export const useTransform = (_value: any, _input: any, output: any) => ({
  get: () => output,
  set: () => {},
  on: () => {},
});

export const useSpring = (value: any, _config: any) => ({
  get: () => value,
  set: () => {},
  on: () => {},
});

export const useMotionValueEvent = () => {};

export const useInView = () => ({ ref: () => {}, inView: false });

export const useScroll = () => ({
  scrollX: { get: () => 0, on: () => {} },
  scrollY: { get: () => 0, on: () => {} },
  scrollXProgress: { get: () => 0, on: () => {} },
  scrollYProgress: { get: () => 0, on: () => {} },
});

export const useScrollControls = () => ({
  scrollTo: () => {},
  scrollToTop: () => {},
  scrollToBottom: () => {},
});

export const useCycle = (...args: any[]) => [args[0], () => {}];

export const useReducedMotion = () => false;

export const usePresence = () => ({ isPresent: true, safeToRemove: () => {} });

export const useIsPresent = () => true;

export const useAnimate = () => [() => {}, () => {}];

export const useMotionTemplate = (template: any) => template;

export const LazyMotion = ({ children }: any) => children;

export const domAnimation = {};

export const domTransition = {}; 