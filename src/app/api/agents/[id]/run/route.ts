import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { executeAgent } from '@/lib/agent-execution';
// import { withEnhancedErrorHandling, ErrorCategory, ErrorSeverity, EnhancedAppError } from "../../../../../lib/enhanced-error-handling";
import { AuditLogger } from '@/lib/audit-logger';
import { z } from 'zod';

// Enhanced request validation schema
const runAgentRequestSchema = z.object({
  input: z.any().refine((val) => {
    const inputSize = JSON.stringify(val).length;
    return inputSize <= 10 * 1024 * 1024; // 10MB limit
  }, 'Input size exceeds 10MB limit'),
  parameters: z.record(z.any()).optional(),
  timeout: z.number().min(1000).max(300000).optional(), // 1s to 5min
  maxTokens: z.number().min(1).max(100000).optional(),
  temperature: z.number().min(0).max(2).optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  try {
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const agentId = params.id;

    // Validate agent exists
    const agent = await prisma.deployment.findUnique({ 
      where: { id: agentId },
      include: {
        creator: {
          select: { id: true, name: true }
        }
      }
    });

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Prevent users from running their own agents for credits
    if (agent.createdBy === userId) {
      return NextResponse.json(
        { success: false, error: 'Cannot run own agent' },
        { status: 403 }
      );
    }

    // Get user with current credits
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { id: true, credits: true, name: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Validate request schema
    let validatedRequest;
    try {
      validatedRequest = runAgentRequestSchema.parse(requestBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
      }
      throw error;
    }

    // Check credit requirements
    const price = agent.pricePerRun || 1;
    if (user.credits < price) {
      return NextResponse.json(
        { success: false, error: 'Insufficient credits' },
        { status: 402 }
      );
    }

    // Create transaction record
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Execute agent with enhanced options
    const executionResult = await executeAgent(agentId, validatedRequest.input, {
      timeout: validatedRequest.timeout || 30000, // 30s default
      maxTokens: validatedRequest.maxTokens,
      temperature: validatedRequest.temperature,
      userId: userId,
      requestId: transactionId,
    });

    // Handle execution failure
    if (!executionResult.success) {
      return NextResponse.json(
        { success: false, error: 'Agent execution failed' },
        { status: 500 }
      );
    }

    // Process successful execution - deduct credits and distribute
    try {
      await prisma.$transaction(async (tx) => {
        // Deduct credits from user
        await tx.user.update({
          where: { id: userId },
          data: { credits: { decrement: price } },
        });

        // Credit distribution: 80% to creator, 20% to platform
        const creatorShare = Math.floor(price * 0.8);
        const platformShare = price - creatorShare;

        // Credit creator
        await tx.user.update({
          where: { id: agent.createdBy },
          data: { credits: { increment: creatorShare } },
        });

        // Credit platform (assume platform user id = 'platform')
        await tx.user.update({
          where: { id: 'platform' },
          data: { credits: { increment: platformShare } },
        });

        // Log all transactions
        await tx.creditTransaction.createMany({
          data: [
            { 
              userId, 
              type: 'spend', 
              amount: -price, 
              agentId,
            },
            { 
              userId: agent.createdBy, 
              type: 'earn', 
              amount: creatorShare, 
              agentId,
            },
            { 
              userId: 'platform', 
              type: 'earn', 
              amount: platformShare, 
              agentId,
            },
          ],
        });

        // Update agent metrics
        await tx.agentMetrics.upsert({
          where: { id: agentId },
          update: {
            totalRequests: { increment: 1 },
            successRate: 1, // This was a successful execution
            lastUpdated: new Date(),
          },
          create: {
            id: agentId,
            deploymentId: agentId,
            totalRequests: 1,
            successRate: 1,
            errorRate: 0,
            averageResponseTime: executionResult.executionTime || 0,
            responseTime: executionResult.executionTime || 0,
            requestsPerMinute: 1,
            activeUsers: 1,
            averageTokensUsed: 0,
            costPerRequest: price,
            totalCost: price,
            lastUpdated: new Date(),
          },
        });
      });
    } catch (transactionError) {
      console.error('Transaction failed:', transactionError);
      return NextResponse.json(
        { success: false, error: 'Payment processing failed' },
        { status: 500 }
      );
    }

    // Return successful result with enhanced metadata
    return NextResponse.json({
      success: true,
      data: executionResult.data,
      executionTime: executionResult.executionTime,
      tokensUsed: executionResult.tokensUsed,
      requestId: executionResult.requestId,
      transactionId,
      creditsSpent: price,
      remainingCredits: user.credits - price,
      agent: {
        id: agent.id,
        name: agent.name,
        creator: agent.creator?.name || 'Unknown',
      },
    });

  } catch (error) {
    console.error('POST /api/agents/[id]/run error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run agent' },
      { status: 500 }
    );
  }
} 