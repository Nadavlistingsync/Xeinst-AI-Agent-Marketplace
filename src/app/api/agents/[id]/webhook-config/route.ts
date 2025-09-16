import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Configure webhook settings for an agent
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agentId = params.id;
    const body = await request.json();
    const { 
      webhookUrl, 
      webhookSecret, 
      triggers = [], // Array of supported triggers
      timeout = 30000, // Timeout in milliseconds
      retryCount = 3, // Number of retries
      enabled = true 
    } = body;

    // Verify agent exists and user has permission
    const agent = await prisma.agent.findFirst({
      where: { 
        id: agentId,
        createdBy: session.user.id // Only creator can configure webhook
      }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found or access denied' }, { status: 404 });
    }

    // Validate webhook URL
    if (webhookUrl && !isValidUrl(webhookUrl)) {
      return NextResponse.json({ error: 'Invalid webhook URL' }, { status: 400 });
    }

    // Test webhook URL if provided
    if (webhookUrl) {
      try {
        const testResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'AI-Agent-Marketplace/1.0',
            'X-Webhook-Event': 'test',
            'X-Test': 'true'
          },
          body: JSON.stringify({
            event: 'test',
            timestamp: new Date().toISOString(),
            message: 'This is a test webhook from AI Agent Marketplace'
          })
        });

        if (!testResponse.ok) {
          return NextResponse.json({ 
            error: 'Webhook URL test failed',
            details: `HTTP ${testResponse.status}: ${testResponse.statusText}`
          }, { status: 400 });
        }
      } catch (error) {
        return NextResponse.json({ 
          error: 'Webhook URL test failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 400 });
      }
    }

    // Update agent webhook configuration
    const updatedAgent = await prisma.agent.update({
      where: { id: agentId },
      data: {
        webhookUrl,
        webhookSecret,
        config: {
          triggers,
          timeout,
          retryCount,
          enabled,
          lastTested: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({
      success: true,
      agent: {
        id: updatedAgent.id,
        name: updatedAgent.name,
        webhookUrl: updatedAgent.webhookUrl,
        webhookConfig: updatedAgent.config,
        webhookEnabled: enabled
      }
    });

  } catch (error) {
    console.error('Webhook config error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get webhook configuration for an agent
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agentId = params.id;

    // Get agent webhook configuration
    const agent = await prisma.agent.findFirst({
      where: { 
        id: agentId,
        createdBy: session.user.id
      },
      select: {
        id: true,
        name: true,
        webhookUrl: true,
        config: true,
        downloadCount: true
      }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      webhook: {
        url: agent.webhookUrl,
        config: agent.config,
        enabled: agent.webhookUrl && (agent.config as any)?.enabled,
        stats: {
          totalRuns: agent.downloadCount,
          lastRunAt: null
        }
      }
    });

  } catch (error) {
    console.error('Get webhook config error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Test webhook configuration
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agentId = params.id;
    const body = await request.json();
    const { testData = {} } = body;

    // Get agent webhook configuration
    const agent = await prisma.agent.findFirst({
      where: { 
        id: agentId,
        createdBy: session.user.id
      }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found or access denied' }, { status: 404 });
    }

    if (!agent.webhookUrl) {
      return NextResponse.json({ error: 'No webhook URL configured' }, { status: 400 });
    }

    // Send test webhook
    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      agent: {
        id: agent.id,
        name: agent.name
      },
      user: {
        id: session.user.id,
        email: session.user.email
      },
      testData,
      message: 'This is a test webhook from AI Agent Marketplace'
    };

    const testResponse = await fetch(agent.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AI-Agent-Marketplace/1.0',
        'X-Webhook-Event': 'test',
        'X-Test': 'true',
        ...(agent.webhookSecret && {
          'Authorization': `Bearer ${agent.webhookSecret}`
        })
      },
      body: JSON.stringify(testPayload)
    });

    return NextResponse.json({
      success: true,
      test: {
        status: testResponse.status,
        statusText: testResponse.statusText,
        headers: Object.fromEntries(testResponse.headers.entries()),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Webhook test error:', error);
    return NextResponse.json(
      { error: 'Webhook test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to validate URL
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
