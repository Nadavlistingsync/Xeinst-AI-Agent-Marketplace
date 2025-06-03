import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/error-handling';
import type { FeedbackInsightsResponse } from '@/types/feedback-analytics';
import type { AgentFeedback } from '@prisma/client';

interface FeedbackInsights {
  averageRating: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  ratingTrend: Array<{
    date: string;
    rating: number;
  }>;
  sentimentTrend: Array<{
    date: string;
    sentiment: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    averageRating: number;
  }>;
}

export async function GET(): Promise<NextResponse<FeedbackInsightsResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', message: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    const feedback = await prisma.agentFeedback.findMany({
      where: {
        deployment: {
          createdBy: session.user.id
        }
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

    const insights: FeedbackInsights = {
      averageRating: feedback.length > 0 ? feedback.reduce((acc: number, curr: AgentFeedback) => acc + curr.rating, 0) / feedback.length : 0,
      sentimentBreakdown: {
        positive: feedback.filter((f: AgentFeedback) => f.rating >= 4).length,
        neutral: feedback.filter((f: AgentFeedback) => f.rating === 3).length,
        negative: feedback.filter((f: AgentFeedback) => f.rating <= 2).length
      },
      ratingTrend: feedback.map((f: AgentFeedback) => ({
        date: f.createdAt.toISOString(),
        rating: f.rating
      })),
      sentimentTrend: feedback.map((f: AgentFeedback) => ({
        date: f.createdAt.toISOString(),
        sentiment: f.sentimentScore ?? 0
      })),
      categoryBreakdown: Object.entries(
        feedback.reduce((acc: Record<string, { count: number; totalRating: number }>, curr: AgentFeedback) => {
          const categories = (curr.categories ?? {}) as Record<string, number>;
          Object.entries(categories).forEach(([name, value]) => {
            if (!acc[name]) {
              acc[name] = { count: 0, totalRating: 0 };
            }
            acc[name].count += 1;
            acc[name].totalRating += curr.rating;
          });
          return acc;
        }, {})
      ).map(([name, { count, totalRating }]) => ({
        category: name,
        count,
        averageRating: totalRating / count
      }))
    };

    return NextResponse.json({
      success: true,
      data: insights
    });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      { success: false, error: errorResponse.message, message: 'Failed to fetch feedback insights', status: errorResponse.status },
      { status: errorResponse.status }
    );
  }
} 