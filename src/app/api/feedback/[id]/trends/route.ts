import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createErrorResponse } from '@/lib/api';
import { z } from 'zod';

const trendsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  interval: z.enum(['hour', 'day', 'week', 'month']).optional(),
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
      interval: searchParams.get('interval') as 'hour' | 'day' | 'week' | 'month' | null,
      includeDetails: searchParams.get('includeDetails') === 'true'
    };

    const validatedParams = trendsQuerySchema.parse(queryParams);

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
        createdAt: 'asc'
      }
    });

    // Calculate trends based on interval
    const interval = validatedParams.interval || 'day';
    const trends = feedback.reduce((acc, item) => {
      const date = new Date(item.createdAt);
      let key: string;

      switch (interval) {
        case 'hour':
          key = date.toISOString().slice(0, 13); // YYYY-MM-DDTHH
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().slice(0, 10); // YYYY-MM-DD
          break;
        case 'month':
          key = date.toISOString().slice(0, 7); // YYYY-MM
          break;
        default: // day
          key = date.toISOString().slice(0, 10); // YYYY-MM-DD
      }

      if (!acc[key]) {
        acc[key] = {
          count: 0,
          totalRating: 0,
          items: validatedParams.includeDetails ? [] : undefined
        };
      }

      acc[key].count++;
      acc[key].totalRating += item.rating;

      if (validatedParams.includeDetails) {
        acc[key].items!.push({
          id: item.id,
          comment: item.comment,
          rating: item.rating,
          createdAt: item.createdAt
        });
      }

      return acc;
    }, {} as Record<string, { count: number; totalRating: number; items?: any[] }>);

    // Calculate averages and format response
    const trendData = Object.entries(trends).map(([date, data]) => ({
      date,
      count: data.count,
      averageRating: data.totalRating / data.count,
      ...(validatedParams.includeDetails && { items: data.items })
    }));

    return NextResponse.json({
      trends: trendData,
      metadata: {
        agentId: params.id,
        timeRange: {
          start: validatedParams.startDate,
          end: validatedParams.endDate
        },
        interval,
        totalFeedback: feedback.length,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error analyzing feedback trends:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }

    const errorResponse = createErrorResponse(error, 'Failed to analyze feedback trends');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.status }
    );
  }
} 