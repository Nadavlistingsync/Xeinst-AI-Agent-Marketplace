'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RefreshCw, AlertTriangle, Info, XCircle, CheckCircle, Copy, ExternalLink } from 'lucide-react';
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

interface EnhancedErrorDisplayProps {
  error: EnhancedApiError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  className?: string;
}

export function EnhancedErrorDisplay({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  className = ''
}: EnhancedErrorDisplayProps) {
  const getErrorIcon = (category: ErrorCategory) => {
    switch (category) {
      case ErrorCategory.NETWORK:
        return <RefreshCw className="w-4 h-4" />;
      case ErrorCategory.VALIDATION:
        return <Info className="w-4 h-4" />;
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getErrorVariant = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'default';
      case ErrorSeverity.MEDIUM:
        return 'default';
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getErrorColor = (category: ErrorCategory) => {
    switch (category) {
      case ErrorCategory.NETWORK:
      case ErrorCategory.RATE_LIMIT:
        return 'text-blue-600';
      case ErrorCategory.VALIDATION:
        return 'text-yellow-600';
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
        return 'text-red-600';
      default:
        return 'text-red-600';
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const contactSupport = () => {
    // You could implement this to open a support chat or email
    window.open('mailto:support@yourapp.com?subject=Error Report', '_blank');
  };

  return (
    <Alert variant={getErrorVariant(error.severity)} className={className}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${getErrorColor(error.category)}`}>
          {getErrorIcon(error.category)}
        </div>
        
        <div className="flex-1 min-w-0">
          <AlertTitle className="flex items-center justify-between">
            <span>
              {error.severity === ErrorSeverity.CRITICAL ? 'Critical Error' : 'Error'}
            </span>
            {error.requestId && (
              <span className="text-xs text-gray-500 font-normal">
                ID: {error.requestId}
              </span>
            )}
          </AlertTitle>
          
          <AlertDescription className="mt-2">
            <p className="text-sm">{error.userMessage}</p>
            
            {error.suggestedActions && error.suggestedActions.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Suggested Actions:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {error.suggestedActions.map((action, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-4 flex flex-wrap gap-2">
              {error.retryable && onRetry && (
                <Button
                  size="sm"
                  onClick={onRetry}
                  disabled={error.retryAfter ? Date.now() < new Date(error.timestamp).getTime() + (error.retryAfter * 1000) : false}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  {error.retryAfter ? `Retry in ${Math.ceil(error.retryAfter / 1000)}s` : 'Retry'}
                </Button>
              )}
              
              {onDismiss && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDismiss}
                >
                  Dismiss
                </Button>
              )}
              
              {showDetails && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Error Details</DialogTitle>
                      <DialogDescription>
                        Technical information about this error
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Error Information</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Message:</span> {error.message}
                          </div>
                          <div>
                            <span className="font-medium">Status:</span> {error.status}
                          </div>
                          {error.code && (
                            <div>
                              <span className="font-medium">Code:</span> {error.code}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Category:</span> {error.category}
                          </div>
                          <div>
                            <span className="font-medium">Severity:</span> {error.severity}
                          </div>
                          <div>
                            <span className="font-medium">Timestamp:</span> {new Date(error.timestamp).toLocaleString()}
                          </div>
                          {error.requestId && (
                            <div>
                              <span className="font-medium">Request ID:</span> {error.requestId}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {error.details !== undefined && error.details !== null && (
                        <div>
                          <h4 className="font-semibold mb-2">Additional Details</h4>
                          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                            {String(typeof error.details === 'string' ? error.details : JSON.stringify(error.details, null, 2))}
                          </pre>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(JSON.stringify(error, null, 2))}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={contactSupport}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Contact Support
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
} 