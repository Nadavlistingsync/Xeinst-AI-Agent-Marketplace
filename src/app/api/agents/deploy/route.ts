import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { z } from 'zod';

const deployAgentSchema = z.object({
  agentId: z.string(),
  webhookUrl: z.string().url(),
  webhookSecret: z.string().optional(),
  config: z.record(z.any()).optional()
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { agentId, webhookUrl, webhookSecret, config } = deployAgentSchema.parse(body);

    // Get agent
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { creator: true }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Check if user owns the agent
    if (agent.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to deploy this agent' },
        { status: 403 }
      );
    }

    // Validate webhook URL
    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Xeinst-Agent-Validator/1.0'
        },
        body: JSON.stringify({
          test: true,
          validation: true,
          timestamp: new Date().toISOString()
        }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!webhookResponse.ok) {
        return NextResponse.json(
          { error: 'Webhook validation failed. Please ensure your webhook is accessible and returns a 200 status.' },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Webhook validation failed. Please check your webhook URL and ensure it\'s accessible.' },
        { status: 400 }
      );
    }

    // Generate webhook secret if not provided
    const finalWebhookSecret = webhookSecret || generateWebhookSecret();

    // Update agent with deployment info
    const updatedAgent = await prisma.agent.update({
      where: { id: agentId },
      data: {
        webhookUrl,
        webhookSecret: finalWebhookSecret,
        config: config || {},
        status: 'active'
      }
    });

    // Create agent version
    await prisma.agentVersion.create({
      data: {
        agent: {
          connect: { id: agentId }
        },
        version: agent.version,
        changelog: "Initial deployment",
        webhookUrl,
        webhookSecret: finalWebhookSecret,
        config: config || {},
        isActive: true,
        creator: {
          connect: { id: session.user.id }
        }
      }
    });

    // Log deployment
    await prisma.agentLog.create({
      data: {
        deploymentId: agentId,
        level: 'info',
        message: 'Agent deployed successfully',
        metadata: {
          webhookUrl,
          version: agent.version,
        changelog: "Initial deployment",
          deployedBy: session.user.id
        }
      }
    });

    return NextResponse.json({
      success: true,
      agent: {
        id: updatedAgent.id,
        name: updatedAgent.name,
        status: updatedAgent.status,
        webhookUrl: updatedAgent.webhookUrl,
        version: updatedAgent.version
      },
      webhookSecret: finalWebhookSecret
    });

  } catch (error) {
    console.error('Agent deployment error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to deploy agent' },
      { status: 500 }
    );
  }
}

function generateWebhookSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
