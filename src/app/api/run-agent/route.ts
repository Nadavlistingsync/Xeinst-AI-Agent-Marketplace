import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Input validation schema
const runAgentSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
  inputs: z.record(z.any()).optional().default({}),
  webhookUrl: z.string().url().optional(), // Add optional webhook URL for testing
});

// Mock database for testing (remove when Supabase is connected)
const mockAgents = [
  {
    id: 'agent-1',
    name: 'Lead Scraper',
    webhook_url: 'https://webhook.site/your-unique-id-1',
    status: 'active',
  },
  {
    id: 'agent-2', 
    name: 'Sentiment Analyzer',
    webhook_url: 'https://webhook.site/your-unique-id-2',
    status: 'active',
  },
  {
    id: 'agent-3',
    name: 'Data Processor',
    webhook_url: 'https://api.example.com/process-data',
    status: 'active',
  },
];

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Configure this properly for production
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Get agent configuration from database
 * This function can be easily switched between mock and real database
 */
async function getAgentConfig(agentId: string, webhookUrl?: string) {
  try {
    // If webhookUrl is provided for testing, use it directly
    if (webhookUrl) {
      return {
        id: agentId,
        name: 'Test Agent',
        webhook_url: webhookUrl,
        status: 'active',
      };
    }

    // Try to get from real database first
    const agent = await prisma.deployment.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        name: true,
        status: true,
        source: true, // This will contain the webhook URL or config
      },
    });

    if (agent) {
      // Parse the source field to extract webhook URL
      // Assuming source contains JSON with webhook_url
      let webhookUrl = '';
      try {
        const config = JSON.parse(agent.source || '{}');
        webhookUrl = config.webhook_url || '';
      } catch {
        // If source is not JSON, assume it's a direct webhook URL
        webhookUrl = agent.source || '';
      }

      return {
        id: agent.id,
        name: agent.name,
        webhook_url: webhookUrl,
        status: agent.status,
      };
    }

    // Fallback to mock database if not found in real DB
    const mockAgent = mockAgents.find(agent => agent.id === agentId);
    if (mockAgent) {
      console.log(`Using mock agent: ${agentId}`);
      return mockAgent;
    }

    return null;
  } catch (error) {
    console.error('Database error:', error);
    // Fallback to mock database on error
    const mockAgent = mockAgents.find(agent => agent.id === agentId);
    return mockAgent || null;
  }
}

/**
 * Call external webhook with the given inputs
 */
async function callWebhook(webhookUrl: string, inputs: any, agentId?: string, isCustom?: boolean) {
  try {
    let requestBody;
    if (isCustom) {
      // For custom agents, extract the input string from the inputs object
      // The webhook expects the input to be sent directly as a string
      const inputString = inputs.input || inputs.query || inputs.text || JSON.stringify(inputs);
      requestBody = { input: inputString };
    } else {
      requestBody = {
        inputs,
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
    }
    const requestHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'AI-Agent-Platform/1.0',
    };
    console.log('[Webhook Debug] Sending request:', {
      url: webhookUrl,
      method: 'POST',
      headers: requestHeaders,
      body: requestBody,
    });
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
    });
    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
    console.log('[Webhook Debug] Response:', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: data,
    });
    if (!response.ok) {
      throw new Error(`Webhook responded with status: ${response.status}`);
    }
    return {
      success: true,
      data,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error) {
    console.error('Webhook call failed:', error);
    throw new Error(`Webhook call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Log agent run for analytics and monitoring
 * TODO: Implement proper logging when user auth is added
 */
async function logAgentRun(agentId: string, inputs: any, result: any, error?: string) {
  try {
    // Log to database when user auth is implemented
    await prisma.agentLog.create({
      data: {
        deploymentId: agentId,
        level: error ? 'error' : 'info',
        message: error || 'Agent run successful',
        metadata: {
          inputs,
          result: error ? null : result,
          error: error || null,
          timestamp: new Date().toISOString(),
        },
      },
    });

    // TODO: Add user tracking when auth is implemented
    // await prisma.agentRun.create({
    //   data: {
    //     agentId,
    //     userId: session.user.id, // Add when auth is implemented
    //     inputs,
    //     result: error ? null : result,
    //     error: error || null,
    //     executionTime: executionTime,
    //     status: error ? 'failed' : 'success',
    //   },
    // });
  } catch (logError) {
    console.error('Failed to log agent run:', logError);
    // Don't fail the request if logging fails
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (err) {
      console.error('Invalid JSON in request body:', err);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body.',
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }
    let validatedData;
    try {
      validatedData = runAgentSchema.parse(body);
    } catch (err) {
      console.error('Input validation error:', err);
      return NextResponse.json(
        {
          success: false,
          error: 'Input validation error. Please check your agentId, inputs, and webhookUrl.',
          details: err instanceof Error ? err.message : err,
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }
    const { agentId, inputs, webhookUrl } = validatedData;

    console.log(`Running agent ${agentId} with inputs:`, inputs);

    // If custom-agent and webhookUrl is missing, return a clear error
    if (agentId === 'custom-agent' && !webhookUrl) {
      console.error('Custom agent test missing webhookUrl:', { agentId, inputs, webhookUrl });
      return NextResponse.json(
        {
          success: false,
          error: 'Custom agent test requires webhookUrl in the request payload.',
          agentId,
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Get agent configuration
    const agentConfig = await getAgentConfig(agentId, webhookUrl);
    if (!agentConfig && !webhookUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Agent not found',
          agentId 
        },
        { 
          status: 404,
          headers: corsHeaders,
        }
      );
    }
    const effectiveAgentConfig = agentConfig || (webhookUrl ? {
      id: agentId,
      name: 'Custom Agent',
      webhook_url: webhookUrl,
      status: 'active',
    } : null);
    if (!effectiveAgentConfig) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Agent not found',
          agentId 
        },
        { 
          status: 404,
          headers: corsHeaders,
        }
      );
    }
    // Check if agent is active
    if (effectiveAgentConfig.status !== 'active') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Agent is not active',
          agentId,
          status: effectiveAgentConfig.status 
        },
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }
    // Validate webhook URL
    if (!effectiveAgentConfig.webhook_url) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Agent webhook URL is missing or invalid',
          agentId 
        },
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Call the webhook
    let webhookResult;
    try {
      webhookResult = await callWebhook(
        effectiveAgentConfig.webhook_url,
        inputs,
        agentId,
        agentId === 'custom-agent' || !!webhookUrl // isCustom
      );
    } catch (err) {
      console.error('Webhook call failed:', err);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to call agent webhook. The endpoint may be down, unreachable, or returned an error.',
          details: err instanceof Error ? err.message : err,
        },
        {
          status: 502,
          headers: corsHeaders,
        }
      );
    }
    const executionTime = Date.now() - startTime;

    // Log agent run for analytics and monitoring
    try {
      await logAgentRun(agentId, inputs, webhookResult, undefined);
    } catch (logErr) {
      console.error('Failed to log agent run:', logErr);
    }

    return NextResponse.json(
      {
        success: true,
        agentId,
        agentName: effectiveAgentConfig.name,
        executionTime,
        result: webhookResult.data,
        webhookStatus: webhookResult.status,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('Error running agent:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unexpected server error. Please try again or contact support.',
        details: error instanceof Error ? error.message : error,
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
} 