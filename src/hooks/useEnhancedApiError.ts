import { useState, useCallback, useRef, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { captureException } from '@/lib/sentry';
import { ErrorCategory, ErrorSeverity } from '@/lib/enhanced-error-handling';

interface EnhancedApiError {
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
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export function useEnhancedApiError(config?: Partial<RetryConfig>) {
  const [error, setError] = useState<EnhancedApiError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const retryCountRef = useRef(0);
  const { toast } = useToast();

  const defaultConfig = useMemo((): RetryConfig => ({
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    ...config
  }), [config]);

  const calculateDelay = useCallback((attempt: number): number => {
    const delay = defaultConfig.baseDelay * Math.pow(defaultConfig.backoffMultiplier, attempt);
    return Math.min(delay, defaultConfig.maxDelay);
  }, [defaultConfig]);

  const handleError = useCallback((error: unknown, context?: Record<string, any>) => {
    let apiError: EnhancedApiError;

    if (error instanceof Error) {
      apiError = {
        message: error.message,
        status: (error as any).status || 500,
        code: (error as any).code,
        category: categorizeErrorByMessage(error.message),
        severity: getSeverityByCategory(categorizeErrorByMessage(error.message)),
        details: context,
        retryable: isRetryableError(error),
        userMessage: getUserMessage(error.message),
        suggestedActions: getSuggestedActions(error.message),
        timestamp: new Date().toISOString(),
        requestId: context?.requestId
      };
    } else if (typeof error === 'string') {
      apiError = {
        message: error,
        status: 500,
        category: ErrorCategory.UNKNOWN,
        severity: ErrorSeverity.MEDIUM,
        details: context,
        retryable: false,
        userMessage: 'An unexpected error occurred',
        suggestedActions: ['Try again', 'Contact support if the problem persists'],
        timestamp: new Date().toISOString(),
        requestId: context?.requestId
      };
    } else if (error && typeof error === 'object') {
      const errorObj = error as any;
      apiError = {
        message: errorObj.message || 'An unknown error occurred',
        status: errorObj.status || 500,
        code: errorObj.code,
        category: errorObj.category || ErrorCategory.UNKNOWN,
        severity: errorObj.severity || ErrorSeverity.MEDIUM,
        details: {
          ...errorObj,
          ...context,
        },
        retryable: errorObj.retryable || false,
        retryAfter: errorObj.retryAfter,
        userMessage: errorObj.userMessage || getUserMessage(errorObj.message),
        suggestedActions: errorObj.suggestedActions || getSuggestedActions(errorObj.message),
        timestamp: new Date().toISOString(),
        requestId: errorObj.requestId || context?.requestId
      };
    } else {
      apiError = {
        message: 'An unknown error occurred',
        status: 500,
        category: ErrorCategory.UNKNOWN,
        severity: ErrorSeverity.MEDIUM,
        details: context,
        retryable: false,
        userMessage: 'An unexpected error occurred',
        suggestedActions: ['Try again', 'Contact support if the problem persists'],
        timestamp: new Date().toISOString(),
        requestId: context?.requestId
      };
    }

    // Report to Sentry for medium and higher severity errors
    if (apiError.severity !== ErrorSeverity.LOW) {
      captureException(error instanceof Error ? error : new Error(apiError.message), {
        ...apiError.details,
        ...context,
      });
    }

    // Show toast notification with appropriate styling
    toast({
      description: apiError.userMessage,
      variant: apiError.severity === ErrorSeverity.CRITICAL ? "destructive" : "default"
    });

    setError(apiError);
    return apiError;
  }, [toast]);

  const retryOperation = useCallback(async (
    operation: () => Promise<any>,
    context?: Record<string, any>
  ) => {
    if (retryCountRef.current >= defaultConfig.maxRetries) {
      handleError(new Error('Maximum retry attempts exceeded'), context);
      return null;
    }

    setIsRetrying(true);
    retryCountRef.current++;

    try {
      const delay = calculateDelay(retryCountRef.current - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const result = await operation();
      setIsRetrying(false);
      retryCountRef.current = 0;
      setError(null);
      return result;
    } catch (error) {
      const apiError = handleError(error, context);
      
      if (apiError.retryable && retryCountRef.current < defaultConfig.maxRetries) {
        // Auto-retry for retryable errors
        setTimeout(() => {
          retryOperation(operation, context);
        }, apiError.retryAfter || calculateDelay(retryCountRef.current));
      } else {
        setIsRetrying(false);
      }
      
      return null;
    }
  }, [handleError, defaultConfig.maxRetries, calculateDelay]);

  const clearError = useCallback(() => {
    setError(null);
    retryCountRef.current = 0;
    setIsRetrying(false);
  }, []);

  const manualRetry = useCallback(async (
    operation: () => Promise<any>,
    context?: Record<string, any>
  ) => {
    retryCountRef.current = 0;
    return retryOperation(operation, context);
  }, [retryOperation]);

  return {
    error,
    isRetrying,
    retryCount: retryCountRef.current,
    handleError,
    retryOperation,
    manualRetry,
    clearError,
  };
}

// Helper functions
function categorizeErrorByMessage(message: string): ErrorCategory {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('network') || lowerMessage.includes('connection') || lowerMessage.includes('fetch')) {
    return ErrorCategory.NETWORK;
  }
  if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
    return ErrorCategory.VALIDATION;
  }
  if (lowerMessage.includes('auth') || lowerMessage.includes('login') || lowerMessage.includes('unauthorized')) {
    return ErrorCategory.AUTHENTICATION;
  }
  if (lowerMessage.includes('forbidden') || lowerMessage.includes('permission')) {
    return ErrorCategory.AUTHORIZATION;
  }
  if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
    return ErrorCategory.RATE_LIMIT;
  }
  if (lowerMessage.includes('upload') || lowerMessage.includes('file')) {
    return ErrorCategory.FILE_UPLOAD;
  }
  if (lowerMessage.includes('payment') || lowerMessage.includes('stripe')) {
    return ErrorCategory.PAYMENT;
  }
  if (lowerMessage.includes('agent') || lowerMessage.includes('execution')) {
    return ErrorCategory.AGENT_EXECUTION;
  }
  
  return ErrorCategory.UNKNOWN;
}

function getSeverityByCategory(category: ErrorCategory): ErrorSeverity {
  switch (category) {
    case ErrorCategory.NETWORK:
    case ErrorCategory.RATE_LIMIT:
      return ErrorSeverity.LOW;
    case ErrorCategory.VALIDATION:
    case ErrorCategory.AUTHENTICATION:
      return ErrorSeverity.MEDIUM;
    case ErrorCategory.AUTHORIZATION:
    case ErrorCategory.FILE_UPLOAD:
    case ErrorCategory.AGENT_EXECUTION:
      return ErrorSeverity.HIGH;
    case ErrorCategory.DATABASE:
    case ErrorCategory.PAYMENT:
    case ErrorCategory.UNKNOWN:
      return ErrorSeverity.CRITICAL;
    default:
      return ErrorSeverity.MEDIUM;
  }
}

function isRetryableError(error: Error): boolean {
  const retryablePatterns = [
    'network',
    'connection',
    'timeout',
    'rate limit',
    'temporary',
    'temporarily unavailable'
  ];
  
  return retryablePatterns.some(pattern => 
    error.message.toLowerCase().includes(pattern)
  );
}

function getUserMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
    return 'Connection failed. Please check your internet connection and try again.';
  }
  if (lowerMessage.includes('validation')) {
    return 'Please check your input and try again.';
  }
  if (lowerMessage.includes('auth') || lowerMessage.includes('unauthorized')) {
    return 'Please sign in to continue.';
  }
  if (lowerMessage.includes('forbidden')) {
    return 'You don\'t have permission to perform this action.';
  }
  if (lowerMessage.includes('rate limit')) {
    return 'Too many requests. Please wait a moment before trying again.';
  }
  if (lowerMessage.includes('upload')) {
    return 'File upload failed. Please check your file and try again.';
  }
  if (lowerMessage.includes('payment')) {
    return 'Payment processing failed. Please try again or contact support.';
  }
  
  return 'Something went wrong. Please try again or contact support.';
}

function getSuggestedActions(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
    return ['Check your internet connection', 'Try again in a few moments', 'Contact support if the problem persists'];
  }
  if (lowerMessage.includes('validation')) {
    return ['Review the form fields', 'Ensure all required fields are filled', 'Check for any special characters'];
  }
  if (lowerMessage.includes('auth') || lowerMessage.includes('unauthorized')) {
    return ['Sign in to your account', 'Check your credentials', 'Reset your password if needed'];
  }
  if (lowerMessage.includes('forbidden')) {
    return ['Contact your administrator', 'Check your account permissions', 'Upgrade your plan if needed'];
  }
  if (lowerMessage.includes('rate limit')) {
    return ['Wait a few moments before retrying', 'Reduce the frequency of requests', 'Contact support if needed'];
  }
  if (lowerMessage.includes('upload')) {
    return ['Check file size and format', 'Ensure the file is not corrupted', 'Try uploading a smaller file'];
  }
  if (lowerMessage.includes('payment')) {
    return ['Check your payment method', 'Ensure sufficient funds', 'Contact support for assistance'];
  }
  
  return ['Try the action again', 'Refresh the page', 'Contact support for assistance'];
} 