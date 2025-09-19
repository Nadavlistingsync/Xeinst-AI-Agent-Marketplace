"use client";

import React, { useState } from 'react';
import { Button } from './ui';
import { GlassCard } from './ui/GlassCard';
import { AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const ErrorHandlingExample: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const simulateNetworkError = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Simulate API call that fails
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Network connection failed')), 2000);
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const simulateValidationError = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Simulate validation error
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Invalid input data provided')), 1000);
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Validation failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const simulateSuccess = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Simulate successful API call
      await new Promise((resolve) => {
        setTimeout(resolve, 1500);
      });
      setSuccess(true);
      toast.success('Operation completed successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearState = () => {
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="space-y-6">
      <GlassCard>
        <h2 className="text-2xl font-bold text-white mb-6">Error Handling Examples</h2>
        
        <div className="space-y-4">
          <p className="text-white/70">
            Test different error scenarios to see how the application handles various types of errors.
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={simulateNetworkError}
              disabled={loading}
              variant="glass"
              fullWidth
            >
              {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
              Network Error
            </Button>

            <Button
              onClick={simulateValidationError}
              disabled={loading}
              variant="glass"
              fullWidth
            >
              {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
              Validation Error
            </Button>

            <Button
              onClick={simulateSuccess}
              disabled={loading}
              variant="neon"
              fullWidth
            >
              {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Success Case
            </Button>
          </div>

          {/* Status Display */}
          {(error || success) && (
            <div className="mt-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <span className="text-red-400 font-medium">Error</span>
                  </div>
                  <p className="text-red-300 mt-2">{error}</p>
                  <Button
                    onClick={clearState}
                    size="sm"
                    variant="ghost"
                    className="mt-3"
                  >
                    Dismiss
                  </Button>
                </div>
              )}

              {success && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-green-400 font-medium">Success</span>
                  </div>
                  <p className="text-green-300 mt-2">Operation completed successfully!</p>
                  <Button
                    onClick={clearState}
                    size="sm"
                    variant="ghost"
                    className="mt-3"
                  >
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Error Handling Features */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Error Handling Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-medium text-white mb-2">Automatic Retry</h4>
                <p className="text-white/70 text-sm">
                  Network errors are automatically retried with exponential backoff.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-medium text-white mb-2">User-Friendly Messages</h4>
                <p className="text-white/70 text-sm">
                  Technical errors are translated into user-friendly messages.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-medium text-white mb-2">Error Categorization</h4>
                <p className="text-white/70 text-sm">
                  Errors are categorized by type (network, validation, server, etc.).
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-medium text-white mb-2">Contextual Actions</h4>
                <p className="text-white/70 text-sm">
                  Suggested actions are provided based on the error type.
                </p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
