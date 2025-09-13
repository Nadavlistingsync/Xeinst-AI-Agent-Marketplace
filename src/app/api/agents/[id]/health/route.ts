import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "../../../../../lib/auth";
import { getAgentHealth } from '@/lib/agent-monitoring';
import { prisma } from "../../../../../lib/prisma";
import { createErrorResponse, createSuccessResponse } from '../../../../../lib/api';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const healthQuerySchema = z.object({
  detailed: z.boolean().optional(),
  includeMetrics: z.boolean().optional(),
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
      if (agent.accessLevel === 'premium' && session.user.subscriptionTier !== 'premium') {
        return createErrorResponse('Premium subscription required');
      }
      if (agent.accessLevel === 'basic' && session.user.subscriptionTier !== 'basic') {
        return createErrorResponse('Basic subscription required');
      }
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      detailed: searchParams.get('detailed') === 'true',
      includeMetrics: searchParams.get('includeMetrics') === 'true'
    };

    const validatedParams = healthQuerySchema.parse(queryParams);

    const health = await getAgentHealth(params.id, { detailed: validatedParams.detailed });
    if (!health) {
      return createErrorResponse('Health check failed');
    }

    return createSuccessResponse({
      ...health,
      lastChecked: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching agent health:', error);
    if (error instanceof z.ZodError) {
      return createErrorResponse('Invalid query parameters');
    }
    return createErrorResponse('Internal server error');
  }
} 