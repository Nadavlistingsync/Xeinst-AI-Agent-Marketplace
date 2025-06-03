import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { type FeedbackApiResponse } from '@/types/feedback';

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(1000).optional(),
  sentimentScore: z.number().min(-1).max(1).optional(),
  categories: z.record(z.number()).optional()
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<FeedbackApiResponse>> {
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
        name: true,
        createdBy: true
      }
    });

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.createdBy !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const feedbacks = await prisma.agentFeedback.findMany({
      where: { deploymentId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ 
      success: true, 
      feedback: feedbacks.map(f => ({
        id: f.id,
        deploymentId: f.deploymentId,
        userId: f.userId,
        rating: f.rating,
        comment: f.comment,
        sentimentScore: f.sentimentScore ? Number(f.sentimentScore) : null,
        categories: f.categories as Record<string, number> | null,
        metadata: {},
        response: f.creatorResponse,
        responseDate: f.responseDate,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
        user: f.user
      }))
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    const errorResponse = error instanceof ApiError ? error : new ApiError('Failed to fetch feedback');
    return NextResponse.json(
      { success: false, error: errorResponse.message },
      { status: errorResponse.statusCode }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<FeedbackApiResponse>> {
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
        name: true,
        createdBy: true
      }
    });

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.createdBy !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);

    const feedback = await prisma.agentFeedback.create({
      data: {
        deploymentId: params.id,
        userId: session.user.id,
        rating: validatedData.rating,
        comment: validatedData.comment,
        sentimentScore: validatedData.sentimentScore ? new Prisma.Decimal(validatedData.sentimentScore) : null,
        categories: validatedData.categories || {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      feedback: {
        id: feedback.id,
        deploymentId: feedback.deploymentId,
        userId: feedback.userId,
        rating: feedback.rating,
        comment: feedback.comment,
        sentimentScore: feedback.sentimentScore ? Number(feedback.sentimentScore) : null,
        categories: feedback.categories as Record<string, number> | null,
        metadata: {},
        response: feedback.creatorResponse,
        responseDate: feedback.responseDate,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt,
        user: feedback.user
      }
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    const errorResponse = error instanceof ApiError ? error : new ApiError('Failed to create feedback');
    return NextResponse.json(
      { success: false, error: errorResponse.message },
      { status: errorResponse.statusCode }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<FeedbackApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const feedbackId = searchParams.get('feedbackId');

    if (!feedbackId) {
      return NextResponse.json(
        { success: false, error: 'Feedback ID is required' },
        { status: 400 }
      );
    }

    const feedback = await prisma.agentFeedback.findUnique({
      where: { id: feedbackId },
      select: {
        id: true,
        deploymentId: true,
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      );
    }

    if (feedback.deploymentId !== params.id) {
      return NextResponse.json(
        { success: false, error: 'Feedback does not belong to this agent' },
        { status: 400 }
      );
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      select: {
        createdBy: true,
      },
    });

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.createdBy !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to delete feedback for this agent' },
        { status: 403 }
      );
    }

    await prisma.agentFeedback.delete({
      where: { id: feedbackId },
    });

    return NextResponse.json({ success: true, feedback: null });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    const errorResponse = error instanceof ApiError ? error : new ApiError('Failed to delete feedback');
    return NextResponse.json(
      { success: false, error: errorResponse.message },
      { status: errorResponse.statusCode }
    );
  }
} 