import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateFeedbackInsights, analyzeFeedbackTrends } from '@/lib/feedback-analysis';
import prisma from '@/lib/prisma';
import { createErrorResponse } from '@/lib/api';
import { z } from 'zod';

const insightsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  category: z.enum(['all', 'error', 'warning', 'success']).optional(),
  limit: z.number().min(1).max(100).optional(),
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
      category: searchParams.get('category') as 'all' | 'error' | 'warning' | 'success' | null,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    };

    const validatedParams = insightsQuerySchema.parse(queryParams);

    const [insights, trends] = await Promise.all([
      generateFeedbackInsights(params.id),
      analyzeFeedbackTrends(params.id, {
        startDate: validatedParams.startDate ? new Date(validatedParams.startDate) : undefined,
        endDate: validatedParams.endDate ? new Date(validatedParams.endDate) : undefined,
        category: validatedParams.category
      })
    ]);

    return NextResponse.json({
      insights,
      trends,
      lastUpdated: new Date().toISOString(),
      metadata: {
        agentId: params.id,
        timeRange: {
          start: validatedParams.startDate,
          end: validatedParams.endDate
        },
        category: validatedParams.category || 'all'
      }
    });
  } catch (error) {
    console.error('Error generating feedback insights:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }

    const errorResponse = createErrorResponse(error, 'Failed to generate feedback insights');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.status }
    );
  }
} 