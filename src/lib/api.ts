import { type ApiError, type ApiResponse, type ApiSuccess, type ValidationError } from '@/types/api';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function createErrorResponse(error: unknown, defaultMessage: string): ApiError {
  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      status: 500
    };
  }
  
  return {
    success: false,
    error: defaultMessage,
    status: 500
  };
}

export function createSuccessResponse<T>(data: T): ApiSuccess<T> {
  return {
    success: true,
    data
  };
}

export function createValidationError(errors: ValidationError[]): ApiError {
  return {
    success: false,
    error: 'Validation error',
    details: errors,
    status: 400
  };
}

export function isApiError(response: ApiResponse<unknown>): response is ApiError {
  return !response.success;
}

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.success;
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
    if (retries > 0) {
      await delay(RETRY_DELAY);
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