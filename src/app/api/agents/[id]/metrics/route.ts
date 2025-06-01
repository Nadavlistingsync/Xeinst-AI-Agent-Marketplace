import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAgentMetrics } from '@/lib/agent-monitoring';
import prisma from '@/lib/prisma';
import { MetricsUpdate } from '@/lib/agent-monitoring';
import { createErrorResponse } from '@/lib/api';
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate agent ID
    if (!z.string().uuid().safeParse(params.id).success) {
      return NextResponse.json(
        { error: 'Invalid agent ID format' },
        { status: 400 }
      );
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            subscription_tier: true
          }
        }
      }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Check if user has access to the agent
    if (agent.userId !== session.user.id && agent.access_level !== 'public') {
      if (agent.access_level === 'premium' && session.user.subscription_tier !== 'premium') {
        return NextResponse.json(
          { error: 'Premium subscription required' },
          { status: 403 }
        );
      }
      if (agent.access_level === 'basic' && session.user.subscription_tier !== 'basic') {
        return NextResponse.json(
          { error: 'Basic subscription required' },
          { status: 403 }
        );
      }
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      interval: searchParams.get('interval') as 'hour' | 'day' | 'week' | 'month' | null
    };

    const validatedParams = metricsQuerySchema.parse(queryParams);

    const metrics = await getAgentMetrics(params.id, validatedParams);
    if (!metrics) {
      return NextResponse.json(
        { error: 'Metrics not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(metrics as MetricsUpdate);
  } catch (error) {
    console.error('Error fetching agent metrics:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }

    const errorResponse = createErrorResponse(error, 'Failed to fetch agent metrics');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.status }
    );
  }
} 