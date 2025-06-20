import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

export class AppError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleApiError(error: unknown): ApiError {
  // Handle known error types
  if (error instanceof AppError) {
    return {
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.details
    };
  }

  if (error instanceof ZodError) {
    return {
      message: 'Validation error',
      status: 400,
      code: 'VALIDATION_ERROR',
      details: error.errors
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return {
      message: error.message,
      status: 400,
      code: error.code,
      details: error.meta
    };
  }

  if (error instanceof Error) {
    // Log unexpected errors to Sentry
    if (!(error instanceof ZodError) && !(error instanceof Prisma.PrismaClientKnownRequestError)) {
      Sentry.captureException(error);
    }
    return {
      message: error.message,
      status: 500,
      code: error.name
    };
  }

  // Handle unknown error types
  Sentry.captureException(error);
  return {
    message: 'An unexpected error occurred',
    status: 500,
    code: 'UNKNOWN_ERROR'
  };
}

export function createErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details,
      },
      { status: error.status }
    );
  }
  
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation Error',
        details: error.errors,
      },
      { status: 400 }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return NextResponse.json(
      {
        error: 'Database Error',
        message: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      error: 'Unknown Error',
      message: 'An unexpected error occurred',
    },
    { status: 500 }
  );
}

// Utility function to wrap async operations with error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const apiError = handleApiError(error);
    if (context) {
      Sentry.setContext('operation_context', context);
    }
    throw new AppError(
      apiError.message,
      apiError.status,
      apiError.code,
      apiError.details
    );
  }
} 