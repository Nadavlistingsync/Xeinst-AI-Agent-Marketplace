"use client";

import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/performance';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Web Vitals monitoring
    if (typeof window !== 'undefined') {
      // Import web-vitals dynamically
      import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB }) => {
        onCLS(reportWebVitals);
        onFCP(reportWebVitals);
        onLCP(reportWebVitals);
        onTTFB(reportWebVitals);
      });

      // Performance observer for custom metrics
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              console.log('Navigation timing:', {
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
                totalTime: navEntry.loadEventEnd - navEntry.fetchStart,
              });
            }
          }
        });

        observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
      }

      // Memory usage monitoring (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log('Memory usage:', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB',
        });
      }

      // Connection monitoring
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        console.log('Connection info:', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink + ' Mbps',
          rtt: connection.rtt + ' ms',
        });
      }
    }
  }, []);

  return null; // This component doesn't render anything
}

// Performance optimization hook
export const usePerformanceOptimization = () => {
  useEffect(() => {
    // Preload critical resources
    const criticalResources = [
      { href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2' },
      { href: '/api/health', as: 'fetch' },
    ];

    criticalResources.forEach(({ href, as, type }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      if (type) link.type = type;
      if (as === 'font') link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Prefetch likely next pages
    const likelyPages = ['/pricing', '/product/builder', '/developers/docs'];
    likelyPages.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);
};

// Lazy loading hook
export const useLazyLoading = (threshold = 0.1) => {
  useEffect(() => {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || '';
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      }, { threshold });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for browsers without IntersectionObserver
      images.forEach(img => {
        const imgElement = img as HTMLImageElement;
        imgElement.src = imgElement.dataset.src || '';
      });
    }
  }, [threshold]);
};
