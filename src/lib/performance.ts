// Performance optimization utilities

// Lazy loading utility for components
export const lazyLoad = (importFunc: () => Promise<any>) => {
  return importFunc().then(module => module.default);
};

// Image optimization utility
export const optimizeImage = (src: string, width?: number, height?: number, quality = 75) => {
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', quality.toString());
  params.set('f', 'webp');
  
  return `${src}?${params.toString()}`;
};

// Debounce utility for search and input handlers
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for scroll and resize handlers
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Intersection Observer utility for lazy loading
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) => {
  if (typeof window === 'undefined') return null;
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
};

// Preload critical resources
export const preloadResource = (href: string, as: string) => {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

// Prefetch resources for better navigation
export const prefetchResource = (href: string) => {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  if (typeof window === 'undefined') return fn();
  
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
};

// Bundle size optimization - tree shaking helper
export const importOnly = <T>(module: T, key: keyof T) => {
  return module[key];
};

// Memory optimization - cleanup utility
export const cleanup = (cleanupFn: () => void) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', cleanupFn);
  }
};

// Critical CSS inlining helper
export const inlineCriticalCSS = (css: string) => {
  if (typeof document === 'undefined') return;
  
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
};

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
};

// Web Vitals monitoring
export const reportWebVitals = (metric: any) => {
  if (typeof window === 'undefined') return;
  
  // Send to analytics service
  console.log('Web Vital:', metric);
  
  // Example: Send to Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }
};

// API Performance Tracking
export const withApiPerformanceTracking = (handler: any) => {
  return async (req: any, res: any) => {
    const start = performance.now();
    try {
      const result = await handler(req, res);
      const end = performance.now();
      console.log(`API ${req.url} took ${end - start} milliseconds`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`API ${req.url} failed after ${end - start} milliseconds:`, error);
      throw error;
    }
  };
};

// Database Performance Tracking
export const withDbPerformanceTracking = async (operation: string, fn: () => Promise<any>) => {
  const start = performance.now();
  try {
    const result = await fn();
    const end = performance.now();
    console.log(`DB ${operation} took ${end - start} milliseconds`);
    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`DB ${operation} failed after ${end - start} milliseconds:`, error);
    throw error;
  }
};

// Performance Monitor
export const performanceMonitor = {
  track: (name: string, fn: () => any) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  },
  trackAsync: async (name: string, fn: () => Promise<any>) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  },
  trackSyncOperation: (name: string, fn: () => any) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  }
};

// Performance Report
export const getPerformanceReport = () => {
  if (typeof window === 'undefined') return null;
  
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');
  
  return {
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
    firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
    averageResponseTime: 0,
    successRate: 100,
    totalOperations: 0,
    recentErrors: [],
    topOperations: []
  };
};

// Resource hints for better performance
export const addResourceHints = () => {
  if (typeof document === 'undefined') return;
  
  // DNS prefetch for external domains
  const dnsPrefetchDomains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdn.jsdelivr.net',
  ];
  
  dnsPrefetchDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });
  
  // Preconnect to critical origins
  const preconnectOrigins = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];
  
  preconnectOrigins.forEach(origin => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};