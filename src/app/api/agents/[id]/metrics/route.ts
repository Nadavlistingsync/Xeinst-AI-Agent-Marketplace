import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "../../../../../lib/auth";
import { getAgentMetrics } from '@/lib/agent-monitoring';
import { prisma } from "../../../../../lib/prisma";
import { createErrorResponse, createSuccessResponse } from '@/lib/api';
import { z } from 'zod';
import type { Deployment, User } from '@/types/prisma';

export const dynamic = 'force-dynamic';

const metricsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  interval: z.enum(['hour', 'day', 'week', 'month']).optional(),
});

type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise';

type AgentWithCreator = Deployment & {
  creator: Pick<User, 'id' | 'subscriptionTier'>;
};

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
    }) as AgentWithCreator | null;

    if (!agent) {
      return createErrorResponse('Agent not found');
    }

    // Check if user has access to the agent
    if (agent.createdBy !== session.user.id && agent.accessLevel !== 'public') {
      if (agent.accessLevel === 'restricted') {
        const creatorTier = agent.creator.subscriptionTier as SubscriptionTier;
        const userTier = session.user.subscriptionTier as SubscriptionTier;
        
        if (creatorTier === 'enterprise' && userTier !== 'enterprise') {
          return createErrorResponse('Enterprise access required');
        }
        if (creatorTier === 'premium' && userTier !== 'premium') {
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

    metricsQuerySchema.parse(queryParams);

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