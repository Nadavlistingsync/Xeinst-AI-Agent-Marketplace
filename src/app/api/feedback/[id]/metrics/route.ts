import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { type FeedbackMetrics } from '@/types/feedback';

export async function GET(
  request: Request,
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

    const totalFeedbacks = feedback.length;
    const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
    const averageRating = totalFeedbacks > 0 ? totalRating / totalFeedbacks : 0;

    const sentimentDistribution = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };

    const categories: Record<string, number> = {};
    const commonIssues: string[] = [];
    const improvementSuggestions: string[] = [];

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
          categories[category] = (categories[category] || 0) + value;
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

      // Track issues and suggestions
      if (f.rating <= 2 && f.comment) {
        commonIssues.push(f.comment);
      }
      if (f.rating >= 4 && f.comment) {
        improvementSuggestions.push(f.comment);
      }
    });

    const sentimentScore = totalFeedbacks > 0 ? totalSentiment / totalFeedbacks : 0;
    const averageResponseTime = totalResponses > 0 ? totalResponseTime / totalResponses : 0;
    const responseRate = totalFeedbacks > 0 ? (totalResponses / totalFeedbacks) * 100 : 0;

    const metrics: FeedbackMetrics = {
      averageRating,
      totalFeedbacks,
      positiveFeedbacks: sentimentDistribution.positive,
      negativeFeedbacks: sentimentDistribution.negative,
      neutralFeedbacks: sentimentDistribution.neutral,
      sentimentScore,
      commonIssues: commonIssues.slice(0, 5),
      improvementSuggestions: improvementSuggestions.slice(0, 5),
      categories,
      responseMetrics: {
        totalResponses,
        averageResponseTime,
        responseRate,
      },
    };

    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error fetching feedback metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 