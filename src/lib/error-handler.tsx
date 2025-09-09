/**
 * Production-ready error handling system
 * Provides consistent error handling across the application
 */

import React from 'react';
import { logger } from './logger';
import { NextResponse } from 'next/server';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends CustomError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends CustomError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

export class ExternalServiceError extends CustomError {
  constructor(service: string, message: string = 'External service error') {
    super(`${service}: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR');
    this.name = 'ExternalServiceError';
  }
}

/**
 * Error handler for API routes
 */
export function handleApiError(error: unknown): NextResponse {
  // Log the error
  if (error instanceof CustomError) {
    logger.error('API Error', {
      code: error.code,
      statusCode: error.statusCode,
      message: error.message,
      stack: error.stack,
    });
  } else if (error instanceof Error) {
    logger.error('Unexpected API Error', {
      message: error.message,
      stack: error.stack,
    });
  } else {
    logger.error('Unknown API Error', { error });
  }

  // Return appropriate response
  if (error instanceof CustomError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
        },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: process.env.NODE_ENV === 'production' 
            ? 'An internal error occurred' 
            : error.message,
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
      },
    },
    { status: 500 }
  );
}

/**
 * Async error wrapper for API routes
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (error) {
      throw error; // Re-throw to be handled by handleApiError
    }
  };
}

/**
 * Error boundary for React components
 */
export function createErrorBoundary() {
  return class ErrorBoundary extends React.Component<
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
      logger.error('React Error Boundary caught an error', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }

    render() {
      if (this.state.hasError) {
        const FallbackComponent = this.props.fallback || DefaultErrorFallback;
        return React.createElement(FallbackComponent as React.ComponentType<{ error: Error }>, { error: this.state.error! });
      }

      return this.props.children;
    }
  };
}

function DefaultErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Something went wrong
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {process.env.NODE_ENV === 'development' 
              ? error.message 
              : 'An unexpected error occurred. Please try again.'}
          </p>
          <div className="mt-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Utility functions for common error scenarios
 */
export const ErrorUtils = {
  /**
   * Wrap async operations with error handling
   */
  async safe<T>(operation: () => Promise<T>, fallback?: T): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      logger.error('Safe operation failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      return fallback;
    }
  },

  /**
   * Validate required fields
   */
  validateRequired(data: Record<string, any>, fields: string[]): void {
    const missing = fields.filter(field => !data[field]);
    if (missing.length > 0) {
      throw new ValidationError(`Missing required fields: ${missing.join(', ')}`);
    }
  },

  /**
   * Check if error is operational (expected)
   */
  isOperationalError(error: Error): boolean {
    return error instanceof CustomError && error.isOperational;
  },
};

export default {
  CustomError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  handleApiError,
  withErrorHandling,
  createErrorBoundary,
  ErrorUtils,
};
