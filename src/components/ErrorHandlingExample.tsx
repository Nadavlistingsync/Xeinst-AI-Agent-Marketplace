"use client";

import React from 'react';
import { Button } from ".//ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from ".//ui/card";
import { useClickErrorHandling, useApiClickHandling, useFormSubmitHandling } from '@/hooks/useClickErrorHandling';
import { apiClient } from '@/lib/enhanced-api-client';
import { useError } from '@/contexts/ErrorContext';
import { AlertTriangle, Network, Server, Shield, FileText, Clock } from 'lucide-react';

export function ErrorHandlingExample() {
  const { showErrorFromException } = useError();
  const apiHandling = useApiClickHandling();
  const formHandling = useFormSubmitHandling();
  const clickHandling = useClickErrorHandling();

  // Simulate different types of errors
  const simulateNetworkError = async () => {
    throw new Error('Network request failed');
  };

  const simulateServerError = async () => {
    const response = await fetch('/api/nonexistent-endpoint');
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
  };

  const simulateValidationError = async () => {
    const response = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: 'data' })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Validation error: ${JSON.stringify(errorData)}`);
    }
  };

  const simulateAuthError = async () => {
    const response = await fetch('/api/protected-endpoint');
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
  };

  const simulateRateLimitError = async () => {
    const response = await fetch('/api/rate-limited-endpoint');
    if (response.status === 429) {
      throw new Error('Rate limit exceeded');
    }
  };

  const simulateApiCall = async () => {
    const response = await apiClient.get('/agents');
    return response.data;
  };

  const simulateFormSubmit = async () => {
    // Simulate form validation
    await new Promise(resolve => setTimeout(resolve, 1000));
    throw new Error('Form validation failed');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Enhanced Error Handling Demo</h1>
        <p className="text-gray-400">
          Click the buttons below to see detailed error information and handling
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Network Error */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Network className="w-5 h-5 text-blue-500" />
              Network Error
            </CardTitle>
            <CardDescription>
              Simulates a network connection failure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => clickHandling.handleClick(simulateNetworkError, { type: 'network_test' })}
              disabled={clickHandling.isLoading}
              className="w-full"
              variant="outline"
            >
              {clickHandling.isLoading ? 'Testing...' : 'Test Network Error'}
            </Button>
            {clickHandling.error && (
              <p className="text-sm text-red-400 mt-2">
                Error: {clickHandling.error.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Server Error */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Server className="w-5 h-5 text-red-500" />
              Server Error
            </CardTitle>
            <CardDescription>
              Simulates a 500 server error
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => clickHandling.handleClick(simulateServerError, { type: 'server_test' })}
              disabled={clickHandling.isLoading}
              className="w-full"
              variant="outline"
            >
              {clickHandling.isLoading ? 'Testing...' : 'Test Server Error'}
            </Button>
            {clickHandling.error && (
              <p className="text-sm text-red-400 mt-2">
                Error: {clickHandling.error.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Validation Error */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="w-5 h-5 text-yellow-500" />
              Validation Error
            </CardTitle>
            <CardDescription>
              Simulates form validation failure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => formHandling.handleClick(simulateFormSubmit, { type: 'validation_test' })}
              disabled={formHandling.isLoading}
              className="w-full"
              variant="outline"
            >
              {formHandling.isLoading ? 'Submitting...' : 'Test Validation Error'}
            </Button>
            {formHandling.error && (
              <p className="text-sm text-yellow-400 mt-2">
                Error: {formHandling.error.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Authentication Error */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5 text-red-500" />
              Authentication Error
            </CardTitle>
            <CardDescription>
              Simulates authentication failure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => clickHandling.handleClick(simulateAuthError, { type: 'auth_test' })}
              disabled={clickHandling.isLoading}
              className="w-full"
              variant="outline"
            >
              {clickHandling.isLoading ? 'Testing...' : 'Test Auth Error'}
            </Button>
            {clickHandling.error && (
              <p className="text-sm text-red-400 mt-2">
                Error: {clickHandling.error.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Rate Limit Error */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="w-5 h-5 text-blue-500" />
              Rate Limit Error
            </CardTitle>
            <CardDescription>
              Simulates rate limiting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => clickHandling.handleClick(simulateRateLimitError, { type: 'rate_limit_test' })}
              disabled={clickHandling.isLoading}
              className="w-full"
              variant="outline"
            >
              {clickHandling.isLoading ? 'Testing...' : 'Test Rate Limit Error'}
            </Button>
            {clickHandling.error && (
              <p className="text-sm text-blue-400 mt-2">
                Error: {clickHandling.error.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* API Call with Enhanced Client */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="w-5 h-5 text-purple-500" />
              Enhanced API Call
            </CardTitle>
            <CardDescription>
              Uses the enhanced API client with detailed error handling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => apiHandling.handleClick(simulateApiCall, { type: 'api_test' })}
              disabled={apiHandling.isLoading}
              className="w-full"
              variant="outline"
            >
              {apiHandling.isLoading ? 'Loading...' : 'Test Enhanced API'}
            </Button>
            {apiHandling.error && (
              <p className="text-sm text-purple-400 mt-2">
                Error: {apiHandling.error.message}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error Information */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Error Handling Features</CardTitle>
          <CardDescription>
            The enhanced error handling system provides:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-white">User Experience</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Detailed error modals with technical information</li>
                <li>• Toast notifications for quick feedback</li>
                <li>• Suggested actions for error resolution</li>
                <li>• Retry mechanisms with exponential backoff</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-white">Developer Experience</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Comprehensive error categorization</li>
                <li>• Request ID tracking for debugging</li>
                <li>• Context-aware error handling</li>
                <li>• Automatic error reporting integration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
