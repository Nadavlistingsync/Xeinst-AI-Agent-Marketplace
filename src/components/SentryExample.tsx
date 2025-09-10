"use client";

import React, { useState } from 'react';
import { SentryUtils, TrackedButton, trackedFetch } from '@/lib/sentry-utils';
import * as Sentry from "@sentry/nextjs";

/**
 * Example component demonstrating Sentry usage
 * This shows how to use error tracking, performance monitoring, and logging
 */
export function SentryExample() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Example: Button click with performance tracking
  const handleTestButtonClick = () => {
    SentryUtils.startSpan(
      {
        op: "ui.click",
        name: "Test Button Click",
        attributes: {
          component: "SentryExample",
          timestamp: new Date().toISOString(),
        },
      },
      (span) => {
        const value = "some config";
        const metric = "some metric";

        // Metrics can be added to the span
        span.setAttribute("config", value);
        span.setAttribute("metric", metric);

        // Log the action
        SentryUtils.logger.info("Test button clicked", {
          config: value,
          metric: metric,
        });

        // Add breadcrumb for debugging
        SentryUtils.addBreadcrumb("Test button clicked", "user-action", "info");

        console.log("Test button clicked with Sentry tracking!");
      },
    );
  };

  // Example: API call with error handling
  const handleApiCall = async () => {
    setLoading(true);
    setError(null);

    try {
      // This will be tracked automatically by trackedFetch
      const data = await trackedFetch('/api/test-endpoint');
      
      SentryUtils.logger.info("API call successful", {
        endpoint: '/api/test-endpoint',
        dataReceived: !!data,
      });
      
      console.log('API call successful:', data);
    } catch (err) {
      const error = err as Error;
      
      // Capture the exception with context
      SentryUtils.captureException(error, {
        endpoint: '/api/test-endpoint',
        action: 'test-api-call',
      });
      
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Example: Manual error throwing for testing
  const handleThrowError = () => {
    try {
      throw new Error("This is a test error for Sentry!");
    } catch (error) {
      SentryUtils.captureException(error as Error, {
        component: "SentryExample",
        action: "manual-error-test",
      });
      
      setError((error as Error).message);
    }
  };

  // Example: User context setting
  const handleSetUserContext = () => {
    SentryUtils.setUser({
      id: "test-user-123",
      email: "test@example.com",
      username: "testuser",
    });
    
    SentryUtils.logger.info("User context set", {
      userId: "test-user-123",
      email: "test@example.com",
    });
    
    console.log("User context set in Sentry");
  };

  // Example: Tag setting
  const handleSetTag = () => {
    SentryUtils.setTag("feature", "sentry-example");
    SentryUtils.setTag("environment", process.env.NODE_ENV || "development");
    
    SentryUtils.logger.info("Tags set", {
      feature: "sentry-example",
      environment: process.env.NODE_ENV || "development",
    });
    
    console.log("Tags set in Sentry");
  };

  // Example: Structured logging with template literals
  const handleStructuredLogging = () => {
    const userId = "user-123";
    const action = "button-click";
    
    // Using the fmt function for structured logging
    SentryUtils.logger.info(
      SentryUtils.logger.fmt`User ${userId} performed action: ${action}`,
      {
        userId,
        action,
        timestamp: new Date().toISOString(),
      }
    );
    
    console.log(`Structured log sent for user ${userId} action: ${action}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Sentry Integration Examples
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Performance Tracking */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700">
              Performance Tracking
            </h3>
            
            <TrackedButton
              onClick={handleTestButtonClick}
              trackingName="Test Button Click"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Track Button Click
            </TrackedButton>
            
            <button
              onClick={handleApiCall}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              {loading ? "Loading..." : "Test API Call"}
            </button>
          </div>

          {/* Error Tracking */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700">
              Error Tracking
            </h3>
            
            <button
              onClick={handleThrowError}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Throw Test Error
            </button>
            
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                Error: {error}
              </div>
            )}
          </div>

          {/* Context & Logging */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700">
              Context & Logging
            </h3>
            
            <button
              onClick={handleSetUserContext}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              Set User Context
            </button>
            
            <button
              onClick={handleSetTag}
              className="w-full px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
            >
              Set Tags
            </button>
          </div>

          {/* Structured Logging */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700">
              Structured Logging
            </h3>
            
            <button
              onClick={handleStructuredLogging}
              className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
            >
              Send Structured Log
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">Instructions:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Click buttons to test different Sentry features</li>
            <li>• Check your browser console for logged messages</li>
            <li>• Check your Sentry dashboard for captured events</li>
            <li>• Errors will be captured and sent to Sentry automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
