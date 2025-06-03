import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { feedbackSchema, type FeedbackApiResponse } from '@/types/feedback';
import { ApiError } from '@/lib/errors';

export async function POST(request: Request): Promise<NextResponse<FeedbackApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ApiError('Unauthorized', 401);
    }

    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);

    const feedback = await prisma.agentFeedback.create({
      data: {
        deploymentId: validatedData.agentId,
        userId: session.user.id,
        rating: validatedData.rating,
        comment: validatedData.comment,
        sentimentScore: validatedData.sentimentScore,
        categories: validatedData.categories || {},
        metadata: validatedData.metadata || {}
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

    return NextResponse.json({
      success: true,
      feedback: {
        id: feedback.id,
        agentId: feedback.deploymentId,
        userId: feedback.userId,
        rating: feedback.rating,
        comment: feedback.comment,
        sentimentScore: feedback.sentimentScore ? Number(feedback.sentimentScore) : null,
        categories: feedback.categories as Record<string, number>,
        metadata: feedback.metadata as Record<string, unknown>,
        response: feedback.creatorResponse,
        responseDate: feedback.responseDate,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt,
        user: feedback.user
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 