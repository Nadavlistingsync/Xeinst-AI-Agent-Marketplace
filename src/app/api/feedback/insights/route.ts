import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { Prisma } from '@prisma/client';
import { type FeedbackInsightsApiResponse } from '@/types/feedback-analytics';

interface FeedbackInsights {
  totalFeedbacks: number;
  averageRating: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  categoryDistribution: Record<string, number>;
  timeSeriesData: Array<{
    date: string;
    averageRating: number;
    sentiment: number;
    categories: Record<string, number>;
  }>;
}

export async function GET(request: Request): Promise<NextResponse<FeedbackInsightsApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const feedbacks = await prisma.agentFeedback.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const insights: FeedbackInsights = {
      totalFeedbacks: feedbacks.length,
      averageRating: 0,
      sentimentDistribution: {
        positive: 0,
        neutral: 0,
        negative: 0
      },
      categoryDistribution: {},
      timeSeriesData: []
    };

    if (feedbacks.length > 0) {
      // Calculate average rating
      insights.averageRating = feedbacks.reduce((sum, item) => sum + item.rating, 0) / feedbacks.length;

      // Calculate sentiment distribution
      feedbacks.forEach((item) => {
        if (item.sentimentScore) {
          const score = Number(item.sentimentScore);
          if (score > 0.5) {
            insights.sentimentDistribution.positive++;
          } else if (score < -0.5) {
            insights.sentimentDistribution.negative++;
          } else {
            insights.sentimentDistribution.neutral++;
          }
        }
      });

      // Calculate category distribution
      feedbacks.forEach((item) => {
        if (item.categories) {
          const categories = item.categories as Record<string, number>;
          Object.entries(categories).forEach(([category, value]) => {
            insights.categoryDistribution[category] = (insights.categoryDistribution[category] || 0) + value;
          });
        }
      });

      // Calculate time series data
      const timeSeriesMap = new Map<string, {
        totalRating: number;
        count: number;
        totalSentiment: number;
        categories: Record<string, number>;
      }>();

      feedbacks.forEach((item) => {
        const date = item.createdAt.toISOString().split('T')[0];
        const current = timeSeriesMap.get(date) || {
          totalRating: 0,
          count: 0,
          totalSentiment: 0,
          categories: {}
        };

        current.totalRating += item.rating;
        current.count++;
        if (item.sentimentScore) {
          current.totalSentiment += Number(item.sentimentScore);
        }
        if (item.categories) {
          const categories = item.categories as Record<string, number>;
          Object.entries(categories).forEach(([category, value]) => {
            current.categories[category] = (current.categories[category] || 0) + value;
          });
        }

        timeSeriesMap.set(date, current);
      });

      insights.timeSeriesData = Array.from(timeSeriesMap.entries()).map(([date, data]) => ({
        date,
        averageRating: data.totalRating / data.count,
        sentiment: data.totalSentiment / data.count,
        categories: data.categories
      }));
    }

    return NextResponse.json({
      success: true,
      data: {
        insights: [{
          date: new Date(),
          count: insights.totalFeedbacks,
          averageRating: insights.averageRating,
          sentiment: insights.sentimentDistribution,
          categories: Object.entries(insights.categoryDistribution).map(([name, count]) => ({
            name,
            count,
            percentage: (count / insights.totalFeedbacks) * 100
          }))
        }],
        summary: {
          total: insights.totalFeedbacks,
          averageRating: insights.averageRating,
          sentiment: insights.sentimentDistribution
        }
      }
    });
  } catch (error) {
    console.error('Error fetching feedback insights:', error);
    const errorResponse = error instanceof ApiError ? error : new ApiError('Failed to fetch feedback insights');
    return NextResponse.json(
      { success: false, error: errorResponse.message },
      { status: errorResponse.statusCode }
    );
  }
} 