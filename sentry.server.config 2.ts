import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://d67816561972b9741ac09c8cc98754b7@o4509995254087680.ingest.us.sentry.io/4509995256643584",
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Experiments
  _experiments: {
    enableLogs: true,
  },
  
  // Integrations
  integrations: [
    // Send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  
  // Before send hook to filter sensitive data
  beforeSend(event, hint) {
    // Filter out non-error events in development
    if (process.env.NODE_ENV === 'development' && event.level !== 'error') {
      return null;
    }
    
    // Remove sensitive data from server events
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    
    if (event.request?.headers) {
      // Remove sensitive headers
      const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
      sensitiveHeaders.forEach(header => {
        if (event.request?.headers?.[header]) {
          delete event.request.headers[header];
        }
      });
    }
    
    return event;
  },
  
  // Tags
  initialScope: {
    tags: {
      component: 'server',
    },
  },
});
