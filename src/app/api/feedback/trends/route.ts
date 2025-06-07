import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { Prisma } from '@prisma/client';

interface FeedbackTrend {
  date: string;
  count: number;
  averageRating: number;
  sentiment: number;
  categories: Record<string, number>;
}

export const dynamic = 'force-dynamic';

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
    const groupBy = searchParams.get('groupBy') || 'day';

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
      const date = feedback.createdAt;
      let key: string;

      switch (groupBy) {
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default: // day
          key = date.toISOString().split('T')[0];
      }

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(feedback);
      return acc;
    }, {} as Record<string, typeof feedbacks>);

    // Calculate trends
    const trends: FeedbackTrend[] = Object.entries(groupedFeedbacks).map(([date, groupFeedbacks]) => {
      const sentimentScores = groupFeedbacks
        .map(f => f.sentimentScore ? Number(f.sentimentScore) : 0)
        .filter(score => !isNaN(score));
      
      const averageSentiment = sentimentScores.length > 0
        ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length
        : 0;

      const categories = groupFeedbacks.reduce((acc, feedback) => {
        if (feedback.categories && typeof feedback.categories === 'object') {
          const feedbackCategories = feedback.categories as Record<string, number>;
          Object.entries(feedbackCategories).forEach(([category, value]) => {
            acc[category] = (acc[category] || 0) + value;
          });
        }
        return acc;
      }, {} as Record<string, number>);

      return {
        date,
        count: groupFeedbacks.length,
        averageRating: groupFeedbacks.reduce((acc, f) => acc + f.rating, 0) / groupFeedbacks.length,
        sentiment: averageSentiment,
        categories
      };
    });

    return NextResponse.json({ trends });
  } catch (error) {
    console.error('Error fetching feedback trends:', error);
    const errorResponse = error instanceof ApiError ? error : new ApiError('Failed to fetch feedback trends');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.statusCode }
    );
  }
} 