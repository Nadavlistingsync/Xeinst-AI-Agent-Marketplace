import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createErrorResponse } from '@/lib/api';
import { 
  type FeedbackTrendsApiResponse,
  feedbackTrendsSchema,
  type FeedbackTrendsInput,
  type FeedbackTrend
} from '@/types/feedback-analytics';
import { Prisma } from '@prisma/client';

export async function GET(request: Request): Promise<NextResponse<FeedbackTrendsApiResponse>> {
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
      metrics: searchParams.get('metrics')?.split(',') || ['rating'],
      groupBy: searchParams.get('groupBy') || 'day',
    };

    const validatedQuery = feedbackTrendsSchema.parse(query);

    const where: Prisma.FeedbackWhereInput = {
      createdAt: {
        gte: validatedQuery.startDate,
        lte: validatedQuery.endDate,
      },
    };

    const feedbacks = await prisma.feedback.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        metadata: true,
      },
    });

    const trends = generateTrends(feedbacks, validatedQuery.metrics, validatedQuery.groupBy);
    const summary = calculateMetricsSummary(feedbacks, validatedQuery.metrics);

    return NextResponse.json({
      success: true,
      data: {
        trends,
        summary,
      },
    });
  } catch (error) {
    console.error('Error fetching feedback trends:', error);
    return NextResponse.json(
      createErrorResponse(error, 'Failed to fetch feedback trends'),
      { status: 500 }
    );
  }
}

function generateTrends(
  feedbacks: Array<{
    rating: number;
    comment: string;
    createdAt: Date;
    metadata: Record<string, unknown>;
  }>,
  metrics: string[],
  groupBy: 'day' | 'week' | 'month'
): FeedbackTrend[] {
  const groupedFeedbacks = groupFeedbacksByDate(feedbacks, groupBy);
  
  return Object.entries(groupedFeedbacks).map(([date, groupFeedbacks]) => {
    const metricsData: Record<string, number> = {};
    
    metrics.forEach(metric => {
      metricsData[metric] = calculateMetric(groupFeedbacks, metric);
    });
    
    return {
      date: new Date(date),
      metrics: metricsData,
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

function calculateMetric(
  feedbacks: Array<{
    rating: number;
    comment: string;
    metadata: Record<string, unknown>;
  }>,
  metric: string
): number {
  switch (metric) {
    case 'rating':
      return calculateAverageRating(feedbacks);
    case 'sentiment':
      return calculateSentimentScore(feedbacks);
    case 'response_time':
      return calculateAverageResponseTime(feedbacks);
    case 'volume':
      return feedbacks.length;
    case 'satisfaction':
      return calculateSatisfactionScore(feedbacks);
    default:
      return 0;
  }
}

function calculateAverageRating(feedbacks: Array<{ rating: number }>) {
  if (!feedbacks.length) return 0;
  const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
  return sum / feedbacks.length;
}

function calculateSentimentScore(feedbacks: Array<{ rating: number }>) {
  if (!feedbacks.length) return 0;
  const positive = feedbacks.filter(f => f.rating >= 4).length;
  return positive / feedbacks.length;
}

function calculateAverageResponseTime(feedbacks: Array<{ metadata: Record<string, unknown> }>) {
  const responseTimes = feedbacks
    .map(f => f.metadata.responseTime as number)
    .filter(t => typeof t === 'number');
  
  if (!responseTimes.length) return 0;
  const sum = responseTimes.reduce((acc, t) => acc + t, 0);
  return sum / responseTimes.length;
}

function calculateSatisfactionScore(feedbacks: Array<{ rating: number }>) {
  if (!feedbacks.length) return 0;
  const satisfied = feedbacks.filter(f => f.rating >= 4).length;
  return satisfied / feedbacks.length;
}

function calculateMetricsSummary(
  feedbacks: Array<{
    rating: number;
    comment: string;
    metadata: Record<string, unknown>;
  }>,
  metrics: string[]
): Record<string, { average: number; min: number; max: number; change: number }> {
  const summary: Record<string, { average: number; min: number; max: number; change: number }> = {};
  
  metrics.forEach(metric => {
    const values = feedbacks.map(f => calculateMetric([f], metric));
    const sortedValues = values.sort((a, b) => a - b);
    
    summary[metric] = {
      average: values.reduce((acc, v) => acc + v, 0) / values.length,
      min: sortedValues[0],
      max: sortedValues[sortedValues.length - 1],
      change: calculateChange(values),
    };
  });
  
  return summary;
}

function calculateChange(values: number[]): number {
  if (values.length < 2) return 0;
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((acc, v) => acc + v, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((acc, v) => acc + v, 0) / secondHalf.length;
  
  return firstAvg ? (secondAvg - firstAvg) / firstAvg : 0;
} 