import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { Prisma } from '@prisma/client';

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
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        framework: true,
        version: true,
        rating: true,
        totalRatings: true,
        requirements: true,
        createdBy: true,
        deployedBy: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.createdBy !== session.user.id && !agent.isPublic) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const feedbacks = await prisma.agentFeedback.findMany({
      where: { agentId: params.id },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate sentiment distribution
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

    const totalFeedbacks = feedbacks.length;
    const sentimentDistribution = {
      positive: totalFeedbacks ? sentimentCounts.positive / totalFeedbacks : 0,
      neutral: totalFeedbacks ? sentimentCounts.neutral / totalFeedbacks : 0,
      negative: totalFeedbacks ? sentimentCounts.negative / totalFeedbacks : 0
    };

    // Calculate category distribution
    const categoryCounts: Record<string, number> = {};
    feedbacks.forEach(feedback => {
      if (feedback.categories && typeof feedback.categories === 'object') {
        const categories = feedback.categories as Record<string, number>;
        Object.entries(categories).forEach(([category, value]) => {
          categoryCounts[category] = (categoryCounts[category] || 0) + value;
        });
      }
    });

    const categoryDistribution: Record<string, number> = {};
    Object.entries(categoryCounts).forEach(([category, count]) => {
      categoryDistribution[category] = totalFeedbacks ? count / totalFeedbacks : 0;
    });

    // Calculate recent activity metrics
    const respondedFeedbacks = feedbacks.filter(f => f.creatorResponse);
    const responseRate = totalFeedbacks ? respondedFeedbacks.length / totalFeedbacks : 0;

    let totalResponseTime = 0;
    let responseCount = 0;
    respondedFeedbacks.forEach(feedback => {
      if (feedback.responseDate) {
        const responseTime = feedback.responseDate.getTime() - feedback.createdAt.getTime();
        totalResponseTime += responseTime;
        responseCount++;
      }
    });

    const averageResponseTime = responseCount ? totalResponseTime / responseCount : 0;

    const summary: FeedbackSummary = {
      totalFeedbacks,
      averageRating: agent.rating,
      sentimentDistribution,
      categoryDistribution,
      recentActivity: {
        lastFeedback: feedbacks[0]?.createdAt.toISOString() || '',
        responseRate,
        averageResponseTime
      }
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching feedback summary:', error);
    const errorResponse = error instanceof ApiError ? error : new ApiError('Failed to fetch feedback summary');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.statusCode }
    );
  }
} 