'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedErrorDisplay } from '@/components/EnhancedErrorDisplay';
import { useEnhancedApiError } from '@/hooks/useEnhancedApiError';
import { ErrorCategory, ErrorSeverity } from '@/lib/enhanced-error-handling';

export default function TestErrorHandlingPage() {
  const { error, isRetrying, handleError, retryOperation, clearError } = useEnhancedApiError();
  const [testError, setTestError] = useState<any>(null);

  const simulateNetworkError = () => {
    const networkError = {
      message: 'Network connection failed',
      status: 0,
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.LOW,
      retryable: true,
      userMessage: 'Connection failed. Please check your internet connection and try again.',
      suggestedActions: ['Check your internet connection', 'Try again in a few moments', 'Contact support if the problem persists'],
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setTestError(networkError);
  };

  const simulateValidationError = () => {
    const validationError = {
      message: 'Invalid input data',
      status: 400,
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
      userMessage: 'Please check your input and try again.',
      suggestedActions: ['Review the form fields', 'Ensure all required fields are filled', 'Check for any special characters'],
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setTestError(validationError);
  };

  const simulateAuthError = () => {
    const authError = {
      message: 'Unauthorized access',
      status: 401,
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
      userMessage: 'Please sign in to continue.',
      suggestedActions: ['Sign in to your account', 'Check your credentials', 'Reset your password if needed'],
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setTestError(authError);
  };

  const simulateCriticalError = () => {
    const criticalError = {
      message: 'Database connection failed',
      status: 500,
      category: ErrorCategory.DATABASE,
      severity: ErrorSeverity.CRITICAL,
      retryable: true,
      retryAfter: 5000,
      userMessage: 'We\'re experiencing technical difficulties. Please try again later.',
      suggestedActions: ['Try again in a few moments', 'Contact support if the problem persists', 'Check our status page'],
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setTestError(criticalError);
  };

  const simulateRateLimitError = () => {
    const rateLimitError = {
      message: 'Too many requests',
      status: 429,
      category: ErrorCategory.RATE_LIMIT,
      severity: ErrorSeverity.LOW,
      retryable: true,
      retryAfter: 3000,
      userMessage: 'Too many requests. Please wait a moment before trying again.',
      suggestedActions: ['Wait a few moments before retrying', 'Reduce the frequency of requests', 'Contact support if needed'],
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setTestError(rateLimitError);
  };

  const simulateFileUploadError = () => {
    const uploadError = {
      message: 'File upload failed',
      status: 413,
      category: ErrorCategory.FILE_UPLOAD,
      severity: ErrorSeverity.HIGH,
      retryable: false,
      userMessage: 'File upload failed. Please check your file and try again.',
      suggestedActions: ['Check file size and format', 'Ensure the file is not corrupted', 'Try uploading a smaller file'],
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setTestError(uploadError);
  };

  const handleRetry = () => {
    // Simulate retry operation
    setTimeout(() => {
      setTestError(null);
    }, 2000);
  };

  const handleDismiss = () => {
    setTestError(null);
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Enhanced Error Handling Test</h1>
            <p className="text-muted-foreground">
              Test different types of errors and see how the enhanced error handling system responds.
            </p>
          </div>

          {testError && (
            <div className="mb-8">
              <EnhancedErrorDisplay
                error={testError}
                onRetry={handleRetry}
                onDismiss={handleDismiss}
                showDetails={true}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  Network Error
                </CardTitle>
                <CardDescription>
                  Simulates a network connection failure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={simulateNetworkError} className="w-full">
                  Test Network Error
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  Validation Error
                </CardTitle>
                <CardDescription>
                  Simulates invalid input data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={simulateValidationError} className="w-full">
                  Test Validation Error
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Authentication Error
                </CardTitle>
                <CardDescription>
                  Simulates unauthorized access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={simulateAuthError} className="w-full">
                  Test Auth Error
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  Critical Error
                </CardTitle>
                <CardDescription>
                  Simulates a critical system failure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={simulateCriticalError} className="w-full">
                  Test Critical Error
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  Rate Limit Error
                </CardTitle>
                <CardDescription>
                  Simulates too many requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={simulateRateLimitError} className="w-full">
                  Test Rate Limit Error
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  File Upload Error
                </CardTitle>
                <CardDescription>
                  Simulates file upload failure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={simulateFileUploadError} className="w-full">
                  Test Upload Error
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Features Demonstrated:</h3>
            <ul className="space-y-2 text-sm">
              <li>• <strong>Error Categorization:</strong> Different error types with appropriate icons and colors</li>
              <li>• <strong>User-Friendly Messages:</strong> Clear, actionable error messages</li>
              <li>• <strong>Suggested Actions:</strong> Helpful next steps for users</li>
              <li>• <strong>Retry Functionality:</strong> Automatic and manual retry options</li>
              <li>• <strong>Error Details:</strong> Technical information for debugging</li>
              <li>• <strong>Severity Levels:</strong> Different visual treatments based on error severity</li>
              <li>• <strong>Request Tracking:</strong> Unique request IDs for support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 