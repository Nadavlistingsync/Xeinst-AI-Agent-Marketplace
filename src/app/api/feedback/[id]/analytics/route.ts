import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { type FeedbackAnalyticsApiResponse } from '@/types/feedback-analytics';

interface AnalyticsData {
  date: string;
  count: number;
  averageRating: number;
  averageSentiment: number | null;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<FeedbackAnalyticsApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ApiError('Unauthorized', 401);
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        createdBy: true,
        isPublic: true
      }
    });

    if (!agent) {
      throw new ApiError('Agent not found', 404);
    }

    if (agent.createdBy !== session.user.id && !agent.isPublic) {
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

    // Calculate averages and format response
    const analytics: AnalyticsData[] = Object.entries(groupedFeedback).map(([date, data]) => ({
      date,
      count: data.count,
      averageRating: data.totalRating / data.count,
      averageSentiment: data.sentimentScores.length
        ? data.sentimentScores.reduce((a, b) => a + b, 0) / data.sentimentScores.length
        : null
    }));

    return NextResponse.json({
      success: true,
      analytics
    });
  } catch (error) {
    const errorResponse = error instanceof ApiError ? error : new ApiError('Internal server error');
    return NextResponse.json(
      { success: false, error: errorResponse.message },
      { status: errorResponse.statusCode }
    );
  }
} 