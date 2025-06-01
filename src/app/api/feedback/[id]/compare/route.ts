import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createErrorResponse } from '@/lib/api';
import { z } from 'zod';

const compareQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  compareWith: z.string().uuid(),
  interval: z.enum(['hour', 'day', 'week', 'month']).optional(),
  includeDetails: z.boolean().optional()
});

// Helper function to calculate sentiment
const getSentiment = (rating: number): string => {
  if (rating >= 4) return 'positive';
  if (rating >= 3) return 'neutral';
  return 'negative';
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate agent IDs
    if (!z.string().uuid().safeParse(params.id).success) {
      return NextResponse.json(
        { error: 'Invalid agent ID format' },
        { status: 400 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      compareWith: searchParams.get('compareWith'),
      interval: searchParams.get('interval') as 'hour' | 'day' | 'week' | 'month' | null,
      includeDetails: searchParams.get('includeDetails') === 'true'
    };

    const validatedParams = compareQuerySchema.parse(queryParams);

    if (!z.string().uuid().safeParse(validatedParams.compareWith).success) {
      return NextResponse.json(
        { error: 'Invalid comparison agent ID format' },
        { status: 400 }
      );
    }

    // Get both agents
    const [agent, compareAgent] = await Promise.all([
      prisma.deployment.findUnique({
        where: { id: params.id },
        include: {
          user: {
            select: {
              id: true,
              subscription_tier: true
            }
          }
        }
      }),
      prisma.deployment.findUnique({
        where: { id: validatedParams.compareWith },
        include: {
          user: {
            select: {
              id: true,
              subscription_tier: true
            }
          }
        }
      })
    ]);

    if (!agent || !compareAgent) {
      return NextResponse.json(
        { error: 'One or both agents not found' },
        { status: 404 }
      );
    }

    // Check if user has access to both agents
    const checkAccess = (agent: any) => {
      if (agent.userId !== session.user.id && agent.access_level !== 'public') {
        if (agent.access_level === 'premium' && session.user.subscription_tier !== 'premium') {
          return false;
        }
        if (agent.access_level === 'basic' && session.user.subscription_tier !== 'basic') {
          return false;
        }
      }
      return true;
    };

    if (!checkAccess(agent) || !checkAccess(compareAgent)) {
      return NextResponse.json(
        { error: 'Insufficient access to one or both agents' },
        { status: 403 }
      );
    }

    // Get feedback for both agents
    const [feedback, compareFeedback] = await Promise.all([
      prisma.feedback.findMany({
        where: {
          agentId: params.id,
          ...(validatedParams.startDate && validatedParams.endDate ? {
            createdAt: {
              gte: new Date(validatedParams.startDate),
              lte: new Date(validatedParams.endDate)
            }
          } : {})
        },
        orderBy: {
          createdAt: 'asc'
        }
      }),
      prisma.feedback.findMany({
        where: {
          agentId: validatedParams.compareWith,
          ...(validatedParams.startDate && validatedParams.endDate ? {
            createdAt: {
              gte: new Date(validatedParams.startDate),
              lte: new Date(validatedParams.endDate)
            }
          } : {})
        },
        orderBy: {
          createdAt: 'asc'
        }
      })
    ]);

    // Calculate comparison metrics
    const interval = validatedParams.interval || 'day';
    const metrics = {
      agent: {
        totalFeedback: feedback.length,
        averageRating: feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length,
        sentiment: feedback.reduce((acc, item) => {
          const sentiment = getSentiment(item.rating);
          acc[sentiment] = (acc[sentiment] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      },
      compareAgent: {
        totalFeedback: compareFeedback.length,
        averageRating: compareFeedback.reduce((sum, item) => sum + item.rating, 0) / compareFeedback.length,
        sentiment: compareFeedback.reduce((acc, item) => {
          const sentiment = getSentiment(item.rating);
          acc[sentiment] = (acc[sentiment] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      }
    };

    // Calculate time-based comparison
    const timeComparison = feedback.reduce((acc, item) => {
      const date = new Date(item.createdAt);
      let key: string;

      switch (interval) {
        case 'hour':
          key = date.toISOString().slice(0, 13); // YYYY-MM-DDTHH
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().slice(0, 10); // YYYY-MM-DD
          break;
        case 'month':
          key = date.toISOString().slice(0, 7); // YYYY-MM
          break;
        default: // day
          key = date.toISOString().slice(0, 10); // YYYY-MM-DD
      }

      if (!acc[key]) {
        acc[key] = {
          agent: { count: 0, total: 0 },
          compareAgent: { count: 0, total: 0 }
        };
      }

      acc[key].agent.count++;
      acc[key].agent.total += item.rating;

      return acc;
    }, {} as Record<string, { agent: { count: number; total: number }; compareAgent: { count: number; total: number } }>);

    // Add comparison agent data
    compareFeedback.forEach(item => {
      const date = new Date(item.createdAt);
      let key: string;

      switch (interval) {
        case 'hour':
          key = date.toISOString().slice(0, 13);
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().slice(0, 10);
          break;
        case 'month':
          key = date.toISOString().slice(0, 7);
          break;
        default:
          key = date.toISOString().slice(0, 10);
      }

      if (!timeComparison[key]) {
        timeComparison[key] = {
          agent: { count: 0, total: 0 },
          compareAgent: { count: 0, total: 0 }
        };
      }

      timeComparison[key].compareAgent.count++;
      timeComparison[key].compareAgent.total += item.rating;
    });

    // Format time comparison data
    const timeComparisonData = Object.entries(timeComparison).map(([key, data]) => ({
      date: key,
      agent: {
        count: data.agent.count,
        averageRating: data.agent.total / data.agent.count
      },
      compareAgent: {
        count: data.compareAgent.count,
        averageRating: data.compareAgent.total / data.compareAgent.count
      }
    }));

    return NextResponse.json({
      comparison: {
        metrics,
        timeComparison: timeComparisonData
      },
      metadata: {
        agentId: params.id,
        compareAgentId: validatedParams.compareWith,
        timeRange: {
          start: validatedParams.startDate,
          end: validatedParams.endDate
        },
        interval,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error comparing feedback:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }

    const errorResponse = createErrorResponse(error, 'Failed to compare feedback');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.status }
    );
  }
} 