"use client";

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { GlassCard } from './ui/GlassCard';
import { Send, Webhook, Code, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const WebhookAgentTester: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [payload, setPayload] = useState('{\n  "message": "Hello, AI Agent!",\n  "data": {\n    "user_id": "123",\n    "action": "test"\n  }\n}');
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer your-token"\n}');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sendWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast.error('Please enter a webhook URL');
      return;
    }

    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      // Parse headers
      let parsedHeaders = {};
      try {
        parsedHeaders = JSON.parse(headers);
      } catch (e) {
        throw new Error('Invalid JSON in headers');
      }

      // Parse payload
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(payload);
      } catch (e) {
        throw new Error('Invalid JSON in payload');
      }

      // Simulate webhook call
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'application/json',
          'x-response-time': '125ms',
        },
        data: {
          success: true,
          message: 'Webhook received successfully',
          processed_at: new Date().toISOString(),
          agent_response: {
            result: 'Processing completed',
            confidence: 0.95,
            execution_time: '2.3s'
          }
        }
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setResponse(mockResponse);
      toast.success('Webhook sent successfully!');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send webhook';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearResponse = () => {
    setResponse(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="flex items-center space-x-2 mb-6">
          <Webhook className="h-6 w-6 text-accent" />
          <h2 className="text-2xl font-bold text-white">Webhook Agent Tester</h2>
        </div>
        
        <p className="text-white/70 mb-6">
          Test your AI agents by sending webhook requests and viewing the responses.
        </p>

        <div className="space-y-6">
          {/* Webhook URL */}
          <div>
            <label htmlFor="webhook-url" className="block text-sm font-medium text-white mb-2">
              Webhook URL
            </label>
            <input
              id="webhook-url"
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-agent-endpoint.com/webhook"
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Headers */}
          <div>
            <label htmlFor="headers" className="block text-sm font-medium text-white mb-2">
              Headers (JSON)
            </label>
            <textarea
              id="headers"
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none font-mono text-sm"
            />
          </div>

          {/* Payload */}
          <div>
            <label htmlFor="payload" className="block text-sm font-medium text-white mb-2">
              Payload (JSON)
            </label>
            <textarea
              id="payload"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none font-mono text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <Button
              onClick={sendWebhook}
              disabled={loading}
              variant="neon"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Webhook
                </>
              )}
            </Button>
            
            {(response || error) && (
              <Button
                onClick={clearResponse}
                variant="ghost"
              >
                Clear Response
              </Button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Response */}
      {(response || error) && (
        <GlassCard>
          <div className="flex items-center space-x-2 mb-4">
            <Code className="h-5 w-5 text-white" />
            <h3 className="text-lg font-semibold text-white">Response</h3>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-400 font-medium">Error</span>
              </div>
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {response && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-medium">
                  {response.status} {response.statusText}
                </span>
              </div>

              {/* Response Headers */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Response Headers</h4>
                <pre className="bg-black/30 rounded-lg p-4 text-sm text-white/80 overflow-x-auto">
                  {JSON.stringify(response.headers, null, 2)}
                </pre>
              </div>

              {/* Response Body */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Response Body</h4>
                <pre className="bg-black/30 rounded-lg p-4 text-sm text-white/80 overflow-x-auto">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </GlassCard>
      )}

      {/* Tips */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-4">Testing Tips</h3>
        <div className="space-y-3 text-sm text-white/70">
          <div className="flex items-start space-x-2">
            <span className="text-accent mt-0.5">•</span>
            <span>Use ngrok or similar tools to expose local development servers for testing</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-accent mt-0.5">•</span>
            <span>Include authentication headers if your agent requires them</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-accent mt-0.5">•</span>
            <span>Test with different payload structures to ensure your agent handles various inputs</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-accent mt-0.5">•</span>
            <span>Monitor response times and optimize your agent for better performance</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
