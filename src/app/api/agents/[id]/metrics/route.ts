import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAgentMetrics } from '@/lib/agent-monitoring';
import prisma from '@/lib/prisma';
import { createErrorResponse, createSuccessResponse } from '@/lib/api';
import { z } from 'zod';

const metricsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  interval: z.enum(['hour', 'day', 'week', 'month']).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse('Unauthorized');
    }

    // Validate agent ID
    if (!z.string().uuid().safeParse(params.id).success) {
      return createErrorResponse('Invalid agent ID format');
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            subscriptionTier: true
          }
        }
      }
    });

    if (!agent) {
      return createErrorResponse('Agent not found');
    }

    // Check if user has access to the agent
    if (agent.createdBy !== session.user.id && agent.accessLevel !== 'public') {
      if (agent.accessLevel === 'restricted') {
        if (agent.creator.subscriptionTier === 'enterprise' && session.user.subscriptionTier !== 'enterprise') {
          return createErrorResponse('Enterprise access required');
        }
        if (agent.creator.subscriptionTier === 'premium' && session.user.subscriptionTier !== 'premium') {
          return createErrorResponse('Premium access required');
        }
      }
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      interval: searchParams.get('interval')
    };

    const validatedParams = metricsQuerySchema.parse(queryParams);

    const metrics = await getAgentMetrics(params.id);
    if (!metrics) {
      return createErrorResponse('Metrics not found');
    }

    return createSuccessResponse(metrics);
  } catch (error) {
    console.error('Error fetching agent metrics:', error);
    if (error instanceof z.ZodError) {
      return createErrorResponse('Invalid query parameters');
    }
    return createErrorResponse('Internal server error');
  }
} 