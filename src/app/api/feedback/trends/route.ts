import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '../../../../lib/db';
import { ApiError } from '../../../../lib/errors';
import type { AgentFeedback } from '../../../../types/prisma';
import type { AgentFeedbackWhereInput } from '../../../../lib/schema';

interface FeedbackTrend {
  date: string;
  count: number;
  averageRating: number;
  sentiment: number;
  categories: Record<string, number>;
}

interface GroupedFeedback {
  [key: string]: AgentFeedback[];
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

    const where: AgentFeedbackWhereInput = {
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
      include: {
        deployment: true,
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const groupedFeedbacks = feedbacks.reduce((acc: GroupedFeedback, feedback: AgentFeedback) => {
      const date = feedback.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(feedback);
      return acc;
    }, {});

    const trends: FeedbackTrend[] = Object.entries(groupedFeedbacks).map(([date, groupFeedbacks]) => {
      const sentimentScores = groupFeedbacks
        .map((f: AgentFeedback) => f.sentimentScore ? Number(f.sentimentScore) : 0)
        .filter((score: number) => !isNaN(score));

      const averageSentiment = sentimentScores.length > 0
        ? sentimentScores.reduce((a: number, b: number) => a + b, 0) / sentimentScores.length
        : 0;

      const categories = groupFeedbacks.reduce((acc: Record<string, number>, feedback: AgentFeedback) => {
        if (feedback.categories) {
          const cats = feedback.categories as Record<string, string[]>;
          Object.entries(cats).forEach(([category, values]) => {
            values.forEach(value => {
              const key = `${category}:${value}`;
              acc[key] = (acc[key] || 0) + 1;
            });
          });
        }
        return acc;
      }, {});

      return {
        date,
        count: groupFeedbacks.length,
        averageRating: groupFeedbacks.reduce((acc: number, f: AgentFeedback) => acc + f.rating, 0) / groupFeedbacks.length,
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