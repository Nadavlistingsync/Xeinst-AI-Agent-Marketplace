import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { Prisma } from '@prisma/client';

interface FeedbackAnalytics {
  overview: {
    totalFeedbacks: number;
    averageRating: number;
    responseRate: number;
    averageResponseTime: number;
  };
  sentiment: {
    distribution: {
      positive: number;
      neutral: number;
      negative: number;
    };
    trend: Array<{
      date: string;
      positive: number;
      neutral: number;
      negative: number;
    }>;
  };
  categories: {
    distribution: Record<string, number>;
    trend: Array<{
      date: string;
      categories: Record<string, number>;
    }>;
  };
  ratings: {
    distribution: Record<number, number>;
    trend: Array<{
      date: string;
      average: number;
      count: number;
    }>;
  };
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

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        createdBy: true,
        isPublic: true
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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const groupBy = searchParams.get('groupBy') || 'day';

    const where: Prisma.AgentFeedbackWhereInput = {
      agentId: params.id,
      ...(startDate && {
        createdAt: {
          gte: new Date(startDate)
        }
      }),
      ...(endDate && {
        createdAt: {
          lte: new Date(endDate)
        }
      })
    };

    const feedbacks = await prisma.agentFeedback.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });

    // Calculate overview metrics
    const totalFeedbacks = feedbacks.length;
    const averageRating = totalFeedbacks
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks
      : 0;

    const respondedFeedbacks = feedbacks.filter(f => f.creatorResponse);
    const responseRate = totalFeedbacks ? respondedFeedbacks.length / totalFeedbacks : 0;

    let totalResponseTime = 0;
    let responseCount = 0;
    respondedFeedbacks.forEach(feedback => {
      if (feedback.responseDate) {
        const responseTime = feedback.responseDate.getTime() - feedback.createdAt.getTime();
        totalResponseTime += responseTime;
        responseCount++;
      }
    });
    const averageResponseTime = responseCount ? totalResponseTime / responseCount : 0;

    // Calculate sentiment distribution and trend
    const sentimentCounts = {
      positive: 0,
      neutral: 0,
      negative: 0
    };

    const sentimentTrend: Record<string, { positive: number; neutral: number; negative: number }> = {};
    feedbacks.forEach(feedback => {
      const score = feedback.sentimentScore ? Number(feedback.sentimentScore) : 0;
      const date = feedback.createdAt.toISOString().split('T')[0];

      if (score > 0.5) {
        sentimentCounts.positive++;
        sentimentTrend[date] = {
          ...sentimentTrend[date],
          positive: (sentimentTrend[date]?.positive || 0) + 1
        };
      } else if (score < -0.5) {
        sentimentCounts.negative++;
        sentimentTrend[date] = {
          ...sentimentTrend[date],
          negative: (sentimentTrend[date]?.negative || 0) + 1
        };
      } else {
        sentimentCounts.neutral++;
        sentimentTrend[date] = {
          ...sentimentTrend[date],
          neutral: (sentimentTrend[date]?.neutral || 0) + 1
        };
      }
    });

    const sentimentDistribution = {
      positive: totalFeedbacks ? sentimentCounts.positive / totalFeedbacks : 0,
      neutral: totalFeedbacks ? sentimentCounts.neutral / totalFeedbacks : 0,
      negative: totalFeedbacks ? sentimentCounts.negative / totalFeedbacks : 0
    };

    // Calculate category distribution and trend
    const categoryCounts: Record<string, number> = {};
    const categoryTrend: Record<string, Record<string, number>> = {};

    feedbacks.forEach(feedback => {
      if (feedback.categories && typeof feedback.categories === 'object') {
        const categories = feedback.categories as Record<string, number>;
        const date = feedback.createdAt.toISOString().split('T')[0];

        Object.entries(categories).forEach(([category, value]) => {
          categoryCounts[category] = (categoryCounts[category] || 0) + value;
          categoryTrend[date] = {
            ...categoryTrend[date],
            [category]: (categoryTrend[date]?.[category] || 0) + value
          };
        });
      }
    });

    const categoryDistribution: Record<string, number> = {};
    Object.entries(categoryCounts).forEach(([category, count]) => {
      categoryDistribution[category] = totalFeedbacks ? count / totalFeedbacks : 0;
    });

    // Calculate rating distribution and trend
    const ratingCounts: Record<number, number> = {};
    const ratingTrend: Record<string, { sum: number; count: number }> = {};

    feedbacks.forEach(feedback => {
      const date = feedback.createdAt.toISOString().split('T')[0];
      ratingCounts[feedback.rating] = (ratingCounts[feedback.rating] || 0) + 1;
      ratingTrend[date] = {
        sum: (ratingTrend[date]?.sum || 0) + feedback.rating,
        count: (ratingTrend[date]?.count || 0) + 1
      };
    });

    const ratingDistribution: Record<number, number> = {};
    Object.entries(ratingCounts).forEach(([rating, count]) => {
      ratingDistribution[Number(rating)] = totalFeedbacks ? count / totalFeedbacks : 0;
    });

    const analytics: FeedbackAnalytics = {
      overview: {
        totalFeedbacks,
        averageRating,
        responseRate,
        averageResponseTime
      },
      sentiment: {
        distribution: sentimentDistribution,
        trend: Object.entries(sentimentTrend).map(([date, counts]) => ({
          date,
          ...counts
        }))
      },
      categories: {
        distribution: categoryDistribution,
        trend: Object.entries(categoryTrend).map(([date, categories]) => ({
          date,
          categories
        }))
      },
      ratings: {
        distribution: ratingDistribution,
        trend: Object.entries(ratingTrend).map(([date, { sum, count }]) => ({
          date,
          average: count ? sum / count : 0,
          count
        }))
      }
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching feedback analytics:', error);
    const errorResponse = error instanceof ApiError ? error : new ApiError('Failed to fetch feedback analytics');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.statusCode }
    );
  }
} 