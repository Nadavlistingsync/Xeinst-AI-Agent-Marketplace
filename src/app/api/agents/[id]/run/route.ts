import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { executeAgent } from '@/lib/agent-execution';
import { withEnhancedErrorHandling, ErrorCategory, ErrorSeverity, EnhancedAppError } from '@/lib/enhanced-error-handling';
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
  
  return withEnhancedErrorHandling(async () => {
    if (!session?.user?.id) {
      throw new EnhancedAppError(
        'Authentication required',
        401,
        ErrorCategory.AUTHENTICATION,
        ErrorSeverity.MEDIUM,
        'AUTH_REQUIRED',
        null,
        false,
        undefined,
        'Please sign in to run agents',
        ['Sign in to your account', 'Check your credentials']
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
      throw new EnhancedAppError(
        'Agent not found',
        404,
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        'AGENT_NOT_FOUND',
        null,
        false,
        undefined,
        'The requested agent could not be found',
        ['Check the agent ID', 'Try browsing available agents']
      );
    }

    // Prevent users from running their own agents for credits
    if (agent.createdBy === userId) {
      throw new EnhancedAppError(
        'Cannot run own agent',
        403,
        ErrorCategory.AUTHORIZATION,
        ErrorSeverity.MEDIUM,
        'OWN_AGENT_RUN',
        null,
        false,
        undefined,
        'You cannot run your own agent for credits',
        ['Use the agent builder to test your agent', 'Deploy your agent for others to use']
      );
    }

    // Get user with current credits
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { id: true, credits: true, name: true }
    });

    if (!user) {
      throw new EnhancedAppError(
        'User not found',
        404,
        ErrorCategory.VALIDATION,
        ErrorSeverity.HIGH,
        'USER_NOT_FOUND',
        null,
        false,
        undefined,
        'User account could not be found',
        ['Try signing in again', 'Contact support if the issue persists']
      );
    }

    // Validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      throw new EnhancedAppError(
        'Invalid request format',
        400,
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        'INVALID_JSON',
        null,
        false,
        undefined,
        'Request body must be valid JSON',
        ['Check your request format', 'Ensure proper JSON syntax']
      );
    }

    // Validate request schema
    let validatedRequest;
    try {
      validatedRequest = runAgentRequestSchema.parse(requestBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new EnhancedAppError(
          'Invalid request data',
          400,
          ErrorCategory.VALIDATION,
          ErrorSeverity.MEDIUM,
          'VALIDATION_ERROR',
          error.errors,
          false,
          undefined,
          'Request data does not meet requirements',
          ['Check input size limits', 'Verify parameter values']
        );
      }
      throw error;
    }

    // Check credit requirements
    const price = agent.pricePerRun || 1;
    if (user.credits < price) {
      throw new EnhancedAppError(
        'Insufficient credits',
        402,
        ErrorCategory.PAYMENT,
        ErrorSeverity.MEDIUM,
        'INSUFFICIENT_CREDITS',
        { required: price, available: user.credits },
        false,
        undefined,
        `You need ${price} credits to run this agent. You have ${user.credits} credits.`,
        ['Purchase more credits', 'Try a different agent', 'Check your credit balance']
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
      throw new EnhancedAppError(
        'Agent execution failed',
        500,
        ErrorCategory.AGENT_EXECUTION,
        ErrorSeverity.HIGH,
        'EXECUTION_FAILED',
        { error: executionResult.error, logs: executionResult.logs },
        true, // Retryable
        5000, // Retry after 5 seconds
        'The agent encountered an error during execution',
        ['Try again in a few moments', 'Check agent status', 'Contact agent creator']
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
      throw new EnhancedAppError(
        'Payment processing failed',
        500,
        ErrorCategory.PAYMENT,
        ErrorSeverity.HIGH,
        'PAYMENT_FAILED',
        { error: transactionError instanceof Error ? transactionError.message : 'Unknown error' },
        true, // Retryable
        10000, // Retry after 10 seconds
        'Failed to process payment for agent execution',
        ['Try again in a few moments', 'Contact support if issue persists']
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

  }, { 
    endpoint: `/api/agents/${params.id}/run`, 
    method: 'POST',
    context: { agentId: params.id, userId: session?.user?.id }
  });
} 