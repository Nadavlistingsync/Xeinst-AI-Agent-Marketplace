import { NextResponse } from 'next/server';

// Webhook examples and documentation
export async function GET(): Promise<NextResponse> {
  const examples = {
    webhookTrigger: {
      description: "How to receive webhook triggers from AI Agent Marketplace",
      url: "https://your-agent.com/webhook",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "AI-Agent-Marketplace/1.0",
        "X-Webhook-Event": "user_input",
        "X-Execution-ID": "exec_123456",
        "X-Agent-ID": "agent_789",
        "X-User-ID": "user_456",
        "Authorization": "Bearer your_webhook_secret"
      },
      payload: {
        event: "user_input",
        timestamp: "2024-01-15T10:30:00.000Z",
        executionId: "exec_123456",
        agent: {
          id: "agent_789",
          name: "Text Summarizer",
          description: "Summarizes long text documents",
          version: "1.0.0"
        },
        user: {
          id: "user_456",
          email: "user@example.com",
          name: "John Doe"
        },
        data: {
          text: "This is a long document that needs to be summarized...",
          maxLength: 100,
          style: "bullet_points"
        },
        files: [
          {
            id: "file_123",
            name: "document.pdf",
            type: "application/pdf",
            size: 1024000,
            content: "base64_encoded_content_here"
          }
        ],
        options: {
          language: "en",
          format: "markdown"
        },
        callbackUrl: "https://your-marketplace.com/api/webhooks/agent-response",
        webhook: {
          id: "exec_123456",
          url: "https://your-agent.com/webhook",
          secret: "***",
          retryCount: 0,
          maxRetries: 3
        }
      }
    },
    
    webhookResponse: {
      description: "How to send responses back to AI Agent Marketplace",
      url: "https://your-marketplace.com/api/webhooks/agent-response",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Your-Agent/1.0"
      },
      payload: {
        executionId: "exec_123456",
        status: "completed", // or "failed"
        output: {
          summary: "This document discusses...",
          keyPoints: [
            "Point 1: Important information",
            "Point 2: Another key insight",
            "Point 3: Final takeaway"
          ],
          wordCount: 45,
          confidence: 0.95
        },
        files: [
          {
            name: "summary.md",
            type: "text/markdown",
            size: 1024,
            content: "base64_encoded_summary_content",
            metadata: {
              format: "markdown",
              language: "en"
            }
          }
        ],
        metadata: {
          processingTime: 2.5,
          model: "gpt-4",
          tokens: 150
        }
      }
    },

    errorResponse: {
      description: "How to send error responses",
      payload: {
        executionId: "exec_123456",
        status: "failed",
        error: "File format not supported",
        metadata: {
          errorCode: "UNSUPPORTED_FORMAT",
          processingTime: 0.1
        }
      }
    },

    supportedTriggers: [
      {
        name: "user_input",
        description: "Triggered when user provides input data",
        example: "User types text, uploads file, or provides parameters"
      },
      {
        name: "file_upload",
        description: "Triggered when user uploads a file",
        example: "User uploads document, image, or data file"
      },
      {
        name: "scheduled",
        description: "Triggered on a schedule",
        example: "Daily reports, weekly summaries, etc."
      },
      {
        name: "api_call",
        description: "Triggered via API call",
        example: "External system calls your agent"
      },
      {
        name: "webhook",
        description: "Triggered by external webhook",
        example: "Another service sends data to your agent"
      }
    ],

    implementationExamples: {
      nodejs: `// Node.js/Express example
const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhook', async (req, res) => {
  try {
    const { event, data, files, executionId, callbackUrl } = req.body;
    
    // Process the data
    const result = await processAgentData(data, files);
    
    // Send response back
    await fetch(callbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        executionId,
        status: 'completed',
        output: result
      })
    });
    
    res.json({ success: true });
  } catch (error) {
    // Send error response
    await fetch(callbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        executionId: req.body.executionId,
        status: 'failed',
        error: error.message
      })
    });
    
    res.status(500).json({ error: error.message });
  }
});`,

      python: `# Python/Flask example
from flask import Flask, request, jsonify
import requests
import asyncio

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook():
    try:
        data = request.json
        event = data.get('event')
        execution_id = data.get('executionId')
        callback_url = data.get('callbackUrl')
        
        # Process the data
        result = process_agent_data(data.get('data'), data.get('files'))
        
        # Send response back
        response_data = {
            'executionId': execution_id,
            'status': 'completed',
            'output': result
        }
        
        requests.post(callback_url, json=response_data)
        
        return jsonify({'success': True})
        
    except Exception as e:
        # Send error response
        error_data = {
            'executionId': request.json.get('executionId'),
            'status': 'failed',
            'error': str(e)
        }
        
        requests.post(request.json.get('callbackUrl'), json=error_data)
        
        return jsonify({'error': str(e)}), 500`,

      n8n: `// n8n workflow example
// 1. Create a webhook trigger node
// 2. Configure it to receive POST requests
// 3. Add processing nodes (AI, data transformation, etc.)
// 4. Add a webhook response node to send results back

// Webhook trigger configuration:
{
  "httpMethod": "POST",
  "path": "ai-agent",
  "responseMode": "responseNode"
}

// Response node configuration:
{
  "url": "{{ $json.callbackUrl }}",
  "method": "POST",
      "body": {
        "executionId": "{{ $json.executionId }}",
        "status": "completed",
        "output": "{{ $json.processedData }}"
      }
}`,

      zapier: `// Zapier webhook example
// 1. Create a webhook trigger in Zapier
// 2. Add processing steps (AI, data transformation, etc.)
// 3. Add a webhook action to send results back

// Webhook trigger settings:
// - URL: https://your-zapier-webhook.com/ai-agent
// - Method: POST
// - Headers: Accept application/json

// Webhook action settings:
// - URL: {{ callbackUrl }}
// - Method: POST
// - Headers: Content-Type: application/json
// - Body: {
//     "executionId": "{{ executionId }}",
//     "status": "completed",
//     "output": "{{ processedData }}"
//   }`
    },

    bestPractices: [
      "Always validate the webhook signature/secret for security",
      "Process webhooks asynchronously to avoid timeouts",
      "Implement proper error handling and logging",
      "Send responses back to the callback URL within 30 seconds",
      "Use idempotent operations to handle duplicate webhooks",
      "Store execution IDs to track processing status",
      "Implement retry logic for failed webhook deliveries",
      "Use HTTPS for all webhook communications",
      "Validate input data before processing",
      "Return meaningful error messages for debugging"
    ],

    security: {
      webhookSecret: "Use a secret key to validate webhook authenticity",
      https: "Always use HTTPS for webhook endpoints",
      validation: "Validate all incoming data before processing",
      rateLimit: "Implement rate limiting to prevent abuse",
      logging: "Log all webhook events for audit purposes"
    }
  };

  return NextResponse.json({
    success: true,
    title: "AI Agent Marketplace Webhook Integration Guide",
    description: "Complete guide for integrating external agents with webhook triggers",
    examples
  });
}
