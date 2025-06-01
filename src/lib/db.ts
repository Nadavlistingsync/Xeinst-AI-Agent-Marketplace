import { PrismaClient, Prisma } from '@prisma/client';
import { createErrorResponse } from './api';
import * as Sentry from '@sentry/nextjs';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 10000;

function getRetryDelay(retryCount: number): number {
  return Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retryCount), MAX_RETRY_DELAY);
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
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

export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      const delayMs = getRetryDelay(MAX_RETRIES - retries);
      console.log(`Retrying database operation after ${delayMs}ms. Attempts remaining: ${retries - 1}`);
      await delay(delayMs);
      return withRetry(operation, retries - 1);
    }
    throw error;
  }
}

export function handleDatabaseError(error: unknown): never {
  // Log the error
  console.error('Database Error:', error);
  
  // Report to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new DatabaseError('Unique constraint violation', error.code, 409);
      case 'P2025':
        throw new DatabaseError('Record not found', error.code, 404);
      case 'P2003':
        throw new DatabaseError('Foreign key constraint violation', error.code, 400);
      case 'P2014':
        throw new DatabaseError('Invalid ID', error.code, 400);
      default:
        throw new DatabaseError('Database error', error.code, 500);
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new DatabaseError('Validation error', 'VALIDATION_ERROR', 400);
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new DatabaseError('Database initialization error', 'INIT_ERROR', 500);
  }

  throw new DatabaseError('An unexpected database error occurred', 'UNKNOWN_ERROR', 500);
}

// Export a singleton instance of PrismaClient
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
}); 