/**
 * Analytics Utilities
 * Privacy-focused analytics for user behavior tracking
 */

import { useState, useEffect } from 'react';

// Analytics events
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: string;
  userId?: string;
  sessionId?: string;
}

// Analytics provider interface
interface AnalyticsProvider {
  track: (event: AnalyticsEvent) => void;
  identify: (userId: string, properties?: Record<string, any>) => void;
  page: (name: string, properties?: Record<string, any>) => void;
}

// Simple analytics implementation
class SimpleAnalytics implements AnalyticsProvider {
  private sessionId: string;
  
  constructor() {
    this.sessionId = this.generateSessionId();
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  track(event: AnalyticsEvent): void {
    const enrichedEvent = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
      sessionId: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', enrichedEvent);
    }
    
    // Send to analytics endpoint
    if (typeof window !== 'undefined') {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrichedEvent),
      }).catch(console.error);
    }
  }
  
  identify(userId: string, properties?: Record<string, any>): void {
    this.track({
      name: 'user_identified',
      properties: {
        userId,
        ...properties,
      },
    });
  }
  
  page(name: string, properties?: Record<string, any>): void {
    this.track({
      name: 'page_view',
      properties: {
        page: name,
        ...properties,
      },
    });
  }
}

// Create analytics instance
export const analytics = new SimpleAnalytics();

// Predefined events for marketplace
export const marketplaceEvents = {
  // Search events
  search: (query: string, resultCount: number) => 
    analytics.track({
      name: 'marketplace_search',
      properties: { query, resultCount, source: 'marketplace' }
    }),
  
  // Filter events
  filterApplied: (filterType: string, filterValue: string) =>
    analytics.track({
      name: 'marketplace_filter_applied',
      properties: { filterType, filterValue }
    }),
  
  // View mode events
  viewModeChanged: (mode: 'grid' | 'list') =>
    analytics.track({
      name: 'marketplace_view_mode_changed',
      properties: { mode }
    }),
  
  // Agent interaction events
  agentViewed: (agentId: string, agentName: string) =>
    analytics.track({
      name: 'agent_viewed',
      properties: { agentId, agentName, source: 'marketplace' }
    }),
  
  agentClicked: (agentId: string, agentName: string, position: number) =>
    analytics.track({
      name: 'agent_clicked',
      properties: { agentId, agentName, position, source: 'marketplace' }
    }),
  
  // Navigation events
  navigationClicked: (destination: string, source: string) =>
    analytics.track({
      name: 'navigation_clicked',
      properties: { destination, source }
    }),
  
  // Performance events
  pageLoadTime: (duration: number, page: string) =>
    analytics.track({
      name: 'page_load_time',
      properties: { duration, page }
    }),
  
  // Error events
  errorOccurred: (error: string, context: string) =>
    analytics.track({
      name: 'error_occurred',
      properties: { error, context, severity: 'error' }
    }),
};

// Privacy-compliant analytics hook
export function useAnalytics() {
  const [consent, setConsent] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check for existing consent
    const existingConsent = localStorage.getItem('analytics-consent');
    if (existingConsent) {
      setConsent(existingConsent === 'true');
    }
  }, []);
  
  const giveConsent = () => {
    setConsent(true);
    localStorage.setItem('analytics-consent', 'true');
  };
  
  const revokeConsent = () => {
    setConsent(false);
    localStorage.setItem('analytics-consent', 'false');
    // Clear any stored analytics data
    localStorage.removeItem('analytics-session');
  };
  
  const trackEvent = (event: AnalyticsEvent) => {
    if (consent === true) {
      analytics.track(event);
    }
  };
  
  return {
    consent,
    giveConsent,
    revokeConsent,
    trackEvent,
    hasConsent: consent === true,
  };
}

// Page view tracking
export function trackPageView(page: string, properties?: Record<string, any>) {
  analytics.page(page, properties);
}

// Error tracking
export function trackError(error: Error, context: string, additionalData?: Record<string, any>) {
  analytics.track({
    name: 'javascript_error',
    properties: {
      message: error.message,
      stack: error.stack,
      context,
      ...additionalData,
    },
  });
}

// Performance tracking
export function trackPerformance() {
  if (typeof window === 'undefined') return;
  
  // Track page load performance
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      analytics.track({
        name: 'page_performance',
        properties: {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        },
      });
    }
  });
  
  // Track Core Web Vitals
  import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
    onCLS((metric) => analytics.track({ name: 'web_vital_cls', properties: metric }));
    onFID((metric) => analytics.track({ name: 'web_vital_fid', properties: metric }));
    onFCP((metric) => analytics.track({ name: 'web_vital_fcp', properties: metric }));
    onLCP((metric) => analytics.track({ name: 'web_vital_lcp', properties: metric }));
    onTTFB((metric) => analytics.track({ name: 'web_vital_ttfb', properties: metric }));
  });
}

// A/B testing utilities
export function getVariant(testName: string, variants: string[]): string {
  if (typeof window === 'undefined') return variants[0];
  
  // Simple hash-based variant assignment
  const userId = localStorage.getItem('user-id') || 'anonymous';
  const hash = Array.from(testName + userId).reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const variantIndex = Math.abs(hash) % variants.length;
  const variant = variants[variantIndex];
  
  // Track variant assignment
  analytics.track({
    name: 'ab_test_variant_assigned',
    properties: { testName, variant, userId }
  });
  
  return variant;
}

// Feature flag utilities
export function isFeatureEnabled(featureName: string): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check environment variables first
  const envFlag = process.env[`NEXT_PUBLIC_FEATURE_${featureName.toUpperCase()}`];
  if (envFlag !== undefined) {
    return envFlag === 'true';
  }
  
  // Check localStorage for user-specific flags
  const userFlags = localStorage.getItem('feature-flags');
  if (userFlags) {
    try {
      const flags = JSON.parse(userFlags);
      return flags[featureName] === true;
    } catch {
      return false;
    }
  }
  
  return false;
}
