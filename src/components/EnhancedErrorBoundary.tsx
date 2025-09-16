'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from ".//ui/button";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from ".//ui/dialog";
import { RefreshCw, AlertTriangle, Info, XCircle, CheckCircle } from 'lucide-react';
import { ErrorCategory, ErrorSeverity } from "@/lib/enhanced-error-handling";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReset = () => {
    window.location.reload();
  };

  getErrorCategory(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return ErrorCategory.NETWORK;
    }
    if (message.includes('validation')) {
      return ErrorCategory.VALIDATION;
    }
    if (message.includes('auth') || message.includes('unauthorized')) {
      return ErrorCategory.AUTHENTICATION;
    }
    if (message.includes('forbidden')) {
      return ErrorCategory.AUTHORIZATION;
    }
    if (message.includes('rate limit')) {
      return ErrorCategory.RATE_LIMIT;
    }
    
    return ErrorCategory.UNKNOWN;
  }

  getErrorSeverity(category: ErrorCategory): ErrorSeverity {
    switch (category) {
      case ErrorCategory.NETWORK:
      case ErrorCategory.RATE_LIMIT:
        return ErrorSeverity.LOW;
      case ErrorCategory.VALIDATION:
      case ErrorCategory.AUTHENTICATION:
        return ErrorSeverity.MEDIUM;
      case ErrorCategory.AUTHORIZATION:
        return ErrorSeverity.HIGH;
      default:
        return ErrorSeverity.CRITICAL;
    }
  }

  getErrorIcon(category: ErrorCategory) {
    switch (category) {
      case ErrorCategory.NETWORK:
        return <RefreshCw className="w-5 h-5" />;
      case ErrorCategory.VALIDATION:
        return <Info className="w-5 h-5" />;
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  }

  getErrorColor(category: ErrorCategory) {
    switch (category) {
      case ErrorCategory.NETWORK:
      case ErrorCategory.RATE_LIMIT:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case ErrorCategory.VALIDATION:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-red-600 bg-red-50 border-red-200';
    }
  }

  getSuggestedActions(category: ErrorCategory): string[] {
    switch (category) {
      case ErrorCategory.NETWORK:
        return [
          'Check your internet connection',
          'Try refreshing the page',
          'Contact support if the problem persists'
        ];
      case ErrorCategory.VALIDATION:
        return [
          'Check your input data',
          'Ensure all required fields are filled',
          'Try again with different data'
        ];
      case ErrorCategory.AUTHENTICATION:
        return [
          'Sign in to your account',
          'Check your credentials',
          'Reset your password if needed'
        ];
      case ErrorCategory.AUTHORIZATION:
        return [
          'Contact your administrator',
          'Check your account permissions',
          'Upgrade your plan if needed'
        ];
      case ErrorCategory.RATE_LIMIT:
        return [
          'Wait a few moments before retrying',
          'Reduce the frequency of requests',
          'Contact support if needed'
        ];
      default:
        return [
          'Try refreshing the page',
          'Contact support for assistance',
          'Check our status page'
        ];
    }
  }

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      const category = error ? this.getErrorCategory(error) : ErrorCategory.UNKNOWN;
      const severity = this.getErrorSeverity(category);
      const icon = this.getErrorIcon(category);
      const colorClass = this.getErrorColor(category);
      const suggestedActions = this.getSuggestedActions(category);

      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${colorClass} mb-4`}>
                {icon}
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {severity === ErrorSeverity.CRITICAL ? 'Critical Error' : 'Something went wrong'}
              </h2>
              
              <p className="text-gray-600 mb-6">
                {error?.message || 'An unexpected error occurred. Please try again.'}
              </p>

              <div className="space-y-3">
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                  disabled={this.state.retryCount >= 3}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again {this.state.retryCount > 0 && `(${this.state.retryCount}/3)`}
                </Button>

                <Button 
                  onClick={this.handleReset}
                  variant="outline"
                  className="w-full"
                >
                  Refresh Page
                </Button>

                {this.props.showDetails && this.state.error && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="w-full">
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Error Details</DialogTitle>
                        <DialogDescription>
                          Technical information about the error
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Error Message</h4>
                          <p className="text-sm text-gray-600">{this.state.error.message}</p>
                        </div>
                        {this.state.errorInfo && (
                          <div>
                            <h4 className="font-semibold mb-2">Component Stack</h4>
                            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {suggestedActions.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Suggested Actions:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {suggestedActions.map((action, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 