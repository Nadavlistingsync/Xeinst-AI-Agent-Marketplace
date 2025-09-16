"use client";

import { useCallback, useState } from 'react';
import { useError } from '../contexts/ErrorContext';
import { ErrorCategory, ErrorSeverity } from "@/lib/enhanced-error-handling";

interface ClickErrorOptions {
  showModal?: boolean;
  showToast?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  context?: Record<string, unknown>;
}

interface ClickErrorState {
  isLoading: boolean;
  error: Error | null;
  retryCount: number;
}

export function useClickErrorHandling(options: ClickErrorOptions = {}) {
  const { showErrorFromException } = useError();
  const [state, setState] = useState<ClickErrorState>({
    isLoading: false,
    error: null,
    retryCount: 0
  });

  const {
    showModal = true,
    showToast = true,
    autoRetry = false,
    maxRetries = 3,
    retryDelay = 1000,
    context = {}
  } = options;

  const handleClick = useCallback(async <T>(
    action: () => Promise<T>,
    actionContext?: Record<string, unknown>
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await action();
      setState(prev => ({ ...prev, isLoading: false, error: null, retryCount: 0 }));
      return result;
    } catch (error) {
      const errorContext = {
        ...context,
        ...actionContext,
        retryCount: state.retryCount,
        maxRetries,
        timestamp: new Date().toISOString()
      };

      setState(prev => ({ ...prev, isLoading: false, error: error as Error }));

      // Show error with retry option if applicable
      showErrorFromException(error, errorContext);

      // Auto retry if enabled and within retry limit
      if (autoRetry && state.retryCount < maxRetries) {
        setTimeout(() => {
          setState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
          handleClick(action, actionContext);
        }, retryDelay * Math.pow(2, state.retryCount)); // Exponential backoff
      }

      return null;
    }
  }, [showErrorFromException, context, autoRetry, maxRetries, retryDelay, state.retryCount]);

  const retry = useCallback(async <T>(
    action: () => Promise<T>,
    actionContext?: Record<string, unknown>
  ): Promise<T | null> => {
    if (state.retryCount >= maxRetries) {
      showErrorFromException(
        new Error('Maximum retry attempts reached'),
        { ...context, ...actionContext, maxRetries }
      );
      return null;
    }

    setState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
    return handleClick(action, actionContext);
  }, [handleClick, state.retryCount, maxRetries, context, showErrorFromException]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      retryCount: 0
    });
  }, []);

  return {
    handleClick,
    retry,
    reset,
    isLoading: state.isLoading,
    error: state.error,
    retryCount: state.retryCount,
    canRetry: state.retryCount < maxRetries
  };
}

// Specialized hooks for common use cases
export function useApiClickHandling(options: ClickErrorOptions = {}) {
  return useClickErrorHandling({
    showModal: true,
    showToast: true,
    autoRetry: false,
    maxRetries: 3,
    retryDelay: 1000,
    context: { type: 'api_call' },
    ...options
  });
}

export function useFormSubmitHandling(options: ClickErrorOptions = {}) {
  return useClickErrorHandling({
    showModal: true,
    showToast: true,
    autoRetry: false,
    maxRetries: 1,
    context: { type: 'form_submit' },
    ...options
  });
}

export function useFileUploadHandling(options: ClickErrorOptions = {}) {
  return useClickErrorHandling({
    showModal: true,
    showToast: true,
    autoRetry: true,
    maxRetries: 2,
    retryDelay: 2000,
    context: { type: 'file_upload' },
    ...options
  });
}

export function useNavigationHandling(options: ClickErrorOptions = {}) {
  return useClickErrorHandling({
    showModal: false,
    showToast: true,
    autoRetry: false,
    maxRetries: 1,
    context: { type: 'navigation' },
    ...options
  });
}
