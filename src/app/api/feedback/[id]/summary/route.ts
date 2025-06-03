import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { type FeedbackSummaryApiResponse } from '@/types/feedback-analytics';

interface FeedbackSummary {
  totalFeedbacks: number;
  averageRating: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  categoryDistribution: Record<string, number>;
  recentActivity: {
    lastFeedback: string;
    responseRate: number;
    averageResponseTime: number;
  };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<FeedbackSummaryApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
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
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.createdBy !== session.user.id && !agent.isPublic) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const feedbacks = await prisma.agentFeedback.findMany({
      where: { deploymentId: params.id },
      orderBy: { createdAt: 'desc' }
    });

    const summary: FeedbackSummary = {
      totalFeedbacks: feedbacks.length,
      averageRating: 0,
      sentimentDistribution: {
        positive: 0,
        neutral: 0,
        negative: 0
      },
      categoryDistribution: {},
      recentActivity: {
        lastFeedback: '',
        responseRate: 0,
        averageResponseTime: 0
      }
    };

    if (feedbacks.length > 0) {
      // Calculate average rating
      summary.averageRating = feedbacks.reduce((sum, item) => sum + item.rating, 0) / feedbacks.length;

      // Calculate sentiment distribution
      feedbacks.forEach((item) => {
        if (item.sentimentScore) {
          const score = Number(item.sentimentScore);
          if (score > 0.5) {
            summary.sentimentDistribution.positive++;
          } else if (score < -0.5) {
            summary.sentimentDistribution.negative++;
          } else {
            summary.sentimentDistribution.neutral++;
          }
        }
      });

      // Calculate category distribution
      feedbacks.forEach((item) => {
        if (item.categories) {
          const categories = item.categories as Record<string, number>;
          Object.entries(categories).forEach(([category, value]) => {
            summary.categoryDistribution[category] = (summary.categoryDistribution[category] || 0) + value;
          });
        }
      });

      // Calculate recent activity
      const respondedFeedbacks = feedbacks.filter(f => f.creatorResponse);
      summary.recentActivity.lastFeedback = feedbacks[0].createdAt.toISOString();
      summary.recentActivity.responseRate = (respondedFeedbacks.length / feedbacks.length) * 100;

      if (respondedFeedbacks.length > 0) {
        const totalResponseTime = respondedFeedbacks.reduce((sum, item) => {
          if (item.responseDate) {
            return sum + (new Date(item.responseDate).getTime() - new Date(item.createdAt).getTime());
          }
          return sum;
        }, 0);
        summary.recentActivity.averageResponseTime = totalResponseTime / respondedFeedbacks.length / (1000 * 60 * 60); // Convert to hours
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total: summary.totalFeedbacks,
          averageRating: summary.averageRating,
          sentiment: summary.sentimentDistribution,
          categories: summary.categoryDistribution,
          recentActivity: {
            lastFeedbackDate: summary.recentActivity.lastFeedback,
            responseRate: summary.recentActivity.responseRate,
            averageResponseTime: summary.recentActivity.averageResponseTime
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching feedback summary:', error);
    const errorResponse = error instanceof ApiError ? error : new ApiError('Failed to fetch feedback summary');
    return NextResponse.json(
      { success: false, error: errorResponse.message },
      { status: errorResponse.statusCode }
    );
  }
} 