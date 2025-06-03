export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const Sentry = require('@sentry/nextjs');
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      debug: process.env.NODE_ENV === 'development',
    });
  }
} 