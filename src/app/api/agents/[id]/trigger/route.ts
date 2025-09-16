import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readFile } from 'fs/promises';
import { join } from 'path';
import { webhookConfig, getCallbackUrl, isWebhookSystemReady } from '../../../../../lib/webhook-config';

// Webhook trigger for agents (like n8n/Zapier)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // Check if webhook system is ready
    if (!isWebhookSystemReady()) {
      return NextResponse.json({ 
        error: 'Webhook system is not properly configured',
        details: 'Please check your environment variables'
      }, { status: 503 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agentId = params.id;
    const body = await request.json();
    const { 
      trigger, // The trigger event (e.g., 'user_input', 'file_upload', 'scheduled')
      data, // The data to send to the agent
      fileIds = [], // Optional file IDs
      options = {} // Additional options
    } = body;

    // Get agent details
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { creator: true }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Check if agent has webhook URL configured
    if (!agent.webhookUrl) {
      return NextResponse.json({ 
        error: 'Agent does not support webhook triggers. Please configure a webhook URL.' 
      }, { status: 400 });
    }

    // Prepare files for webhook payload (if any)
    let files: any[] = [];
    if (fileIds && fileIds.length > 0) {
      const tempFiles = await prisma.file.findMany({
        where: { 
          id: { in: fileIds },
          uploadedBy: session.user.id
        }
      });

      // Read file contents and convert to base64 for webhook
      files = await Promise.all(
        tempFiles.map(async (file) => {
          const fileBuffer = await readFile(file.path);
          return {
            id: file.id,
            name: file.name,
            type: file.type,
            size: file.size,
            content: fileBuffer.toString('base64')
          };
        })
      );
    }

    // Create execution record
    const execution = await prisma.webhookLog.create({
      data: {
        agentId,
        statusCode: 200,
        latencyMs: 0,
        payloadSize: JSON.stringify({ trigger, data, options }).length,
        ok: true
      }
    });

    // Prepare webhook payload (n8n/Zapier style)
    const webhookPayload = {
      // Standard webhook fields
      event: trigger,
      timestamp: new Date().toISOString(),
      executionId: execution.id,
      
      // Agent information
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        version: agent.version || '1.0.0'
      },
      
      // User information
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      },
      
      // Trigger data
      data: data,
      
      // Files (if any)
      files: files,
      
      // Options
      options: options,
      
      // Callback URL for response
      callbackUrl: getCallbackUrl(),
      
      // Webhook metadata
      webhook: {
        id: execution.id,
        url: agent.webhookUrl,
        secret: agent.webhookSecret ? '***' : null,
        retryCount: 0,
        maxRetries: 3
      }
    };

    // Send webhook trigger to external agent
    const webhookResponse = await fetch(agent.webhookUrl, {
      method: 'POST',
      headers: {
        ...webhookConfig.production.defaultHeaders,
        'X-Webhook-Event': trigger,
        'X-Execution-ID': execution.id,
        'X-Agent-ID': agentId,
        'X-User-ID': session.user.id,
        ...(agent.webhookSecret && {
          'Authorization': `Bearer ${agent.webhookSecret}`
        })
      },
      body: JSON.stringify(webhookPayload),
      signal: AbortSignal.timeout(webhookConfig.timeout)
    });

    if (!webhookResponse.ok) {
      // Update execution status to failed
      await prisma.webhookLog.update({
        where: { id: execution.id },
        data: { 
          statusCode: webhookResponse.status,
          ok: false
        }
      });

      return NextResponse.json({ 
        error: 'Failed to trigger agent webhook',
        details: webhookResponse.statusText,
        status: webhookResponse.status
      }, { status: 500 });
    }

    // Update execution status to processing
    await prisma.webhookLog.update({
      where: { id: execution.id },
      data: { ok: true }
    });

    // Note: File status updates would be implemented based on the file model

    // Update agent statistics
    await prisma.agent.update({
      where: { id: agentId },
      data: {
        downloadCount: { increment: 1 }
      }
    });

    return NextResponse.json({
      success: true,
      executionId: execution.id,
      status: 'processing',
      message: `Agent triggered successfully via webhook`,
      webhook: {
        url: agent.webhookUrl,
        event: trigger,
        timestamp: webhookPayload.timestamp
      }
    });

  } catch (error) {
    console.error('Webhook trigger error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get trigger history for an agent
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
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get recent executions for this agent
    const executions = await prisma.webhookLog.findMany({
      where: { 
        agentId
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: { agent: true }
    });

    return NextResponse.json({
      success: true,
      executions: executions.map(exec => ({
        id: exec.id,
        status: exec.ok ? 'success' : 'failed',
        statusCode: exec.statusCode,
        createdAt: exec.createdAt,
        latencyMs: exec.latencyMs,
        agent: {
          id: exec.agent.id,
          name: exec.agent.name
        }
      }))
    });

  } catch (error) {
    console.error('Get trigger history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
