import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const summarySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().optional().default(10)
});

interface FeedbackTimeRange {
  start_date?: Date;
  end_date?: Date;
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

    const { searchParams } = new URL(request.url);
    const validatedParams = summarySchema.parse({
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    });

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
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

    const timeRange: FeedbackTimeRange = {
      start_date: validatedParams.startDate ? new Date(validatedParams.startDate) : undefined,
      end_date: validatedParams.endDate ? new Date(validatedParams.endDate) : undefined
    };

    const where = {
      agentId: params.id,
      ...(timeRange.start_date && {
        createdAt: {
          gte: timeRange.start_date
        }
      }),
      ...(timeRange.end_date && {
        createdAt: {
          lte: timeRange.end_date
        }
      })
    };

    const feedback = await prisma.agentFeedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: validatedParams.limit
    });

    const summary = {
      totalFeedback: feedback.length,
      averageRating: 0,
      sentimentDistribution: {
        positive: 0,
        neutral: 0,
        negative: 0
      },
      topCategories: [] as Array<{ name: string; count: number }>,
      recentFeedback: feedback.map(item => ({
        id: item.id,
        rating: item.rating,
        sentimentScore: item.sentimentScore ? Number(item.sentimentScore) : null,
        categories: item.categories as Record<string, number>,
        createdAt: item.createdAt
      }))
    };

    if (feedback.length > 0) {
      // Calculate average rating
      summary.averageRating = feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length;

      // Calculate sentiment distribution
      feedback.forEach((item) => {
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

      // Calculate top categories
      const categoryCounts: Record<string, number> = {};
      feedback.forEach((item) => {
        if (item.categories) {
          const categories = item.categories as Record<string, number>;
          Object.entries(categories).forEach(([category, value]) => {
            categoryCounts[category] = (categoryCounts[category] || 0) + value;
          });
        }
      });

      summary.topCategories = Object.entries(categoryCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    }

    return NextResponse.json({
      success: true,
      data: {
        summary,
        timeRange: {
          start: timeRange.start_date?.toISOString() || feedback[0]?.createdAt.toISOString(),
          end: timeRange.end_date?.toISOString() || feedback[feedback.length - 1]?.createdAt.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 