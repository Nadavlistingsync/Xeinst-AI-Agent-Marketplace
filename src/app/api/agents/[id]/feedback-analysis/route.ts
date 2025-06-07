import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { analyzeFeedback } from '@/lib/feedback-analysis';
import { createErrorResponse, createSuccessResponse } from '@/lib/api';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse(new Error('Unauthorized'));
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        createdBy: true,
        accessLevel: true
      }
    });

    if (!agent) {
      return createErrorResponse(new Error('Agent not found'));
    }

    if (agent.createdBy !== session.user.id && agent.accessLevel !== 'public') {
      if (agent.accessLevel === 'premium' && session.user.subscriptionTier !== 'premium') {
        return createErrorResponse(new Error('Premium subscription required'));
      }
      if (agent.accessLevel === 'basic' && session.user.subscriptionTier !== 'basic') {
        return createErrorResponse(new Error('Basic subscription required'));
      }
    }

    const analysis = await analyzeFeedback(params.id);
    return createSuccessResponse(analysis);
  } catch (error) {
    console.error('Error analyzing feedback:', error);
    return createErrorResponse(error);
  }
} 