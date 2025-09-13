"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { GlowButton } from "../../components/ui/GlowButton";
import { GlassCard } from "../../components/ui/GlassCard";

export default function SentryExamplePage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Test JavaScript Error
  const testJavaScriptError = () => {
    try {
      addResult("Testing JavaScript error...");
      // @ts-ignore
      myUndefinedFunction();
    } catch (error) {
      addResult("✅ JavaScript error sent to Sentry");
      Sentry.captureException(error);
    }
  };

  // Test Custom Error
  const testCustomError = () => {
    try {
      addResult("Testing custom error...");
      throw new Error("Custom test error from Sentry example page");
    } catch (error) {
      addResult("✅ Custom error sent to Sentry");
      Sentry.captureException(error, {
        tags: { testType: 'custom', page: 'sentry-example' },
        extra: { userAction: 'manual-test' }
      });
    }
  };

  // Test Message
  const testMessage = () => {
    addResult("Testing Sentry message...");
    Sentry.captureMessage("Test message from Sentry example page", "info");
    addResult("✅ Message sent to Sentry");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Sentry Integration Testing</h1>
          <p className="text-xl text-gray-300">Test your Sentry error tracking setup</p>
        </div>

        <GlassCard className="p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Error Testing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlowButton onClick={testJavaScriptError}>
              Test JavaScript Error
            </GlowButton>
            <GlowButton onClick={testCustomError}>
              Test Custom Error
            </GlowButton>
            <GlowButton onClick={testMessage} variant="glass">
              Test Message
            </GlowButton>
          </div>
        </GlassCard>

        <GlassCard className="p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Test Results</h2>
          <div className="bg-black/20 rounded-lg p-4 max-h-64 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-400 italic">No tests run yet. Click the buttons above to test Sentry.</p>
            ) : (
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <p key={index} className="text-sm text-gray-300 font-mono">{result}</p>
                ))}
              </div>
            )}
          </div>
        </GlassCard>

        <div className="text-center mt-8">
          <GlowButton 
            onClick={() => window.open("https://xeinst-l0.sentry.io/issues/", "_blank")}
            className="flex items-center space-x-2 mx-auto"
          >
            <span>Open Sentry Dashboard</span>
          </GlowButton>
        </div>
      </div>
    </div>
  );
}