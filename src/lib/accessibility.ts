/**
 * Accessibility Utilities
 * Comprehensive a11y helpers for liquid design system
 */

// Screen reader announcements
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Clean up after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Focus management
export function trapFocus(container: HTMLElement) {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };
  
  container.addEventListener('keydown', handleTabKey);
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

// Keyboard navigation
export const keyboardNavigation = {
  // Handle arrow key navigation in grids
  handleGridNavigation: (e: KeyboardEvent, gridContainer: HTMLElement) => {
    const items = Array.from(gridContainer.querySelectorAll('[role="gridcell"], [data-grid-item]'));
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    
    if (currentIndex === -1) return;
    
    const columns = parseInt(getComputedStyle(gridContainer).gridTemplateColumns.split(' ').length.toString()) || 1;
    let nextIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowRight':
        nextIndex = Math.min(currentIndex + 1, items.length - 1);
        break;
      case 'ArrowLeft':
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'ArrowDown':
        nextIndex = Math.min(currentIndex + columns, items.length - 1);
        break;
      case 'ArrowUp':
        nextIndex = Math.max(currentIndex - columns, 0);
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }
    
    e.preventDefault();
    (items[nextIndex] as HTMLElement).focus();
  },
  
  // Handle list navigation
  handleListNavigation: (e: KeyboardEvent, listContainer: HTMLElement) => {
    const items = Array.from(listContainer.querySelectorAll('[role="option"], [data-list-item]'));
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    
    if (currentIndex === -1) return;
    
    let nextIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowDown':
        nextIndex = Math.min(currentIndex + 1, items.length - 1);
        break;
      case 'ArrowUp':
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }
    
    e.preventDefault();
    (items[nextIndex] as HTMLElement).focus();
  }
};

// Motion preferences
export function respectsReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getMotionConfig() {
  const reducedMotion = respectsReducedMotion();
  
  return {
    initial: reducedMotion ? {} : { opacity: 0, y: 20 },
    animate: reducedMotion ? {} : { opacity: 1, y: 0 },
    transition: reducedMotion ? { duration: 0 } : { duration: 0.3 },
    whileHover: reducedMotion ? {} : { scale: 1.02 },
    whileTap: reducedMotion ? {} : { scale: 0.98 },
  };
}

// Color contrast utilities
export function getContrastRatio(color1: string, color2: string): number {
  // Simplified contrast ratio calculation
  // In a real implementation, you'd parse the colors and calculate luminance
  return 4.5; // Placeholder - implement actual calculation
}

export function meetsWCAGContrast(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean {
  const ratio = getContrastRatio(foreground, background);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}

// Aria utilities
export function generateId(prefix: string = 'liquid'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getAriaLabel(element: HTMLElement): string {
  return element.getAttribute('aria-label') || 
         element.getAttribute('aria-labelledby') || 
         element.textContent || 
         'Interactive element';
}

// Skip links
export function createSkipLink(targetId: string, text: string = 'Skip to main content'): HTMLElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400';
  
  return skipLink;
}

// Live region for dynamic content updates
export function createLiveRegion(priority: 'polite' | 'assertive' = 'polite'): HTMLElement {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', priority);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.id = 'live-region';
  
  document.body.appendChild(liveRegion);
  return liveRegion;
}

// Update live region content
export function updateLiveRegion(message: string) {
  const liveRegion = document.getElementById('live-region');
  if (liveRegion) {
    liveRegion.textContent = message;
  }
}

// Focus visible utilities
export function addFocusVisiblePolyfill() {
  // Add focus-visible polyfill for better focus indicators
  if (typeof window === 'undefined') return;
  
  let hadKeyboardEvent = true;
  const keyboardThrottleTimeout = 100;
  
  function onKeyDown(e: KeyboardEvent) {
    if (e.metaKey || e.altKey || e.ctrlKey) return;
    hadKeyboardEvent = true;
  }
  
  function onPointerDown() {
    hadKeyboardEvent = false;
  }
  
  function onFocus(e: FocusEvent) {
    if (hadKeyboardEvent || (e.target as HTMLElement).matches(':focus-visible')) {
      (e.target as HTMLElement).classList.add('focus-visible');
    }
  }
  
  function onBlur(e: FocusEvent) {
    (e.target as HTMLElement).classList.remove('focus-visible');
  }
  
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('pointerdown', onPointerDown, true);
  document.addEventListener('focus', onFocus, true);
  document.addEventListener('blur', onBlur, true);
}

// Accessibility checker
export function checkAccessibility(element: HTMLElement): {
  issues: string[];
  warnings: string[];
  score: number;
} {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  // Check for missing alt text on images
  const images = element.querySelectorAll('img');
  images.forEach(img => {
    if (!img.alt && !img.getAttribute('aria-label')) {
      issues.push(`Image missing alt text: ${img.src}`);
    }
  });
  
  // Check for missing form labels
  const inputs = element.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    const id = input.id;
    const hasLabel = id && document.querySelector(`label[for="${id}"]`);
    const hasAriaLabel = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');
    
    if (!hasLabel && !hasAriaLabel) {
      issues.push(`Form input missing label: ${input.type || 'unknown'}`);
    }
  });
  
  // Check for proper heading hierarchy
  const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  let lastLevel = 0;
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1));
    if (level > lastLevel + 1) {
      warnings.push(`Heading hierarchy skip: ${heading.tagName} after h${lastLevel}`);
    }
    lastLevel = level;
  });
  
  // Check for interactive elements without proper roles
  const interactiveElements = element.querySelectorAll('[onclick], [onkeydown]');
  interactiveElements.forEach(el => {
    if (!el.getAttribute('role') && el.tagName !== 'BUTTON' && el.tagName !== 'A') {
      warnings.push(`Interactive element missing role: ${el.tagName}`);
    }
  });
  
  // Calculate accessibility score
  const totalChecks = 10;
  const issueCount = issues.length + warnings.length * 0.5;
  const score = Math.max(0, Math.round((1 - issueCount / totalChecks) * 100));
  
  return { issues, warnings, score };
}
