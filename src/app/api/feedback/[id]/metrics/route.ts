import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { type FeedbackMetrics } from '@/types/feedback';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<{ success: boolean; data?: FeedbackMetrics; error?: string }>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      select: {
        createdBy: true,
        accessLevel: true
      }
    });

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.createdBy !== session.user.id && agent.accessLevel !== 'public') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const feedback = await prisma.agentFeedback.findMany({
      where: {
        deploymentId: params.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalFeedback = feedback.length;
    const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
    const averageRating = totalFeedback > 0 ? totalRating / totalFeedback : 0;

    const sentimentDistribution = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };

    const categoryDistribution: Record<string, number> = {};
    let totalSentiment = 0;
    let totalResponses = 0;
    let totalResponseTime = 0;

    feedback.forEach((f) => {
      // Calculate sentiment distribution
      if (f.sentimentScore) {
        const score = Number(f.sentimentScore);
        totalSentiment += score;
        if (score > 0.5) {
          sentimentDistribution.positive++;
        } else if (score < -0.5) {
          sentimentDistribution.negative++;
        } else {
          sentimentDistribution.neutral++;
        }
      }

      // Calculate categories
      if (f.categories) {
        const feedbackCategories = f.categories as Record<string, number>;
        Object.entries(feedbackCategories).forEach(([category, value]) => {
          categoryDistribution[category] = (categoryDistribution[category] || 0) + value;
        });
      }

      // Track responses
      if (f.creatorResponse) {
        totalResponses++;
        if (f.responseDate) {
          const responseTime = f.responseDate.getTime() - f.createdAt.getTime();
          totalResponseTime += responseTime;
        }
      }
    });

    const averageSentiment = totalFeedback > 0 ? totalSentiment / totalFeedback : 0;
    const responseRate = totalFeedback > 0 ? (totalResponses / totalFeedback) * 100 : 0;

    // Calculate trends (simplified for now)
    const trends = {
      rating: averageRating,
      sentiment: averageSentiment,
      volume: totalFeedback
    };

    // Calculate days since first feedback
    const firstFeedback = feedback[feedback.length - 1];
    const days = firstFeedback ? Math.ceil((Date.now() - firstFeedback.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    const metrics: FeedbackMetrics = {
      averageRating,
      totalFeedback,
      sentimentDistribution,
      categoryDistribution,
      responseRate,
      averageSentiment,
      trends,
      days
    };

    return NextResponse.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching feedback metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 