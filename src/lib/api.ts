import { type ApiError, type ApiResponse, type ApiSuccess, type ValidationError } from '@/types/api';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
import { NextResponse } from 'next/server';

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

export function createErrorResponse(error: unknown, status: number = 500): NextResponse<ApiError> {
  let message = 'An unexpected error occurred';
  let details: ValidationError[] | undefined = undefined;

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  if (error instanceof ZodError) {
    details = error.errors.map(e => ({
      path: Array.isArray(e.path) ? e.path.join('.') : String(e.path),
      message: e.message
    }));
  }

  return NextResponse.json({
    success: false,
    error: message,
    message,
    status,
    details
  }, { status });
}

export function createValidationError(errors: ValidationError[], status: number = 400): NextResponse<ApiError> {
  return NextResponse.json({
    success: false,
    error: 'Validation Error',
    message: 'Invalid input data',
    details: errors,
    status
  }, { status });
}

export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({
    success: true,
    data,
    status
  }, { status });
}

export function createNotFoundError(message: string = 'Resource not found'): NextResponse<ApiError> {
  return NextResponse.json({
    success: false,
    error: 'Not Found',
    message,
    status: 404
  }, { status: 404 });
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

    return { success: true, data } as ApiSuccess<T>;
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      const delayMs = getRetryDelay(MAX_RETRIES - retries);
      console.log(`Retrying request to ${endpoint} after ${delayMs}ms. Attempts remaining: ${retries - 1}`);
      await delay(delayMs);
      return fetchApi(endpoint, options, retries - 1);
    }
    return { success: false, error: (error instanceof Error ? error.message : 'Unknown error'), message: 'Failed to fetch', status: 500 } as ApiError;
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

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      message: error.message,
      status: 500
    };
  }
  return {
    success: false,
    error: String(error),
    message: String(error),
    status: 500
  };
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  status: number;
};

export type ApiError = {
  success: false;
  error: string;
  message: string;
  status: number;
  details?: ValidationError[];
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function createSuccessResponse<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({
    success: true,
    data,
    status
  });
}

export function createValidationError(errors: Array<{ path: string; message: string; code: string }>): NextResponse<ApiError> {
  return NextResponse.json({
    success: false,
    error: 'Validation error',
    message: 'Invalid input data',
    status: 400,
    details: errors
  });
}

export async function handleApiRequest<T>(
  handler: () => Promise<T>,
  options: {
    onError?: (error: unknown) => void;
    successStatus?: number;
  } = {}
): Promise<NextResponse<ApiResponse<T>>> {
  try {
    const data = await handler();
    return createSuccessResponse(data, options.successStatus);
  } catch (error) {
    if (options.onError) {
      options.onError(error);
    }

    if (error instanceof ZodError) {
      return createValidationError(error.errors);
    }

    if (error instanceof Error) {
      return createErrorResponse(error.message, 500);
    }

    return createErrorResponse('An unexpected error occurred', 500);
  }
} 