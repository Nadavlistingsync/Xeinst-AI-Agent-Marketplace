import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError } from '../../../../../lib/error-handling';
import type { FeedbackSummaryApiResponse } from '../../../../../types/feedback-analytics';
import type { AgentFeedback } from '../../../../../types/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<FeedbackSummaryApiResponse>> {
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
        deploymentId: params.id
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    const totalFeedback = await prisma.agentFeedback.count({
      where: {
        deploymentId: params.id
      }
    });

    const averageRating = feedback.length > 0
      ? feedback.reduce((acc: number, curr: AgentFeedback) => acc + curr.rating, 0) / feedback.length
      : 0;

    const sentimentDistribution = feedback.reduce((acc: Record<string, number>, f: AgentFeedback) => {
      const score = f.sentimentScore ? Math.round(f.sentimentScore * 10) / 10 : 0;
      acc[score] = (acc[score] || 0) + 1;
      return acc;
    }, {});

    const recentFeedback = feedback.map((f: any) => ({
      id: f.id,
      rating: f.rating,
      comment: f.comment,
      sentimentScore: f.sentimentScore,
      createdAt: f.createdAt,
      user: {
        name: f.user?.name ?? null,
        image: f.user?.image ?? null
      }
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalFeedback,
        averageRating,
        sentimentDistribution,
        recentFeedback
      }
    });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      { success: false, error: errorResponse.message, message: 'Failed to fetch feedback summary', status: errorResponse.status },
      { status: errorResponse.status }
    );
  }
} 