import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { type FeedbackAnalyticsResponse, type FeedbackAnalytics } from '@/types/feedback-analytics';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<FeedbackAnalyticsResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ApiError('Unauthorized', 401);
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      select: {
        createdBy: true,
        accessLevel: true
      }
    });

    if (!agent) {
      throw new ApiError('Agent not found', 404);
    }

    if (agent.createdBy !== session.user.id && agent.accessLevel !== 'public') {
      throw new ApiError('Unauthorized', 403);
    }

    const searchParams = new URL(request.url).searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const groupBy = searchParams.get('groupBy') || 'day';

    const feedback = await prisma.agentFeedback.findMany({
      where: {
        deploymentId: params.id,
        ...(startDate && endDate
          ? {
              createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            }
          : {})
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      }
    });

    // Group feedback by date
    const groupedFeedback = feedback.reduce((acc, item) => {
      const date = new Date(item.createdAt);
      let key: string;

      switch (groupBy) {
        case 'hour':
          key = date.toISOString().slice(0, 13);
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().slice(0, 10);
          break;
        case 'month':
          key = date.toISOString().slice(0, 7);
          break;
        default:
          key = date.toISOString().slice(0, 10);
      }

      if (!acc[key]) {
        acc[key] = {
          count: 0,
          totalRating: 0,
          sentimentScores: []
        };
      }

      acc[key].count++;
      acc[key].totalRating += item.rating;
      if (item.sentimentScore) {
        acc[key].sentimentScores.push(Number(item.sentimentScore));
      }

      return acc;
    }, {} as Record<string, { count: number; totalRating: number; sentimentScores: number[] }>);

    // Calculate metrics
    const totalFeedback = feedback.length;
    const averageRating = totalFeedback > 0
      ? feedback.reduce((sum, item) => sum + item.rating, 0) / totalFeedback
      : 0;

    // Calculate sentiment distribution
    const sentimentDistribution = feedback.reduce((acc, item) => {
      const score = item.sentimentScore || 0;
      if (score > 0.3) acc.positive = (acc.positive || 0) + 1;
      else if (score < -0.3) acc.negative = (acc.negative || 0) + 1;
      else acc.neutral = (acc.neutral || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate category distribution
    const categoryDistribution = feedback.reduce((acc, item) => {
      if (item.categories) {
        Object.entries(item.categories as Record<string, number>).forEach(([category, value]) => {
          acc[category] = (acc[category] || 0) + value;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    // Format trends
    const ratingTrend = Object.entries(groupedFeedback).map(([date, data]) => ({
      date,
      rating: data.totalRating / data.count
    }));

    const sentimentTrend = Object.entries(groupedFeedback).map(([date, data]) => ({
      date,
      sentiment: data.sentimentScores.length
        ? data.sentimentScores.reduce((a, b) => a + b, 0) / data.sentimentScores.length
        : 0
    }));

    // Calculate categories
    const categories = Object.entries(categoryDistribution).map(([name, count]) => ({
      name,
      count,
      percentage: (count / totalFeedback) * 100,
      examples: feedback
        .filter(item => item.categories && (item.categories as Record<string, number>)[name])
        .map(item => item.comment || '')
        .filter(Boolean)
        .slice(0, 3)
    }));

    const analytics: FeedbackAnalytics = {
      metrics: {
        totalFeedback,
        averageRating,
        sentimentDistribution,
        categoryDistribution
      },
      trends: {
        ratingTrend,
        sentimentTrend
      },
      categories
    };

    return NextResponse.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    const errorResponse = error instanceof ApiError ? error : new ApiError('Internal server error');
    return NextResponse.json(
      { 
        success: false, 
        error: errorResponse.message,
        data: {
          metrics: {
            totalFeedback: 0,
            averageRating: 0,
            sentimentDistribution: {},
            categoryDistribution: {}
          },
          trends: {
            ratingTrend: [],
            sentimentTrend: []
          },
          categories: []
        }
      },
      { status: errorResponse.statusCode }
    );
  }
} 