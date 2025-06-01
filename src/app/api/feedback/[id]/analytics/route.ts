import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createErrorResponse } from '@/lib/api';
import { z } from 'zod';

const analyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  interval: z.enum(['hour', 'day', 'week', 'month']).optional(),
  includeDetails: z.boolean().optional(),
  groupBy: z.enum(['rating', 'sentiment', 'time']).optional()
});

// Helper function to calculate sentiment
const getSentiment = (rating: number): string => {
  if (rating >= 4) return 'positive';
  if (rating >= 3) return 'neutral';
  return 'negative';
};

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
      includeDetails: searchParams.get('includeDetails') === 'true',
      groupBy: searchParams.get('groupBy') as 'rating' | 'sentiment' | 'time' | null
    };

    const validatedParams = analyticsQuerySchema.parse(queryParams);

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

    // Calculate analytics based on grouping
    const groupBy = validatedParams.groupBy || 'time';
    const interval = validatedParams.interval || 'day';
    let analytics: any = {};

    switch (groupBy) {
      case 'rating':
        analytics = feedback.reduce((acc, item) => {
          const rating = Math.round(item.rating);
          if (!acc[rating]) {
            acc[rating] = {
              count: 0,
              total: 0,
              items: validatedParams.includeDetails ? [] : undefined
            };
          }
          acc[rating].count++;
          acc[rating].total += item.rating;
          if (validatedParams.includeDetails) {
            acc[rating].items!.push(item);
          }
          return acc;
        }, {} as Record<number, { count: number; total: number; items?: any[] }>);
        break;

      case 'sentiment':
        analytics = feedback.reduce((acc, item) => {
          const sentiment = getSentiment(item.rating);
          if (!acc[sentiment]) {
            acc[sentiment] = {
              count: 0,
              total: 0,
              items: validatedParams.includeDetails ? [] : undefined
            };
          }
          acc[sentiment].count++;
          acc[sentiment].total += item.rating;
          if (validatedParams.includeDetails) {
            acc[sentiment].items!.push(item);
          }
          return acc;
        }, {} as Record<string, { count: number; total: number; items?: any[] }>);
        break;

      case 'time':
      default:
        analytics = feedback.reduce((acc, item) => {
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
              total: 0,
              sentiment: {
                positive: 0,
                neutral: 0,
                negative: 0
              },
              items: validatedParams.includeDetails ? [] : undefined
            };
          }

          acc[key].count++;
          acc[key].total += item.rating;
          acc[key].sentiment[getSentiment(item.rating)]++;
          if (validatedParams.includeDetails) {
            acc[key].items!.push(item);
          }

          return acc;
        }, {} as Record<string, {
          count: number;
          total: number;
          sentiment: Record<string, number>;
          items?: any[];
        }>);
    }

    // Calculate averages and format response
    const analyticsData = Object.entries(analytics).map(([key, data]: [string, any]) => ({
      key,
      count: data.count,
      averageRating: data.total / data.count,
      ...(data.sentiment && { sentiment: data.sentiment }),
      ...(validatedParams.includeDetails && { items: data.items })
    }));

    return NextResponse.json({
      analytics: analyticsData,
      metadata: {
        agentId: params.id,
        timeRange: {
          start: validatedParams.startDate,
          end: validatedParams.endDate
        },
        groupBy,
        interval,
        totalFeedback: feedback.length,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error analyzing feedback:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }

    const errorResponse = createErrorResponse(error, 'Failed to analyze feedback');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.status }
    );
  }
} 