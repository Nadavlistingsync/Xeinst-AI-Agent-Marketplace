import { useState, useCallback } from 'react';
import { captureException } from '../lib/sentry';
import { useToast } from "../components/ui/use-toast";

interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, any>;
}

export function useApiError() {
  const [error, setError] = useState<ApiError | null>(null);
  const { toast } = useToast();

  const handleError = useCallback((error: unknown, context?: Record<string, any>) => {
    let apiError: ApiError;

    if (error instanceof Error) {
      apiError = {
        message: error.message,
        details: context,
      };
    } else if (typeof error === 'string') {
      apiError = {
        message: error,
        details: context,
      };
    } else if (error && typeof error === 'object') {
      apiError = {
        message: (error as any).message || 'An unknown error occurred',
        code: (error as any).code,
        status: (error as any).status,
        details: {
          ...(error as any),
          ...context,
        },
      };
    } else {
      apiError = {
        message: 'An unknown error occurred',
        details: context,
      };
    }

    // Report to Sentry
    captureException(error instanceof Error ? error : new Error(apiError.message), {
      ...apiError.details,
      ...context,
    });

    // Show toast notification
    toast({
      description: apiError.message,
      variant: "destructive"
    });

    setError(apiError);
    return apiError;
  }, [toast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
} 