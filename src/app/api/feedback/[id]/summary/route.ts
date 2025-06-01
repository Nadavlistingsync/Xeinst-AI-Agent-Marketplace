import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createErrorResponse } from '@/lib/api';
import { z } from 'zod';

const summaryQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  includeDetails: z.boolean().optional()
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
      includeDetails: searchParams.get('includeDetails') === 'true'
    };

    const validatedParams = summaryQuerySchema.parse(queryParams);

    // Get feedback entries
    const feedback = await prisma.feedback.findMany({
      where: {
        agentId: params.id,
        ...(validatedParams.startDate && validatedParams.endDate ? {
          createdAt: {
            gte: new Date(validatedParams.startDate),
            lte: new Date(validatedParams.endDate)
          }
        } : {})
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate summary statistics
    const totalFeedback = feedback.length;
    const averageRating = feedback.reduce((sum, item) => sum + item.rating, 0) / totalFeedback;
    
    const ratingDistribution = feedback.reduce((acc, item) => {
      const rating = Math.round(item.rating);
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const sentimentDistribution = feedback.reduce((acc, item) => {
      const sentiment = item.rating >= 4 ? 'positive' : item.rating >= 3 ? 'neutral' : 'negative';
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentFeedback = validatedParams.includeDetails ? feedback.slice(0, 5) : undefined;

    return NextResponse.json({
      summary: {
        totalFeedback,
        averageRating,
        ratingDistribution,
        sentimentDistribution,
        ...(recentFeedback && { recentFeedback })
      },
      metadata: {
        agentId: params.id,
        timeRange: {
          start: validatedParams.startDate,
          end: validatedParams.endDate
        },
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating feedback summary:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }

    const errorResponse = createErrorResponse(error, 'Failed to generate feedback summary');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.status }
    );
  }
} 