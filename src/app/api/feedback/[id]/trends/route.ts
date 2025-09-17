import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { z } from 'zod';

const trendsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional().default('day')
});

interface FeedbackTimeRange {
  start_date?: Date;
  end_date?: Date;
}

interface TrendData {
  date: string;
  count: number;
  averageRating: number;
  averageSentiment: number;
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
    const validatedParams = trendsSchema.parse({
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      groupBy: searchParams.get('groupBy')
    });

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      select: {
        createdBy: true,
        accessLevel: true
      }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.createdBy !== session.user.id && agent.accessLevel !== 'public') {
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
      orderBy: { createdAt: 'asc' }
    });

    const trends: TrendData[] = [];
    const groupedData: Record<string, { count: number; totalRating: number; totalSentiment: number }> = {};

    feedback.forEach((item) => {
      let dateKey: string;
      const date = new Date(item.createdAt);

      switch (validatedParams.groupBy) {
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          dateKey = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default: // day
          dateKey = date.toISOString().split('T')[0];
      }

      if (!groupedData[dateKey]) {
        groupedData[dateKey] = {
          count: 0,
          totalRating: 0,
          totalSentiment: 0
        };
      }

      groupedData[dateKey].count++;
      groupedData[dateKey].totalRating += item.rating;
      if (item.sentimentScore) {
        groupedData[dateKey].totalSentiment += Number(item.sentimentScore);
      }
    });

    Object.entries(groupedData).forEach(([date, data]) => {
      trends.push({
        date,
        count: data.count,
        averageRating: data.totalRating / data.count,
        averageSentiment: data.totalSentiment / data.count
      });
    });

    // Sort trends by date
    trends.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate overall trends
    const overallTrends = {
      volume: 0,
      rating: 0,
      sentiment: 0
    };

    if (trends.length > 1) {
      const firstHalf = trends.slice(0, Math.floor(trends.length / 2));
      const secondHalf = trends.slice(Math.floor(trends.length / 2));

      const firstVolume = firstHalf.reduce((sum, item) => sum + item.count, 0);
      const secondVolume = secondHalf.reduce((sum, item) => sum + item.count, 0);
      overallTrends.volume = firstVolume !== 0 ? ((secondVolume - firstVolume) / firstVolume) * 100 : 0;

      const firstRating = firstHalf.reduce((sum, item) => sum + item.averageRating, 0) / firstHalf.length;
      const secondRating = secondHalf.reduce((sum, item) => sum + item.averageRating, 0) / secondHalf.length;
      overallTrends.rating = firstRating !== 0 ? ((secondRating - firstRating) / firstRating) * 100 : 0;

      const firstSentiment = firstHalf.reduce((sum, item) => sum + item.averageSentiment, 0) / firstHalf.length;
      const secondSentiment = secondHalf.reduce((sum, item) => sum + item.averageSentiment, 0) / secondHalf.length;
      overallTrends.sentiment = firstSentiment !== 0 ? ((secondSentiment - firstSentiment) / firstSentiment) * 100 : 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        trends,
        overallTrends,
        timeRange: {
          start: timeRange.start_date?.toISOString() || feedback[0]?.createdAt.toISOString(),
          end: timeRange.end_date?.toISOString() || feedback[feedback.length - 1]?.createdAt.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
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