import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';

const analyticsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional().default('day')
});

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
    const validatedParams = analyticsSchema.parse({
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      groupBy: searchParams.get('groupBy')
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

    const where = {
      agentId: params.id,
      ...(validatedParams.startDate && {
        createdAt: {
          gte: new Date(validatedParams.startDate)
        }
      }),
      ...(validatedParams.endDate && {
        createdAt: {
          lte: new Date(validatedParams.endDate)
        }
      })
    };

    const feedback = await prisma.agentFeedback.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });

    const sentimentAnalysis = {
      positive: 0,
      neutral: 0,
      negative: 0
    };

    feedback.forEach((item) => {
      if (item.sentimentScore) {
        const score = Number(item.sentimentScore);
        if (score > 0.5) {
          sentimentAnalysis.positive++;
        } else if (score < -0.5) {
          sentimentAnalysis.negative++;
        } else {
          sentimentAnalysis.neutral++;
        }
      }
    });

    const categoryAnalysis: Record<string, number> = {};
    feedback.forEach((item) => {
      if (item.categories) {
        const categories = item.categories as Record<string, number>;
        Object.entries(categories).forEach(([category, value]) => {
          categoryAnalysis[category] = (categoryAnalysis[category] || 0) + value;
        });
      }
    });

    const totalSentiment = feedback.reduce((sum, item) => {
      return sum + (item.sentimentScore ? Number(item.sentimentScore) : 0);
    }, 0);

    const averageSentiment = feedback.length > 0 ? totalSentiment / feedback.length : 0;

    const recentFeedback = feedback.slice(-10);
    const recentSentiment = recentFeedback.reduce((sum, item) => {
      return sum + (item.sentimentScore ? Number(item.sentimentScore) : 0);
    }, 0);

    const averageRecentSentiment = recentFeedback.length > 0 ? recentSentiment / recentFeedback.length : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalFeedback: feedback.length,
        sentimentAnalysis,
        categoryAnalysis,
        averageSentiment,
        averageRecentSentiment,
        sentimentTrend: {
          current: averageRecentSentiment,
          previous: averageSentiment
        }
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
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