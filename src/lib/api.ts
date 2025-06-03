import { type ApiError, type ApiResponse, type ApiSuccess, type ValidationError } from '@/types/api';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 10000;

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRetryDelay(retryCount: number): number {
  return Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retryCount), MAX_RETRY_DELAY);
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    // Network errors
    if (error.name === 'NetworkError' || error.name === 'AbortError') return true;
    
    // Prisma errors that might be transient
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return error.code === 'P1001' || // Connection error
             error.code === 'P1002' || // Connection timed out
             error.code === 'P1008' || // Operations timed out
             error.code === 'P1017';   // Server closed the connection
    }
  }
  return false;
}

export function createErrorResponse(error: unknown, defaultMessage: string): ApiError {
  // Log the error
  console.error('API Error:', error);
  
  // Report to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error);
  }

  if (error instanceof z.ZodError) {
    return {
      error: 'Validation error',
      details: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      })),
      status: 400
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      status: 500
    };
  }

  return {
    error: defaultMessage,
    status: 500
  };
}

export function createSuccessResponse<T>(data: T): ApiSuccess<T> {
  return {
    data
  };
}

export function createValidationError(errors: ValidationError[]): ApiError {
  return {
    error: 'Validation error',
    details: errors,
    status: 400
  };
}

export function createApiError(message: string, status: number = 500): ApiError {
  return {
    error: message,
    status
  };
}

export function createApiSuccess<T>(data: T): ApiSuccess<T> {
  return { data };
}

export function isApiError(response: ApiResponse<unknown>): response is ApiError {
  return 'error' in response;
}

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return 'data' in response;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return createSuccessResponse(data);
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      const delayMs = getRetryDelay(MAX_RETRIES - retries);
      console.log(`Retrying request to ${endpoint} after ${delayMs}ms. Attempts remaining: ${retries - 1}`);
      await delay(delayMs);
      return fetchApi(endpoint, options, retries - 1);
    }
    return createErrorResponse(error, 'An unexpected error occurred');
  }
}

export async function postApi<T>(
  endpoint: string,
  body: unknown,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  }, retries);
}

export async function putApi<T>(
  endpoint: string,
  body: unknown,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
  }, retries);
}

export async function deleteApi<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'DELETE',
  }, retries);
} 