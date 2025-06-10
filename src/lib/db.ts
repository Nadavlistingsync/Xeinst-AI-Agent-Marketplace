import { PrismaClient, PrismaClientKnownRequestError, PrismaClientInitializationError, PrismaClientValidationError } from '@prisma/client';
import * as Sentry from '@sentry/nextjs';
import { AppError } from './error-handling';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

declare global {
  var prisma: PrismaClient | undefined;
}

class DatabaseManager {
  private static instance: DatabaseManager;
  private prisma: PrismaClient;
  private isConnected: boolean = false;

  private constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public getClient(): PrismaClient {
    return this.prisma;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      await this.prisma.$connect();
      this.isConnected = true;
    } catch (error) {
      throw new AppError(
        'Failed to connect to database',
        500,
        'DB_CONNECTION_ERROR',
        error
      );
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.prisma.$disconnect();
      this.isConnected = false;
    } catch (error) {
      console.error('Error disconnecting from database:', error);
    }
  }
}

// Export a singleton instance
export const db = DatabaseManager.getInstance();
export const prisma = db.getClient();

// Helper function to get retry delay with exponential backoff
function getRetryDelay(retryCount: number): number {
  return INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
}

// Helper function to check if an error is retryable
function isRetryableError(error: unknown): boolean {
  if (error instanceof PrismaClientKnownRequestError) {
    return error.code === 'P1001' || // Connection error
           error.code === 'P1002' || // Connection timed out
           error.code === 'P1008' || // Operations timed out
           error.code === 'P1017';   // Server closed the connection
  }
  return false;
}

// Enhanced retry function with better error handling
export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  context?: Record<string, unknown>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      const delayMs = getRetryDelay(MAX_RETRIES - retries);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      if (context) {
        Sentry.setContext('retry_context', {
          ...context,
          retryCount: MAX_RETRIES - retries,
          delayMs
        });
      }
      
      try {
        return await withRetry(operation, retries - 1, context);
      } catch (retryError) {
        // If the retry fails, throw the original error
        throw error;
      }
    }
    
    // Handle non-retryable errors
    if (error instanceof PrismaClientInitializationError) {
      throw new AppError('Database initialization error', 500, 'DB_INIT_ERROR', error);
    }

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new AppError('Unique constraint violation', 409, 'UNIQUE_CONSTRAINT', error.meta);
      }
      if (error.code === 'P2025') {
        throw new AppError('Record not found', 404, 'NOT_FOUND', error.meta);
      }
    }

    if (error instanceof PrismaClientValidationError) {
      throw new AppError('Validation error', 400, 'VALIDATION_ERROR', error);
    }

    // Log unexpected errors to Sentry
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        tags: {
          type: 'database_error',
          ...context
        }
      });
    }

    throw new AppError('An unexpected database error occurred', 500, 'DB_ERROR', error);
  }
}

// Cleanup function for development environment
if (process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', async () => {
    await db.disconnect();
  });
} 