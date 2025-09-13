'use client';

import React from 'react';
import { captureException } from '../lib/sentry';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    captureException(error, {
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 p-8">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Something went wrong
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                We apologize for the inconvenience. Please try refreshing the page or contact support if the problem persists.
              </p>
              <div className="mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Refresh Page
                </button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 p-4 bg-red-50 rounded-md">
                  <p className="text-sm text-red-800 font-mono">
                    {this.state.error.message}
                  </p>
                  <pre className="mt-2 text-xs text-red-600 overflow-auto">
                    {this.state.error.stack}
                  </pre>
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