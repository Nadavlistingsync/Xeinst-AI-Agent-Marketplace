// Re-export Sentry utilities for backward compatibility
export { SentryUtils as Sentry } from './sentry-utils';

// Legacy functions for backward compatibility
export function initSentry() {
  // Sentry is now initialized automatically via instrumentation files
  console.log('Sentry initialization is handled automatically via instrumentation files');
}

export function captureException(error: Error, context?: Record<string, any>) {
  // Use the new SentryUtils for error capture
  const { SentryUtils } = require('./sentry-utils');
  SentryUtils.captureException(error, context);
}

export function captureMessage(message: string, level: string = 'info') {
  // Use the new SentryUtils for message capture
  const { SentryUtils } = require('./sentry-utils');
  SentryUtils.captureMessage(message, level as 'info' | 'warning' | 'error');
}

export function setUser(user: { id: string; email?: string; username?: string } | null) {
  // Use the new SentryUtils for user context
  const { SentryUtils } = require('./sentry-utils');
  if (user) {
    SentryUtils.setUser(user);
  }
}

export function setTag(key: string, value: string) {
  // Use the new SentryUtils for tags
  const { SentryUtils } = require('./sentry-utils');
  SentryUtils.setTag(key, value);
}

export function setContext(name: string, context: Record<string, any>) {
  // Use the new SentryUtils for context
  const { SentryUtils } = require('./sentry-utils');
  SentryUtils.addBreadcrumb(`Context set: ${name}`, 'context', 'info');
  // Note: SentryUtils doesn't have setContext, but we can use breadcrumbs
} 