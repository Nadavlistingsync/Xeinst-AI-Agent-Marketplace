import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const compareSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional().default('day')
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const validatedParams = compareSchema.parse({
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      groupBy: searchParams.get('groupBy')
    });

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true
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

    if (agent.createdBy !== session.user.id && !agent.isPublic) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const where = {
      agentId: params.id,
      ...(validatedParams.startDate && {
        createdAt: {
          gte: new Date(validatedParams.startDate)
        }
      }),
      ...(validatedParams.endDate && {
        createdAt: {
          lte: new Date(validatedParams.endDate)
        }
      })
    };

    const feedback = await prisma.agentFeedback.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });

    const metrics = {
      sentiment: {
        current: 0,
        previous: 0,
        trend: 0
      },
      volume: {
        current: 0,
        previous: 0,
        trend: 0
      },
      categories: {} as Record<string, { current: number; previous: number; trend: number }>,
      timeComparison: {} as Record<string, { count: number; sentiment: number }>
    };

    // Calculate time-based metrics
    feedback.forEach((item) => {
      const date = item.createdAt.toISOString().split('T')[0];
      if (!metrics.timeComparison[date]) {
        metrics.timeComparison[date] = {
          count: 0,
          sentiment: 0
        };
      }
      metrics.timeComparison[date].count++;
      if (item.sentimentScore) {
        metrics.timeComparison[date].sentiment += Number(item.sentimentScore);
      }
    });

    // Calculate overall metrics
    const totalSentiment = feedback.reduce((sum, item) => {
      return sum + (item.sentimentScore ? Number(item.sentimentScore) : 0);
    }, 0);

    const averageSentiment = feedback.length > 0 ? totalSentiment / feedback.length : 0;

    // Split feedback into current and previous periods
    const midPoint = Math.floor(feedback.length / 2);
    const previousFeedback = feedback.slice(0, midPoint);
    const currentFeedback = feedback.slice(midPoint);

    // Calculate current period metrics
    const currentSentiment = currentFeedback.reduce((sum, item) => {
      return sum + (item.sentimentScore ? Number(item.sentimentScore) : 0);
    }, 0);
    metrics.sentiment.current = currentFeedback.length > 0 ? currentSentiment / currentFeedback.length : 0;
    metrics.volume.current = currentFeedback.length;

    // Calculate previous period metrics
    const previousSentiment = previousFeedback.reduce((sum, item) => {
      return sum + (item.sentimentScore ? Number(item.sentimentScore) : 0);
    }, 0);
    metrics.sentiment.previous = previousFeedback.length > 0 ? previousSentiment / previousFeedback.length : 0;
    metrics.volume.previous = previousFeedback.length;

    // Calculate trends
    metrics.sentiment.trend = metrics.sentiment.previous !== 0
      ? ((metrics.sentiment.current - metrics.sentiment.previous) / metrics.sentiment.previous) * 100
      : 0;
    metrics.volume.trend = metrics.volume.previous !== 0
      ? ((metrics.volume.current - metrics.volume.previous) / metrics.volume.previous) * 100
      : 0;

    // Calculate category trends
    const categoryMetrics = {
      current: {} as Record<string, number>,
      previous: {} as Record<string, number>
    };

    currentFeedback.forEach((item) => {
      if (item.categories) {
        const categories = item.categories as Record<string, number>;
        Object.entries(categories).forEach(([category, value]) => {
          categoryMetrics.current[category] = (categoryMetrics.current[category] || 0) + value;
        });
      }
    });

    previousFeedback.forEach((item) => {
      if (item.categories) {
        const categories = item.categories as Record<string, number>;
        Object.entries(categories).forEach(([category, value]) => {
          categoryMetrics.previous[category] = (categoryMetrics.previous[category] || 0) + value;
        });
      }
    });

    // Calculate category trends
    Object.keys({ ...categoryMetrics.current, ...categoryMetrics.previous }).forEach((category) => {
      const current = categoryMetrics.current[category] || 0;
      const previous = categoryMetrics.previous[category] || 0;
      metrics.categories[category] = {
        current,
        previous,
        trend: previous !== 0 ? ((current - previous) / previous) * 100 : 0
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        totalFeedback: feedback.length,
        timeRange: {
          start: validatedParams.startDate || feedback[0]?.createdAt.toISOString(),
          end: validatedParams.endDate || feedback[feedback.length - 1]?.createdAt.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error comparing feedback:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 