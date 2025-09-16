import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { getFeedbackInsights, getFeedbackTrends } from '@/lib/feedback-analysis';
import { prisma } from "@/lib/prisma";
import { createErrorResponse, createSuccessResponse } from '@/lib/api';
import { z } from 'zod';

const insightsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  category: z.enum(['all', 'error', 'warning', 'success']).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse('Unauthorized');
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            subscriptionTier: true
          }
        }
      }
    });

    if (!agent) {
      return createErrorResponse('Agent not found');
    }

    // Check if user has access to the agent
    if (agent.createdBy !== session.user.id && agent.accessLevel !== 'public') {
      if (agent.accessLevel === 'premium' && session.user.subscriptionTier !== 'premium') {
        return createErrorResponse('Access denied');
      }
      if (agent.accessLevel === 'basic' && session.user.subscriptionTier !== 'basic') {
        return createErrorResponse('Access denied');
      }
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      category: searchParams.get('category')
    };

    const validatedParams = insightsQuerySchema.parse(queryParams);

    const [insights, trends] = await Promise.all([
      getFeedbackInsights(params.id),
      getFeedbackTrends(params.id, validatedParams.category === 'all' ? 'day' : 'month')
    ]);

    return createSuccessResponse({
      insights,
      trends,
      lastUpdated: new Date().toISOString(),
      metadata: {
        agentId: params.id,
        timeRange: {
          start: validatedParams.startDate,
          end: validatedParams.endDate
        },
        category: validatedParams.category || 'all'
      }
    });
  } catch (error) {
    console.error('Error generating feedback insights:', error);
    if (error instanceof z.ZodError) {
      return createErrorResponse('Invalid query parameters');
    }
    return createErrorResponse('Internal server error');
  }
} 