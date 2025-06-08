import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError, PrismaClientValidationError, PrismaClientInitializationError } from '@prisma/client/runtime/library';
import * as Sentry from '@sentry/nextjs';

declare global {
  var prisma: PrismaClient | undefined;
}

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 10000;

function getRetryDelay(retryCount: number): number {
  return Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retryCount), MAX_RETRY_DELAY);
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof PrismaClientKnownRequestError) {
    return error.code === 'P1001' || // Connection error
           error.code === 'P1002' || // Connection timed out
           error.code === 'P1008' || // Operations timed out
           error.code === 'P1017';   // Server closed the connection
  }
  return false;
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status: number = 500
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export function isPrismaError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    return code === 'P1001' || // Connection error
           code === 'P1002' || // Connection timed out
           code === 'P1008' || // Operations timed out
           code === 'P1017';   // Server closed the connection
  }
  return false;
}

export function handlePrismaError(error: unknown): never {
  if (isPrismaError(error)) {
    throw new Error('Database connection error. Please try again later.');
  }
  throw error;
}

export function handleDatabaseError(error: unknown): never {
  // Only log errors in non-test environments
  if (process.env.NODE_ENV !== 'test') {
    console.error('Database Error:', error);
  }
  
  // Only report to Sentry in production and for non-validation errors
  if (process.env.NODE_ENV === 'production' && 
      !(error instanceof PrismaClientValidationError)) {
    Sentry.captureException(error);
  }

  if (error instanceof PrismaClientInitializationError) {
    throw new DatabaseError('Database initialization error', 'INIT_ERROR', 500);
  }

  // Handle known Prisma error codes
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new DatabaseError('Unique constraint violation', 'P2002', 409);
    }
    if (error.code === 'P2025') {
      throw new DatabaseError('Record not found', 'P2025', 404);
    }
  }
  if (error instanceof PrismaClientValidationError) {
    throw new DatabaseError('Validation error', 'VALIDATION_ERROR', 400);
  }

  throw new DatabaseError('An unexpected database error occurred', 'UNKNOWN_ERROR', 500);
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      const delayMs = getRetryDelay(MAX_RETRIES - retries);
      await delay(delayMs);
      try {
        return await withRetry(operation, retries - 1);
      } catch (retryError) {
        // If the retry fails, throw the original error
        throw error;
      }
    }
    // For non-retryable errors or when out of retries, handle the error
    handleDatabaseError(error);
    throw error; // This line should never be reached due to handleDatabaseError
  }
} 