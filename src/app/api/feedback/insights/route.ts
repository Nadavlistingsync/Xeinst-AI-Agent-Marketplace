import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { Prisma } from '@prisma/client';

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

function calculateSentiment(feedbacks: Array<{ sentimentScore: number | null }>) {
  const sentimentCounts = {
    positive: 0,
    neutral: 0,
    negative: 0
  };

  feedbacks.forEach(feedback => {
    const score = feedback.sentimentScore ? Number(feedback.sentimentScore) : 0;
    if (score > 0.5) sentimentCounts.positive++;
    else if (score < -0.5) sentimentCounts.negative++;
    else sentimentCounts.neutral++;
  });

  const total = feedbacks.length;
  return {
    positive: total ? sentimentCounts.positive / total : 0,
    neutral: total ? sentimentCounts.neutral / total : 0,
    negative: total ? sentimentCounts.negative / total : 0
  };
}

function extractCategories(feedbacks: Array<{ categories: Prisma.JsonValue }>) {
  const categoryCounts: Record<string, number> = {};
  let totalFeedbacks = 0;

  feedbacks.forEach(feedback => {
    if (feedback.categories && typeof feedback.categories === 'object') {
      const categories = feedback.categories as Record<string, number>;
      Object.entries(categories).forEach(([category, value]) => {
        categoryCounts[category] = (categoryCounts[category] || 0) + value;
      });
      totalFeedbacks++;
    }
  });

  const distribution: Record<string, number> = {};
  Object.entries(categoryCounts).forEach(([category, count]) => {
    distribution[category] = totalFeedbacks ? count / totalFeedbacks : 0;
  });

  return distribution;
}

function calculateAverageRating(feedbacks: Array<{ rating: number }>) {
  if (feedbacks.length === 0) return 0;
  const sum = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
  return sum / feedbacks.length;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Prisma.AgentFeedbackWhereInput = {
      ...(agentId && { agentId }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const feedbacks = await prisma.agentFeedback.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });

    // Group feedbacks by date
    const groupedFeedbacks = feedbacks.reduce((acc, feedback) => {
      const date = feedback.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(feedback);
      return acc;
    }, {} as Record<string, typeof feedbacks>);

    // Calculate time series data
    const timeSeriesData = Object.entries(groupedFeedbacks).map(([date, groupFeedbacks]) => ({
      date,
      averageRating: calculateAverageRating(groupFeedbacks),
      sentiment: calculateSentiment(groupFeedbacks).positive - calculateSentiment(groupFeedbacks).negative,
      categories: extractCategories(groupFeedbacks)
    }));

    const insights: FeedbackInsights = {
      totalFeedbacks: feedbacks.length,
      averageRating: calculateAverageRating(feedbacks),
      sentimentDistribution: calculateSentiment(feedbacks),
      categoryDistribution: extractCategories(feedbacks),
      timeSeriesData
    };

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error fetching feedback insights:', error);
    const errorResponse = error instanceof ApiError ? error : new ApiError('Failed to fetch feedback insights');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.statusCode }
    );
  }
} 