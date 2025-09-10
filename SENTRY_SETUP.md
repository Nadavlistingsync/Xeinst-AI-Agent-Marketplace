# Sentry Setup Guide

This guide explains how to set up and use Sentry for error monitoring, performance tracking, and logging in your Next.js application.

## 🚀 Quick Setup

### 1. Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Sentry DSN (required)
NEXT_PUBLIC_SENTRY_DSN="https://d67816561972b9741ac09c8cc98754b7@o4509995254087680.ingest.us.sentry.io/4509995256643584"

# Sentry Auth Token (for releases and source maps)
SENTRY_AUTH_TOKEN="your_sentry_auth_token_here"

# Sentry Organization and Project (for releases)
SENTRY_ORG="your-sentry-org"
SENTRY_PROJECT="your-sentry-project"
```

### 2. Configuration Files

The following Sentry configuration files have been created:

- `instrumentation-client.ts` - Client-side Sentry initialization
- `sentry.server.config.ts` - Server-side Sentry initialization  
- `sentry.edge.config.ts` - Edge runtime Sentry initialization
- `instrumentation.ts` - Root instrumentation file

### 3. Utilities and Examples

- `src/lib/sentry-utils.ts` - Comprehensive Sentry utilities and helpers
- `src/components/SentryExample.tsx` - Example component showing Sentry usage

## 📊 Features Enabled

### Error Monitoring
- Automatic error capture and reporting
- Error boundaries for React components
- Custom error context and metadata

### Performance Monitoring
- Automatic performance tracking
- Custom spans for user interactions
- API call performance monitoring
- Database operation tracking

### Logging
- Structured logging with Sentry's logger
- Console integration (logs console.log, console.warn, console.error)
- Template literal logging with `logger.fmt`

### Session Replay
- User session recordings
- Error-focused session replay
- Privacy-focused (masks sensitive data)

## 🛠 Usage Examples

### Basic Error Tracking

```typescript
import { SentryUtils } from '@/lib/sentry-utils';

// Capture an exception
try {
  // Some risky operation
} catch (error) {
  SentryUtils.captureException(error, {
    context: 'user-action',
    userId: 'user-123'
  });
}
```

### Performance Tracking

```typescript
import { SentryUtils } from '@/lib/sentry-utils';

// Track button clicks
const handleClick = () => {
  SentryUtils.startSpan(
    {
      op: "ui.click",
      name: "Button Click",
      attributes: {
        buttonId: "submit-form",
        timestamp: new Date().toISOString()
      }
    },
    () => {
      // Your click handler logic
    }
  );
};
```

### API Call Tracking

```typescript
import { trackedFetch } from '@/lib/sentry-utils';

// Automatically tracked API calls
const data = await trackedFetch('/api/users/123');
```

### Structured Logging

```typescript
import { SentryUtils } from '@/lib/sentry-utils';

// Basic logging
SentryUtils.logger.info("User logged in", {
  userId: "user-123",
  timestamp: new Date().toISOString()
});

// Template literal logging
const userId = "user-123";
SentryUtils.logger.info(
  SentryUtils.logger.fmt`User ${userId} performed action: ${action}`,
  { userId, action }
);
```

### Error Boundaries

```typescript
import { SentryErrorBoundary } from '@/lib/sentry-utils';

function App() {
  return (
    <SentryErrorBoundary>
      <YourComponent />
    </SentryErrorBoundary>
  );
}
```

### User Context

```typescript
import { SentryUtils } from '@/lib/sentry-utils';

// Set user context for better error tracking
SentryUtils.setUser({
  id: "user-123",
  email: "user@example.com",
  username: "johndoe"
});
```

### Tags and Breadcrumbs

```typescript
import { SentryUtils } from '@/lib/sentry-utils';

// Set tags for filtering
SentryUtils.setTag("feature", "checkout");
SentryUtils.setTag("environment", "production");

// Add breadcrumbs for debugging
SentryUtils.addBreadcrumb("User clicked checkout button", "user-action", "info");
```

## 🎯 Best Practices

### 1. Error Handling
- Always wrap risky operations in try-catch blocks
- Provide meaningful context when capturing errors
- Use error boundaries for React components

### 2. Performance Monitoring
- Create spans for meaningful user actions
- Track API calls and database operations
- Add relevant attributes to spans

### 3. Logging
- Use structured logging with context objects
- Use appropriate log levels (trace, debug, info, warn, error, fatal)
- Leverage template literals for dynamic messages

### 4. Privacy and Security
- Never log sensitive data (passwords, tokens, PII)
- Use beforeSend hooks to filter sensitive information
- Configure session replay to mask sensitive fields

## 🔧 Configuration Options

### Client Configuration (`instrumentation-client.ts`)
- Session replay enabled
- Console logging integration
- Performance monitoring
- Privacy-focused data filtering

### Server Configuration (`sentry.server.config.ts`)
- Server-side error tracking
- API route monitoring
- Database operation tracking
- Sensitive data filtering

### Edge Configuration (`sentry.edge.config.ts`)
- Edge runtime support
- Middleware monitoring
- Lightweight error tracking

## 📈 Monitoring Dashboard

Once configured, you can monitor your application in the Sentry dashboard:

1. **Issues** - View and manage errors
2. **Performance** - Monitor application performance
3. **Releases** - Track deployments and releases
4. **Alerts** - Set up notifications for errors
5. **Sessions** - View user session replays

## 🚨 Troubleshooting

### Common Issues

1. **DSN not working**: Ensure `NEXT_PUBLIC_SENTRY_DSN` is set correctly
2. **No events in Sentry**: Check network connectivity and DSN configuration
3. **Too many events**: Adjust `tracesSampleRate` in production
4. **Missing source maps**: Configure `SENTRY_AUTH_TOKEN` for releases

### Debug Mode

Enable debug mode in development:

```typescript
// In your Sentry config
debug: process.env.NODE_ENV === 'development'
```

This will log Sentry events to the console for debugging.

## 📚 Additional Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Session Replay](https://docs.sentry.io/product/session-replay/)
- [Sentry Logging](https://docs.sentry.io/product/logs/)

## 🎉 Example Component

Check out `src/components/SentryExample.tsx` for a comprehensive example of all Sentry features in action!
