import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Input validation schema
const runAgentSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
  inputs: z.record(z.any()).optional().default({}),
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
async function getAgentConfig(agentId: string) {
  try {
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
async function callWebhook(webhookUrl: string, inputs: any) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AI-Agent-Platform/1.0',
      },
      body: JSON.stringify({
        inputs,
        timestamp: new Date().toISOString(),
        request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with status: ${response.status}`);
    }

    const data = await response.json();
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
    const body = await request.json();
    const validatedData = runAgentSchema.parse(body);
    const { agentId, inputs } = validatedData;

    console.log(`Running agent ${agentId} with inputs:`, inputs);

    // Get agent configuration
    const agentConfig = await getAgentConfig(agentId);
    if (!agentConfig) {
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
    if (agentConfig.status !== 'active') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Agent is not active',
          agentId,
          status: agentConfig.status 
        },
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Validate webhook URL
    if (!agentConfig.webhook_url) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Agent webhook URL not configured',
          agentId 
        },
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Call the webhook
    const webhookResult = await callWebhook(agentConfig.webhook_url, inputs);
    const executionTime = Date.now() - startTime;

    // Log successful run
    await logAgentRun(agentId, inputs, webhookResult.data);

    // Return the webhook response
    return NextResponse.json(
      {
        success: true,
        agentId,
        agentName: agentConfig.name,
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
    const executionTime = Date.now() - startTime;
    console.error('Error running agent:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: error.errors 
        },
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Handle webhook errors
    if (error instanceof Error && error.message.includes('Webhook call failed')) {
      // Log failed run
      const body = await request.json().catch(() => ({}));
      await logAgentRun(body.agentId, body.inputs, null, error.message);

      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          executionTime 
        },
        { 
          status: 502, // Bad Gateway
          headers: corsHeaders,
        }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        executionTime 
      },
      { 
        status: 500,
        headers: corsHeaders,
      }
    );
  }
} 