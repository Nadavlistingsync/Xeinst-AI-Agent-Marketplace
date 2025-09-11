"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    // Enhanced error logging
    console.error('🚨 Global Error Caught:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server'
    });
    
    // Send to Sentry with additional context
    Sentry.captureException(error, {
      tags: {
        errorBoundary: 'global',
        digest: error.digest || 'unknown'
      },
      extra: {
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : 'server'
      }
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0C10] text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
        <p className="text-gray-300 mb-8">
          We're working to fix the issue. Please try refreshing the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-[#00AFFF] text-white rounded-lg hover:bg-[#0090cc] transition-all duration-300"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
