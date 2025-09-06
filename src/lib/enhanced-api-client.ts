"use client";

import { ErrorCategory, ErrorSeverity } from './enhanced-error-handling';

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  context?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  requestId: string;
  timestamp: string;
}

export interface ApiError extends Error {
  status: number;
  statusText: string;
  code?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  details?: unknown;
  retryable: boolean;
  retryAfter?: number;
  userMessage: string;
  suggestedActions?: string[];
  requestId: string;
  timestamp: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  response?: unknown;
  context?: Record<string, unknown>;
}

class EnhancedApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultRetries: number;
  private defaultRetryDelay: number;

  constructor(
    baseURL: string = '/api',
    defaultTimeout: number = 30000,
    defaultRetries: number = 3,
    defaultRetryDelay: number = 1000
  ) {
    this.baseURL = baseURL;
    this.defaultTimeout = defaultTimeout;
    this.defaultRetries = defaultRetries;
    this.defaultRetryDelay = defaultRetryDelay;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private categorizeError(status: number, message: string): ErrorCategory {
    if (status >= 500) return ErrorCategory.SERVER;
    if (status === 429) return ErrorCategory.RATE_LIMIT;
    if (status === 401) return ErrorCategory.AUTHENTICATION;
    if (status === 403) return ErrorCategory.AUTHORIZATION;
    if (status >= 400) return ErrorCategory.VALIDATION;
    if (message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch')) {
      return ErrorCategory.NETWORK;
    }
    return ErrorCategory.UNKNOWN;
  }

  private getSeverity(category: ErrorCategory, status: number): ErrorSeverity {
    if (status >= 500) return ErrorSeverity.CRITICAL;
    if (status >= 400) {
      switch (category) {
        case ErrorCategory.AUTHENTICATION:
        case ErrorCategory.AUTHORIZATION:
          return ErrorSeverity.HIGH;
        case ErrorCategory.VALIDATION:
          return ErrorSeverity.MEDIUM;
        case ErrorCategory.RATE_LIMIT:
          return ErrorSeverity.MEDIUM;
        default:
          return ErrorSeverity.HIGH;
      }
    }
    return ErrorSeverity.LOW;
  }

  private getUserMessage(category: ErrorCategory, status: number): string {
    switch (category) {
      case ErrorCategory.NETWORK:
        return 'Network connection failed. Please check your internet connection and try again.';
      case ErrorCategory.VALIDATION:
        return 'Please check your input and try again.';
      case ErrorCategory.AUTHENTICATION:
        return 'You need to sign in to access this feature.';
      case ErrorCategory.AUTHORIZATION:
        return 'You don\'t have permission to perform this action.';
      case ErrorCategory.RATE_LIMIT:
        return 'Too many requests. Please wait a moment and try again.';
      case ErrorCategory.SERVER:
        return 'A server error occurred. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  private getSuggestedActions(category: ErrorCategory): string[] {
    switch (category) {
      case ErrorCategory.NETWORK:
        return [
          'Check your internet connection',
          'Try refreshing the page',
          'Check if the service is available'
        ];
      case ErrorCategory.VALIDATION:
        return [
          'Review the form fields',
          'Check for required fields',
          'Verify the data format'
        ];
      case ErrorCategory.AUTHENTICATION:
        return [
          'Sign in to your account',
          'Check your credentials',
          'Contact support if the issue persists'
        ];
      case ErrorCategory.AUTHORIZATION:
        return [
          'Contact your administrator',
          'Check your account permissions',
          'Verify your subscription status'
        ];
      case ErrorCategory.RATE_LIMIT:
        return [
          'Wait a few minutes before trying again',
          'Reduce the frequency of requests',
          'Contact support if you need higher limits'
        ];
      case ErrorCategory.SERVER:
        return [
          'Try again in a few minutes',
          'Check our status page',
          'Contact support if the issue persists'
        ];
      default:
        return [
          'Try refreshing the page',
          'Check your internet connection',
          'Contact support if the issue persists'
        ];
    }
  }

  private createApiError(
    message: string,
    status: number,
    statusText: string,
    url: string,
    method: string,
    headers: Record<string, string>,
    response?: unknown,
    context?: Record<string, unknown>
  ): ApiError {
    const requestId = this.generateRequestId();
    const category = this.categorizeError(status, message);
    const severity = this.getSeverity(category, status);
    const userMessage = this.getUserMessage(category, status);
    const suggestedActions = this.getSuggestedActions(category);

    const error = new Error(message) as ApiError;
    error.status = status;
    error.statusText = statusText;
    error.category = category;
    error.severity = severity;
    error.retryable = category === ErrorCategory.NETWORK || status >= 500;
    error.retryAfter = category === ErrorCategory.RATE_LIMIT ? 60 : undefined;
    error.userMessage = userMessage;
    error.suggestedActions = suggestedActions;
    error.requestId = requestId;
    error.timestamp = new Date().toISOString();
    error.url = url;
    error.method = method;
    error.headers = headers;
    error.response = response;
    error.context = context;

    return error;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async request<T = unknown>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      context = {}
    } = config;

    const url = `${this.baseURL}${endpoint}`;
    const requestId = this.generateRequestId();
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      ...headers
    };

    let lastError: ApiError | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const requestConfig: RequestInit = {
          method,
          headers: requestHeaders,
          signal: controller.signal,
          ...(body && { body: JSON.stringify(body) })
        };

        const response = await fetch(url, requestConfig);
        clearTimeout(timeoutId);

        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        if (!response.ok) {
          let errorData: unknown;
          try {
            errorData = await response.json();
          } catch {
            errorData = await response.text();
          }

          const error = this.createApiError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            response.statusText,
            url,
            method,
            requestHeaders,
            errorData,
            { ...context, attempt, retries }
          );

          // Don't retry on client errors (4xx) except for rate limiting
          if (response.status < 500 && response.status !== 429) {
            throw error;
          }

          lastError = error;
          if (attempt < retries) {
            const delay = retryDelay * Math.pow(2, attempt);
            await this.sleep(delay);
            continue;
          }

          throw error;
        }

        let data: T;
        try {
          data = await response.json();
        } catch {
          data = (await response.text()) as T;
        }

        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          requestId,
          timestamp: new Date().toISOString()
        };

      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          const timeoutError = this.createApiError(
            'Request timeout',
            408,
            'Request Timeout',
            url,
            method,
            requestHeaders,
            undefined,
            { ...context, attempt, retries, timeout }
          );
          lastError = timeoutError;
        } else if (error instanceof Error && error.message.includes('fetch')) {
          const networkError = this.createApiError(
            'Network error',
            0,
            'Network Error',
            url,
            method,
            requestHeaders,
            undefined,
            { ...context, attempt, retries, originalError: error.message }
          );
          lastError = networkError;
        } else if (error instanceof Error && 'status' in error) {
          lastError = error as ApiError;
        } else {
          const unknownError = this.createApiError(
            error instanceof Error ? error.message : 'Unknown error',
            500,
            'Internal Server Error',
            url,
            method,
            requestHeaders,
            undefined,
            { ...context, attempt, retries, originalError: error }
          );
          lastError = unknownError;
        }

        if (attempt < retries && lastError.retryable) {
          const delay = retryDelay * Math.pow(2, attempt);
          await this.sleep(delay);
          continue;
        }

        throw lastError;
      }
    }

    throw lastError || this.createApiError(
      'Maximum retries exceeded',
      500,
      'Internal Server Error',
      url,
      method,
      requestHeaders,
      undefined,
      { ...context, retries }
    );
  }

  // Convenience methods
  async get<T = unknown>(endpoint: string, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = unknown>(endpoint: string, body?: unknown, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  async put<T = unknown>(endpoint: string, body?: unknown, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  async delete<T = unknown>(endpoint: string, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  async patch<T = unknown>(endpoint: string, body?: unknown, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }
}

// Create a default instance
export const apiClient = new EnhancedApiClient();

// Export the class for custom instances
export { EnhancedApiClient };
