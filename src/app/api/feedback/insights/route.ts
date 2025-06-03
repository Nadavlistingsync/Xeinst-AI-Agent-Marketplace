import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/error-handling';
import type { FeedbackInsightsResponse } from '@/types/feedback-analytics';

export async function GET(): Promise<NextResponse<FeedbackInsightsResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const feedback = await prisma.feedback.findMany({
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

    const metrics = {
      totalFeedback: feedback.length,
      averageRating: feedback.reduce((acc, curr) => acc + curr.rating, 0) / feedback.length || 0,
      sentimentDistribution: {
        positive: feedback.filter(f => f.rating >= 4).length,
        neutral: feedback.filter(f => f.rating === 3).length,
        negative: feedback.filter(f => f.rating <= 2).length
      }
    };

    const trends = {
      ratingTrend: feedback.map(f => ({
        date: f.createdAt.toISOString(),
        rating: f.rating
      })),
      sentimentTrend: feedback.map(f => ({
        date: f.createdAt.toISOString(),
        sentiment: f.sentimentScore ? Number(f.sentimentScore) : 0
      }))
    };

    const categories = Object.entries(
      feedback.reduce((acc, curr) => {
        if (curr.categories) {
          Object.entries(curr.categories as Record<string, number>).forEach(([category, value]) => {
            if (!acc[category]) {
              acc[category] = { count: 0, totalRating: 0 };
            }
            acc[category].count++;
            acc[category].totalRating += value;
          });
        }
        return acc;
      }, {} as Record<string, { count: number; totalRating: number }>)
    ).map(([name, { count, totalRating }]) => ({
      name,
      count,
      averageRating: totalRating / count || 0
    }));

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        trends,
        categories
      }
    } as FeedbackInsightsResponse);
  } catch (error) {
    console.error('Error fetching feedback insights:', error);
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      { success: false, error: errorResponse.message },
      { status: errorResponse.status }
    );
  }
} 