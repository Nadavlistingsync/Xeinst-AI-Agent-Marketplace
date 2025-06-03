import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { type FeedbackTrend } from '@/types/feedback';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<{ success: boolean; data?: { trends: FeedbackTrend[] }; error?: string }>> {
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
        createdAt: 'asc',
      },
    });

    const trends: FeedbackTrend[] = [];
    const dateMap = new Map<string, {
      count: number;
      totalRating: number;
      totalSentiment: number;
      categories: Record<string, number>;
    }>();

    feedback.forEach((f) => {
      const date = f.createdAt.toISOString().split('T')[0];
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          count: 0,
          totalRating: 0,
          totalSentiment: 0,
          categories: {},
        });
      }

      const dayData = dateMap.get(date)!;
      dayData.count++;
      dayData.totalRating += f.rating;
      if (f.sentimentScore) {
        dayData.totalSentiment += Number(f.sentimentScore);
      }

      if (f.categories) {
        const categories = f.categories as Record<string, number>;
        Object.entries(categories).forEach(([category, value]) => {
          dayData.categories[category] = (dayData.categories[category] || 0) + value;
        });
      }
    });

    dateMap.forEach((data, date) => {
      trends.push({
        date,
        count: data.count,
        averageRating: data.totalRating / data.count,
        sentiment: data.totalSentiment / data.count,
        categories: data.categories,
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        trends,
      },
    });
  } catch (error) {
    console.error('Error comparing feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 