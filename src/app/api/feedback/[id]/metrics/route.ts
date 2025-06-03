import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const metricsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional().default('day')
});

interface FeedbackTimeRange {
  start_date?: Date;
  end_date?: Date;
}

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
    const validatedParams = metricsSchema.parse({
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

    const timeRange: FeedbackTimeRange = {
      start_date: validatedParams.startDate ? new Date(validatedParams.startDate) : undefined,
      end_date: validatedParams.endDate ? new Date(validatedParams.endDate) : undefined
    };

    const where = {
      agentId: params.id,
      ...(timeRange.start_date && {
        createdAt: {
          gte: timeRange.start_date
        }
      }),
      ...(timeRange.end_date && {
        createdAt: {
          lte: timeRange.end_date
        }
      })
    };

    const feedback = await prisma.agentFeedback.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });

    const metrics = {
      totalFeedback: feedback.length,
      averageRating: 0,
      sentimentDistribution: {
        positive: 0,
        neutral: 0,
        negative: 0
      },
      categoryDistribution: {} as Record<string, number>,
      timeDistribution: {} as Record<string, { count: number; sentiment: number }>,
      trends: {
        rating: 0,
        sentiment: 0,
        volume: 0
      }
    };

    if (feedback.length > 0) {
      // Calculate average rating
      metrics.averageRating = feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length;

      // Calculate sentiment distribution
      feedback.forEach((item) => {
        if (item.sentimentScore) {
          const score = Number(item.sentimentScore);
          if (score > 0.5) {
            metrics.sentimentDistribution.positive++;
          } else if (score < -0.5) {
            metrics.sentimentDistribution.negative++;
          } else {
            metrics.sentimentDistribution.neutral++;
          }
        }
      });

      // Calculate category distribution
      feedback.forEach((item) => {
        if (item.categories) {
          const categories = item.categories as Record<string, number>;
          Object.entries(categories).forEach(([category, value]) => {
            metrics.categoryDistribution[category] = (metrics.categoryDistribution[category] || 0) + value;
          });
        }
      });

      // Calculate time distribution
      feedback.forEach((item) => {
        const date = item.createdAt.toISOString().split('T')[0];
        if (!metrics.timeDistribution[date]) {
          metrics.timeDistribution[date] = {
            count: 0,
            sentiment: 0
          };
        }
        metrics.timeDistribution[date].count++;
        if (item.sentimentScore) {
          metrics.timeDistribution[date].sentiment += Number(item.sentimentScore);
        }
      });

      // Calculate trends
      const midPoint = Math.floor(feedback.length / 2);
      const previousFeedback = feedback.slice(0, midPoint);
      const currentFeedback = feedback.slice(midPoint);

      // Rating trend
      const previousRating = previousFeedback.reduce((sum, item) => sum + item.rating, 0) / previousFeedback.length;
      const currentRating = currentFeedback.reduce((sum, item) => sum + item.rating, 0) / currentFeedback.length;
      metrics.trends.rating = previousRating !== 0 ? ((currentRating - previousRating) / previousRating) * 100 : 0;

      // Sentiment trend
      const previousSentiment = previousFeedback.reduce((sum, item) => sum + (item.sentimentScore ? Number(item.sentimentScore) : 0), 0) / previousFeedback.length;
      const currentSentiment = currentFeedback.reduce((sum, item) => sum + (item.sentimentScore ? Number(item.sentimentScore) : 0), 0) / currentFeedback.length;
      metrics.trends.sentiment = previousSentiment !== 0 ? ((currentSentiment - previousSentiment) / previousSentiment) * 100 : 0;

      // Volume trend
      metrics.trends.volume = previousFeedback.length !== 0 ? ((currentFeedback.length - previousFeedback.length) / previousFeedback.length) * 100 : 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        timeRange: {
          start: timeRange.start_date?.toISOString() || feedback[0]?.createdAt.toISOString(),
          end: timeRange.end_date?.toISOString() || feedback[feedback.length - 1]?.createdAt.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
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