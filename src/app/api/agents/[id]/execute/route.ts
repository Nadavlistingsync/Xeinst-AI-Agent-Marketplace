import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from 'zod';
import { webhookConfig, isWebhookSystemReady } from '../../../../../lib/webhook-config';

const executeAgentSchema = z.object({
  trigger: z.string().min(1, "Trigger type is required"),
  data: z.any(),
  fileIds: z.array(z.string()).optional(),
  options: z.any().optional()
});

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
    const validatedData = executeAgentSchema.parse(body);

    // Get agent details
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { creator: true }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (agent.status !== 'active') {
      return NextResponse.json({ error: 'Agent is not available' }, { status: 400 });
    }

    // Check if user has purchased access to this agent
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        credits: true,
        subscriptionId: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has enough credits
    if (user.credits < agent.price) {
      return NextResponse.json({
        error: 'Insufficient credits',
        details: `You need ${agent.price} credits to use this agent. You have ${user.credits} credits.`,
        requiredCredits: agent.price,
        currentCredits: user.credits,
        shortfall: agent.price - user.credits
      }, { status: 402 }); // 402 Payment Required
    }

    // Check if user has purchased access to this agent
    const purchase = await prisma.purchase.findFirst({
      where: {
        productId: agent.id,
        userId: session.user.id,
        status: 'completed'
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!purchase) {
      return NextResponse.json({
        error: 'Access not purchased',
        details: 'You must purchase access to this agent before using it',
        agentPrice: agent.price,
        purchaseUrl: `/api/credits/purchase?agentId=${agent.id}`
      }, { status: 402 });
    }

    // Note: Usage limits would be implemented based on the purchase model
    // For now, we'll allow unlimited usage after purchase

    // Deduct credits and create execution
    const execution = await prisma.$transaction(async (tx) => {
      // Deduct credits from user
      await tx.user.update({
        where: { id: session.user.id },
        data: { 
          credits: { decrement: agent.price }
        }
      });

      // Create execution record
      const execution = await tx.webhookLog.create({
        data: {
          agentId: agent.id,
          statusCode: 200,
          latencyMs: 0,
          payloadSize: JSON.stringify(validatedData).length,
          ok: true
        }
      });

      return execution;
    });

    // Prepare files for webhook payload (if any)
    let files: any[] = [];
    if (validatedData.fileIds && validatedData.fileIds.length > 0) {
      const tempFiles = await prisma.file.findMany({
        where: { 
          id: { in: validatedData.fileIds },
          uploadedBy: session.user.id
        }
      });

      // Read file contents and convert to base64 for webhook
      const { readFile } = await import('fs/promises');
      const { join } = await import('path');
      
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

    // Prepare webhook payload
    const webhookPayload = {
      event: validatedData.trigger,
      timestamp: new Date().toISOString(),
      executionId: execution.id,
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        version: agent.version || '1.0.0'
      },
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      },
      data: validatedData.data,
      files: files,
      options: validatedData.options,
      callbackUrl: `${webhookConfig.appUrl}/api/webhooks/agent-response`,
      webhook: {
        id: execution.id,
        url: agent.webhookUrl,
        secret: agent.webhookSecret ? '***' : null,
        retryCount: 0,
        maxRetries: webhookConfig.maxRetries
      }
    };

    // Send webhook to external agent
    const webhookResponse = await fetch(agent.webhookUrl, {
      method: 'POST',
      headers: {
        ...webhookConfig.production.defaultHeaders,
        'X-Webhook-Event': validatedData.trigger,
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

      // Refund credits
      await prisma.user.update({
        where: { id: session.user.id },
        data: { 
          credits: { increment: agent.price }
        }
      });

      return NextResponse.json({ 
        error: 'Failed to execute agent',
        details: webhookResponse.statusText,
        creditsRefunded: agent.price
      }, { status: 500 });
    }

    // Update execution status to processing
    await prisma.webhookLog.update({
      where: { id: execution.id },
      data: { ok: true }
    });

    // Note: File status updates would be implemented based on the file model

    return NextResponse.json({
      success: true,
      executionId: execution.id,
      status: 'processing',
      message: 'Agent execution started',
      creditsUsed: agent.price,
      remainingCredits: user.credits - agent.price,
      remainingUses: 'unlimited'
    });

  } catch (error) {
    console.error('Agent execution error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
