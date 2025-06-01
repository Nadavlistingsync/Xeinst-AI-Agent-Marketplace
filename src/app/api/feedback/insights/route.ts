import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createErrorResponse } from '@/lib/api';
import { 
  type FeedbackInsightsApiResponse,
  feedbackInsightsSchema,
  type FeedbackInsightsInput,
  type FeedbackInsight
} from '@/types/feedback-analytics';
import { Prisma } from '@prisma/client';

export async function GET(request: Request): Promise<NextResponse<FeedbackInsightsApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = {
      startDate: new Date(searchParams.get('startDate') || ''),
      endDate: new Date(searchParams.get('endDate') || ''),
      groupBy: searchParams.get('groupBy') || 'day',
      filters: {
        agentId: searchParams.get('agentId'),
        userId: searchParams.get('userId'),
        type: searchParams.get('type'),
      },
    };

    const validatedQuery = feedbackInsightsSchema.parse(query);

    const where: Prisma.FeedbackWhereInput = {
      createdAt: {
        gte: validatedQuery.startDate,
        lte: validatedQuery.endDate,
      },
      ...(validatedQuery.filters?.agentId && { agentId: validatedQuery.filters.agentId }),
      ...(validatedQuery.filters?.userId && { userId: validatedQuery.filters.userId }),
      ...(validatedQuery.filters?.type && { type: validatedQuery.filters.type }),
    };

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          metadata: true,
        },
      }),
      prisma.feedback.count({ where }),
    ]);

    const insights = generateInsights(feedbacks, validatedQuery.groupBy);
    const summary = calculateSummary(feedbacks);

    return NextResponse.json({
      success: true,
      data: {
        insights,
        summary,
      },
    });
  } catch (error) {
    console.error('Error fetching feedback insights:', error);
    return NextResponse.json(
      createErrorResponse(error, 'Failed to fetch feedback insights'),
      { status: 500 }
    );
  }
}

function generateInsights(
  feedbacks: Array<{
    rating: number;
    comment: string;
    createdAt: Date;
    metadata: Record<string, unknown>;
  }>,
  groupBy: 'day' | 'week' | 'month'
): FeedbackInsight[] {
  const groupedFeedbacks = groupFeedbacksByDate(feedbacks, groupBy);
  
  return Object.entries(groupedFeedbacks).map(([date, groupFeedbacks]) => {
    const sentiment = calculateSentiment(groupFeedbacks);
    const categories = extractCategories(groupFeedbacks);
    
    return {
      date: new Date(date),
      count: groupFeedbacks.length,
      averageRating: calculateAverageRating(groupFeedbacks),
      sentiment,
      categories,
    };
  });
}

function groupFeedbacksByDate(
  feedbacks: Array<{ createdAt: Date }>,
  groupBy: 'day' | 'week' | 'month'
): Record<string, typeof feedbacks> {
  return feedbacks.reduce((groups, feedback) => {
    const date = new Date(feedback.createdAt);
    let key: string;
    
    switch (groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(feedback);
    return groups;
  }, {} as Record<string, typeof feedbacks>);
}

function calculateSentiment(feedbacks: Array<{ rating: number }>) {
  const total = feedbacks.length;
  const positive = feedbacks.filter(f => f.rating >= 4).length;
  const negative = feedbacks.filter(f => f.rating <= 2).length;
  const neutral = total - positive - negative;

  return {
    positive: total ? positive / total : 0,
    neutral: total ? neutral / total : 0,
    negative: total ? negative / total : 0,
  };
}

function extractCategories(feedbacks: Array<{ metadata: Record<string, unknown> }>) {
  const categories = new Map<string, number>();
  
  feedbacks.forEach(feedback => {
    const category = feedback.metadata.category as string;
    if (category) {
      categories.set(category, (categories.get(category) || 0) + 1);
    }
  });

  const total = feedbacks.length;
  return Array.from(categories.entries())
    .map(([name, count]) => ({
      name,
      count,
      percentage: total ? count / total : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateAverageRating(feedbacks: Array<{ rating: number }>) {
  if (!feedbacks.length) return 0;
  const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
  return sum / feedbacks.length;
}

function calculateSummary(feedbacks: Array<{ rating: number }>) {
  const total = feedbacks.length;
  const averageRating = calculateAverageRating(feedbacks);
  const sentiment = calculateSentiment(feedbacks);

  return {
    total,
    averageRating,
    sentiment,
  };
} 