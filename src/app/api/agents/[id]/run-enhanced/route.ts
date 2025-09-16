import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuditLogger } from '../../../../../lib/audit-logger';
import { WebhookSigning } from '../../../../../lib/webhook-signing';
import { z } from 'zod';

// Credit earning percentage for creators (configurable)
const CREATOR_EARN_PERCENTAGE = 0.7; // 70% to creator, 30% to platform

const runAgentRequestSchema = z.object({
  input: z.any().refine((val) => {
    const inputSize = JSON.stringify(val).length;
    return inputSize <= 10 * 1024 * 1024; // 10MB limit
  }, 'Input size exceeds 10MB limit'),
  parameters: z.record(z.any()).optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;
    const agentId = params.id;

    // Validate request body
    const body = await req.json();
    const { input, parameters } = runAgentRequestSchema.parse(body);

    // Get agent details
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        creator: {
          select: { id: true, name: true, credits: true }
        }
      }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (!agent.isPublic || agent.status !== 'active') {
      return NextResponse.json({ error: 'Agent is not available' }, { status: 403 });
    }

    // Check user credits
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.credits < agent.price) {
      return NextResponse.json({ 
        error: `Insufficient credits. Required: ${agent.price}, Available: ${user.credits}` 
      }, { status: 400 });
    }

    // Validate input against agent's input schema
    const inputSchema = agent.config && typeof agent.config === 'object' && 'inputSchema' in agent.config 
      ? (agent.config as any).inputSchema 
      : null;
    
    if (inputSchema) {
      try {
        const schema = typeof inputSchema === 'string' 
          ? JSON.parse(inputSchema) 
          : inputSchema;
        
        // Basic validation - you might want to use a more robust JSON schema validator
        if (schema.required && Array.isArray(schema.required)) {
          for (const field of schema.required) {
            if (!(field in input)) {
              return NextResponse.json({ 
                error: `Missing required field: ${field}` 
              }, { status: 400 });
            }
          }
        }
      } catch (error) {
        console.error('Input schema validation error:', error);
        // Continue without validation if schema is invalid
      }
    }

    const startTime = Date.now();
    let webhookLog: any = null;
    let success = false;
    let response: any = null;
    let error: any = null;

    try {
      // Prepare webhook payload
      const webhookPayload = {
        agentId: agent.id,
        userId: userId,
        input: input,
        parameters: parameters || {},
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      };

      // Create signed payload if webhook secret exists
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'Xeinst-Agent-Platform/1.0',
      };

      let body: string;
      
      if (agent.webhookSecret) {
        const signedPayload = WebhookSigning.createSignedPayload(
          webhookPayload,
          agent.webhookSecret
        );
        body = signedPayload.payload;
        headers = {
          ...headers,
          ...WebhookSigning.generateWebhookHeaders(signedPayload.payload, agent.webhookSecret)
        };
      } else {
        body = JSON.stringify(webhookPayload);
      }

      // Call agent webhook
      const webhookResponse = await fetch(agent.webhookUrl!, {
        method: 'POST',
        headers,
        body,
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      const latencyMs = Date.now() - startTime;
      const responseText = await webhookResponse.text();
      const payloadSize = responseText.length;

      // Log webhook call
      webhookLog = await prisma.webhookLog.create({
        data: {
          agentId: agent.id,
          statusCode: webhookResponse.status,
          latencyMs,
          payloadSize,
          ok: webhookResponse.ok
        }
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook returned ${webhookResponse.status}: ${responseText}`);
      }

      // Parse response
      try {
        response = JSON.parse(responseText);
      } catch (parseError) {
        response = { output: responseText };
      }

      success = true;

    } catch (webhookError) {
      error = webhookError;
      const latencyMs = Date.now() - startTime;
      
      // Log failed webhook call
      webhookLog = await prisma.webhookLog.create({
        data: {
          agentId: agent.id,
          statusCode: 0,
          latencyMs,
          payloadSize: 0,
          ok: false
        }
      });

      console.error('Webhook call failed:', webhookError);
    }

    // Process credits in a transaction
    await prisma.$transaction(async (tx) => {
      if (success) {
        // Deduct credits from user
        await tx.user.update({
          where: { id: userId },
          data: { credits: { decrement: agent.price } }
        });

        // Log spend transaction
        await tx.creditTransaction.create({
          data: {
            userId: userId,
            type: 'spend',
            amount: -agent.price,
            agentId: agent.id
          }
        });

        // Calculate creator earnings
        const creatorEarnings = Math.floor(agent.price * CREATOR_EARN_PERCENTAGE);
        
        if (creatorEarnings > 0) {
          // Add credits to creator
          await tx.user.update({
            where: { id: agent.createdBy },
            data: { credits: { increment: creatorEarnings } }
          });

          // Log earn transaction
          await tx.creditTransaction.create({
            data: {
              userId: agent.createdBy,
              type: 'earn',
              amount: creatorEarnings,
              agentId: agent.id
            }
          });
        }

        // Update agent download count
        await tx.agent.update({
          where: { id: agent.id },
          data: { downloadCount: { increment: 1 } }
        });
      }
    });

    // Log audit events
    await AuditLogger.logAgent('run', agent.id, userId, {
      success,
      creditsSpent: success ? agent.price : 0,
      creatorEarnings: success ? Math.floor(agent.price * CREATOR_EARN_PERCENTAGE) : 0,
      latencyMs: webhookLog?.latencyMs,
      statusCode: webhookLog?.statusCode
    });

    if (success) {
      return NextResponse.json({
        success: true,
        output: response?.output || response,
        logs: response?.logs || [],
        meta: {
          ...response?.meta,
          creditsSpent: agent.price,
          latencyMs: webhookLog?.latencyMs,
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      });
    } else {
      // Rollback credits if webhook failed
      await prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: agent.price } }
      });

      await prisma.creditTransaction.create({
        data: {
          userId: userId,
          type: 'adjust',
          amount: agent.price,
          agentId: agent.id
        }
      });

      return NextResponse.json({
        success: false,
        error: error?.message || 'Agent execution failed',
        meta: {
          latencyMs: webhookLog?.latencyMs,
          statusCode: webhookLog?.statusCode
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error running agent:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to run agent' 
    }, { status: 500 });
  }
}
