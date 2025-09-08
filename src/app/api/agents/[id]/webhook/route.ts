import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Webhook-based agent execution
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
    const { input, fileIds, options = {} } = body;

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
        error: 'Agent does not support webhook execution' 
      }, { status: 400 });
    }

    // Prepare files for webhook payload
    let files: any[] = [];
    if (fileIds && fileIds.length > 0) {
      const tempFiles = await prisma.tempFile.findMany({
        where: { 
          id: { in: fileIds },
          uploadedBy: session.user.id,
          status: 'pending'
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
    const execution = await prisma.agentExecution.create({
      data: {
        agentId,
        userId: session.user.id,
        input: JSON.stringify(input),
        status: 'pending',
        webhookUrl: agent.webhookUrl,
        fileIds: fileIds || []
      }
    });

    // Prepare webhook payload
    const webhookPayload = {
      executionId: execution.id,
      agentId,
      userId: session.user.id,
      input,
      files,
      options,
      timestamp: new Date().toISOString(),
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/agent-response`
    };

    // Send webhook to external agent
    const webhookResponse = await fetch(agent.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${agent.webhookSecret || ''}`,
        'X-Execution-ID': execution.id,
        'X-Agent-ID': agentId
      },
      body: JSON.stringify(webhookPayload)
    });

    if (!webhookResponse.ok) {
      // Update execution status to failed
      await prisma.agentExecution.update({
        where: { id: execution.id },
        data: { 
          status: 'failed',
          error: `Webhook failed: ${webhookResponse.status} ${webhookResponse.statusText}`
        }
      });

      return NextResponse.json({ 
        error: 'Failed to execute agent webhook',
        details: webhookResponse.statusText
      }, { status: 500 });
    }

    // Update execution status to processing
    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: { status: 'processing' }
    });

    // Update file statuses to processing
    if (fileIds && fileIds.length > 0) {
      await prisma.tempFile.updateMany({
        where: { id: { in: fileIds } },
        data: { status: 'processing' }
      });
    }

    return NextResponse.json({
      success: true,
      executionId: execution.id,
      status: 'processing',
      message: 'Agent execution started via webhook'
    });

  } catch (error) {
    console.error('Webhook execution error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get execution status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const executionId = searchParams.get('executionId');

    if (!executionId) {
      return NextResponse.json({ error: 'Execution ID required' }, { status: 400 });
    }

    const execution = await prisma.agentExecution.findFirst({
      where: { 
        id: executionId,
        userId: session.user.id
      },
      include: { agent: true }
    });

    if (!execution) {
      return NextResponse.json({ error: 'Execution not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      execution: {
        id: execution.id,
        status: execution.status,
        input: execution.input ? JSON.parse(execution.input) : null,
        output: execution.output ? JSON.parse(execution.output) : null,
        error: execution.error,
        createdAt: execution.createdAt,
        completedAt: execution.completedAt,
        agent: {
          id: execution.agent.id,
          name: execution.agent.name,
          description: execution.agent.description
        }
      }
    });

  } catch (error) {
    console.error('Get execution error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
