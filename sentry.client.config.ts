import * as Sentry from '@sentry/nextjs';
import { BrowserTracing } from '@sentry/browser';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: process.env.NODE_ENV === 'development',
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    new BrowserTracing({
      tracePropagationTargets: ['localhost', process.env.NEXT_PUBLIC_APP_URL],
    }),
  ],
}); 