"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { DetailedErrorModal } from "../components/DetailedErrorModal";
import { ErrorCategory, ErrorSeverity } from "../lib/enhanced-error-handling";
import { toast } from 'sonner';

interface DetailedError {
  message: string;
  status: number;
  code?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  details?: unknown;
  retryable: boolean;
  retryAfter?: number;
  userMessage: string;
  suggestedActions?: string[];
  timestamp: string;
  requestId?: string;
  stack?: string;
  context?: Record<string, unknown>;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  response?: unknown;
}

interface ErrorContextType {
  showError: (error: DetailedError, options?: ErrorOptions) => void;
  showErrorFromException: (error: unknown, context?: Record<string, unknown>) => void;
  clearError: () => void;
  currentError: DetailedError | null;
  isErrorModalOpen: boolean;
}

interface ErrorOptions {
  showModal?: boolean;
  showToast?: boolean;
  autoRetry?: boolean;
  retryCallback?: () => void;
  reportCallback?: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

interface ErrorProviderProps {
  children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const [currentError, setCurrentError] = useState<DetailedError | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorOptions, setErrorOptions] = useState<ErrorOptions>({});

  const generateRequestId = () => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const categorizeError = (error: unknown): ErrorCategory => {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
        return ErrorCategory.NETWORK;
      }
      if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
        return ErrorCategory.VALIDATION;
      }
      if (message.includes('unauthorized') || message.includes('authentication')) {
        return ErrorCategory.AUTHENTICATION;
      }
      if (message.includes('forbidden') || message.includes('permission')) {
        return ErrorCategory.AUTHORIZATION;
      }
      if (message.includes('rate limit') || message.includes('too many requests')) {
        return ErrorCategory.RATE_LIMIT;
      }
    }
    
    return ErrorCategory.UNKNOWN;
  };

  const getSeverity = (category: ErrorCategory, status: number): ErrorSeverity => {
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
  };

  const getUserMessage = (category: ErrorCategory, status: number): string => {
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
      default:
        if (status >= 500) {
          return 'A server error occurred. Please try again later.';
        }
        return 'An error occurred. Please try again.';
    }
  };

  const getSuggestedActions = (category: ErrorCategory): string[] => {
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
      default:
        return [
          'Try refreshing the page',
          'Check your internet connection',
          'Contact support if the issue persists'
        ];
    }
  };

  const showError = useCallback((error: DetailedError, options: ErrorOptions = {}) => {
    const defaultOptions: ErrorOptions = {
      showModal: true,
      showToast: true,
      autoRetry: false,
      ...options
    };

    setCurrentError(error);
    setErrorOptions(defaultOptions);

    // Show toast notification
    if (defaultOptions.showToast) {
      const toastVariant = error.severity === ErrorSeverity.CRITICAL ? 'error' : 'warning';
      toast[toastVariant](error.userMessage, {
        description: error.retryable ? 'You can retry this action' : undefined,
        action: error.retryable && defaultOptions.retryCallback ? {
          label: 'Retry',
          onClick: defaultOptions.retryCallback
        } : undefined
      });
    }

    // Show modal
    if (defaultOptions.showModal) {
      setIsErrorModalOpen(true);
    }

    // Auto retry if enabled
    if (defaultOptions.autoRetry && error.retryable && defaultOptions.retryCallback) {
      setTimeout(() => {
        defaultOptions.retryCallback!();
      }, error.retryAfter || 1000);
    }
  }, []);

  const showErrorFromException = useCallback((error: unknown, context: Record<string, unknown> = {}) => {
    const category = categorizeError(error);
    const status = (error as any)?.status || 500;
    const severity = getSeverity(category, status);
    const userMessage = getUserMessage(category, status);
    const suggestedActions = getSuggestedActions(category);

    const detailedError: DetailedError = {
      message: error instanceof Error ? error.message : String(error),
      status,
      code: (error as any)?.code,
      category,
      severity,
      details: (error as any)?.details || context,
      retryable: category === ErrorCategory.NETWORK || status >= 500,
      retryAfter: category === ErrorCategory.RATE_LIMIT ? 60 : undefined,
      userMessage,
      suggestedActions,
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      stack: error instanceof Error ? error.stack : undefined,
      context,
      url: (error as any)?.url,
      method: (error as any)?.method,
      headers: (error as any)?.headers,
      response: (error as any)?.response
    };

    showError(detailedError);
  }, [showError]);

  const clearError = useCallback(() => {
    setCurrentError(null);
    setIsErrorModalOpen(false);
    setErrorOptions({});
  }, []);

  const handleRetry = useCallback(() => {
    if (errorOptions.retryCallback) {
      errorOptions.retryCallback();
    }
    clearError();
  }, [errorOptions, clearError]);

  const handleReport = useCallback(() => {
    if (errorOptions.reportCallback) {
      errorOptions.reportCallback();
    } else {
      // Default report action - could open support chat or email
      toast.info('Opening support...');
    }
  }, [errorOptions]);

  const contextValue: ErrorContextType = {
    showError,
    showErrorFromException,
    clearError,
    currentError,
    isErrorModalOpen
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
      {currentError && (
        <DetailedErrorModal
          error={currentError}
          isOpen={isErrorModalOpen}
          onClose={clearError}
          onRetry={currentError.retryable ? handleRetry : undefined}
          onReport={handleReport}
          showReportButton={true}
        />
      )}
    </ErrorContext.Provider>
  );
}
