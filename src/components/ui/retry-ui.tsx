import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

interface RetryUIProps {
  error: Error | null;
  isRetrying: boolean;
  retryCount: number;
  maxRetries?: number;
  onRetry: () => void;
  onDismiss?: () => void;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

const defaultConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

export function RetryUI({
  error,
  isRetrying,
  retryCount,
  maxRetries = 3,
  onRetry,
  onDismiss,
  variant = 'default',
  className,
}: RetryUIProps) {
  const [retryDelay, setRetryDelay] = useState(0);
  const [showRetryTimer, setShowRetryTimer] = useState(false);

  // Calculate retry delay with exponential backoff
  useEffect(() => {
    if (isRetrying && retryCount > 0) {
      const delay = Math.min(
        defaultConfig.baseDelay * Math.pow(defaultConfig.backoffMultiplier, retryCount - 1),
        defaultConfig.maxDelay
      );
      setRetryDelay(delay);
      setShowRetryTimer(true);

      const timer = setTimeout(() => {
        setShowRetryTimer(false);
      }, delay);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isRetrying, retryCount]);

  if (!error) return null;

  const canRetry = retryCount < maxRetries;
  const isLastRetry = retryCount === maxRetries - 1;

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl', className)}>
        <AlertTriangle className="w-5 h-5 text-red-400" />
        <div className="flex-1">
          <p className="text-sm text-white/80">{error.message}</p>
          {canRetry && (
            <p className="text-xs text-white/60 mt-1">
              Retry {retryCount + 1} of {maxRetries}
            </p>
          )}
        </div>
        {canRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            disabled={isRetrying}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {isRetrying ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              'Retry'
            )}
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('p-6 bg-red-500/10 border border-red-500/20 rounded-2xl', className)}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-400" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-white">Operation Failed</h3>
              <p className="text-white/80 mt-1">{error.message}</p>
            </div>

            {/* Retry Progress */}
            {canRetry && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Retry Progress</span>
                  <span className="text-white/80">
                    {retryCount} of {maxRetries} attempts
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(retryCount / maxRetries) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Retry Timer */}
            {showRetryTimer && isRetrying && (
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Clock className="w-4 h-4" />
                <span>Retrying in {Math.ceil(retryDelay / 1000)}s...</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {canRetry && (
                <Button
                  onClick={onRetry}
                  disabled={isRetrying}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {isLastRetry ? 'Final Retry' : 'Try Again'}
                    </>
                  )}
                </Button>
              )}
              {onDismiss && (
                <Button
                  variant="outline"
                  onClick={onDismiss}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Dismiss
                </Button>
              )}
            </div>

            {/* Retry Countdown */}
            {!canRetry && (
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Maximum retries reached. Please try again later.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <Alert className={cn('border-red-500/20 bg-red-500/10', className)}>
      <AlertTriangle className="h-4 w-4 text-red-400" />
      <AlertDescription className="text-white/80">
        <div className="flex items-center justify-between">
          <span>{error.message}</span>
          {canRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              disabled={isRetrying}
              className="ml-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              {isRetrying ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                'Retry'
              )}
            </Button>
          )}
        </div>
        {canRetry && (
          <p className="text-xs text-white/60 mt-1">
            Attempt {retryCount + 1} of {maxRetries}
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}

interface RetryButtonProps {
  onRetry: () => void;
  isRetrying: boolean;
  retryCount: number;
  maxRetries?: number;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
}

export function RetryButton({
  onRetry,
  isRetrying,
  retryCount,
  maxRetries = 3,
  variant = 'default',
  size = 'md',
  children,
  className,
}: RetryButtonProps) {
  const canRetry = retryCount < maxRetries;

  if (!canRetry) return null;

  return (
    <Button
      variant={variant}
      size={size as any}
      onClick={onRetry}
      disabled={isRetrying}
      className={className}
    >
      {isRetrying ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
          Retrying...
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4 mr-2" />
          {children || 'Retry'}
        </>
      )}
    </Button>
  );
}

interface RetryStatusProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  retryCount: number;
  maxRetries: number;
  message?: string;
  className?: string;
}

export function RetryStatus({
  status,
  retryCount,
  maxRetries,
  message,
  className,
}: RetryStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'loading':
        return 'Processing...';
      case 'success':
        return 'Success!';
      case 'error':
        return message || 'Failed';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-400';
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-white/60';
    }
  };

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      {getStatusIcon()}
      <span className={getStatusColor()}>{getStatusText()}</span>
      {status === 'error' && retryCount > 0 && (
        <span className="text-white/60">
          (Attempt {retryCount} of {maxRetries})
        </span>
      )}
    </div>
  );
} 