import * as Sentry from "@sentry/nextjs";
import React from "react";

// Get the logger from Sentry (with fallback for testing)
const { logger } = Sentry || { logger: console };

/**
 * Sentry Error Boundary Component
 * Use this to wrap components that might throw errors
 */
export class SentryErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}

// Default error fallback component
function DefaultErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-4">We've been notified about this error.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

/**
 * Utility functions for Sentry logging and error tracking
 */
export const SentryUtils = {
  /**
   * Capture an exception with context
   */
  captureException: (error: Error, context?: Record<string, any>) => {
    Sentry.captureException(error, {
      extra: context,
    });
  },

  /**
   * Capture a message
   */
  captureMessage: (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
    Sentry.captureMessage(message, level);
  },

  /**
   * Set user context
   */
  setUser: (user: { id: string; email?: string; username?: string }) => {
    Sentry.setUser(user);
  },

  /**
   * Set tags for filtering
   */
  setTag: (key: string, value: string) => {
    Sentry.setTag(key, value);
  },

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb: (message: string, category?: string, level?: 'info' | 'warning' | 'error') => {
    Sentry.addBreadcrumb({
      message,
      category: category || 'custom',
      level: level || 'info',
    });
  },

  /**
   * Start a span for performance monitoring
   */
  startSpan<T>(
    options: { op: string; name: string; attributes?: Record<string, any> },
    callback: (span: any) => T
  ): T {
    return Sentry.startSpan(options, callback);
  },

  /**
   * Logger utilities using Sentry's structured logging
   */
  logger: {
    trace: (message: string, context?: Record<string, any>) => {
      logger.trace(message, context);
    },
    
    debug: (message: string, context?: Record<string, any>) => {
      logger.debug(message, context);
    },
    
    info: (message: string, context?: Record<string, any>) => {
      logger.info(message, context);
    },
    
    warn: (message: string, context?: Record<string, any>) => {
      logger.warn(message, context);
    },
    
    error: (message: string, context?: Record<string, any>) => {
      logger.error(message, context);
    },
    
    fatal: (message: string, context?: Record<string, any>) => {
      logger.fatal(message, context);
    },
    
    // Template literal function for structured logging
    fmt: (strings: TemplateStringsArray, ...values: any[]) => {
      return logger.fmt(strings, ...values);
    },
  },
};

/**
 * Example usage components and functions
 */

// Example: Button click tracking
export function TrackedButton({ 
  children, 
  onClick, 
  trackingName,
  ...props 
}: { 
  children: React.ReactNode; 
  onClick: () => void; 
  trackingName: string;
  [key: string]: any;
}) {
  const handleClick = () => {
    SentryUtils.startSpan(
      {
        op: "ui.click",
        name: trackingName,
        attributes: {
          component: "TrackedButton",
          timestamp: new Date().toISOString(),
        },
      },
      () => {
        onClick();
      }
    );
  };

  return (
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  );
}

// Example: API call tracking
export async function trackedFetch<T>(
  url: string, 
  options?: RequestInit
): Promise<T> {
  return SentryUtils.startSpan(
    {
      op: "http.client",
      name: `GET ${url}`,
      attributes: {
        url,
        method: options?.method || 'GET',
      },
    },
    async () => {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        SentryUtils.captureException(
          new Error(`HTTP ${response.status}: ${response.statusText}`),
          { url, status: response.status }
        );
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    }
  );
}

// Example: Database operation tracking
export async function trackedDatabaseOperation<T>(
  operation: string,
  callback: () => Promise<T>
): Promise<T> {
  return SentryUtils.startSpan(
    {
      op: "db.query",
      name: operation,
      attributes: {
        operation,
        timestamp: new Date().toISOString(),
      },
    },
    async () => {
      try {
        return await callback();
      } catch (error) {
        SentryUtils.captureException(error as Error, {
          operation,
          type: 'database',
        });
        throw error;
      }
    }
  );
}

// Example: Form submission tracking
export function trackFormSubmission(
  formName: string,
  formData: Record<string, any>
) {
  SentryUtils.startSpan(
    {
      op: "form.submit",
      name: `Submit ${formName}`,
      attributes: {
        formName,
        fieldCount: Object.keys(formData).length,
      },
    },
    () => {
      SentryUtils.logger.info(`Form submitted: ${formName}`, {
        formName,
        fieldCount: Object.keys(formData).length,
      });
    }
  );
}
