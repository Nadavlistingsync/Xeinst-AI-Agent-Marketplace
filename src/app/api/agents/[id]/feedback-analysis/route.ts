import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { analyzeAgentFeedback } from '@/lib/feedback-analysis';
import { type FeedbackAnalysisApiResponse } from '@/types/feedback-analytics';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<FeedbackAnalysisApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
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
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.createdBy !== session.user.id && agent.accessLevel !== 'public') {
      if (agent.accessLevel === 'premium' && session.user.subscriptionTier !== 'premium') {
        return NextResponse.json(
          { success: false, error: 'Premium subscription required' },
          { status: 403 }
        );
      }
      if (agent.accessLevel === 'basic' && session.user.subscriptionTier !== 'basic') {
        return NextResponse.json(
          { success: false, error: 'Basic subscription required' },
          { status: 403 }
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const timeRange = startDate && endDate ? {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    } : undefined;

    const analysis = await analyzeAgentFeedback(params.id, timeRange);

    return NextResponse.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error analyzing feedback:', error);
    const errorResponse = error instanceof ApiError ? error : new ApiError('Failed to analyze feedback');
    return NextResponse.json(
      { success: false, error: errorResponse.message },
      { status: errorResponse.statusCode }
    );
  }
} 