import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { type Feedback, type FeedbackApiResponse } from '@/types/feedback';
import { z } from 'zod';

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  categories: z.record(z.number()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<FeedbackApiResponse>> {
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
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.createdBy !== session.user.id && !agent.isPublic) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const feedback = await prisma.agentFeedback.findMany({
      where: {
        deploymentId: params.id,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        deployment: {
          select: {
            id: true,
            name: true,
            description: true,
            createdBy: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: feedback.map(f => ({
        id: f.id,
        deploymentId: f.deploymentId,
        userId: f.userId,
        rating: f.rating,
        comment: f.comment,
        sentimentScore: f.sentimentScore ? Number(f.sentimentScore) : 0,
        categories: f.categories as Record<string, number> | null,
        metadata: f.metadata as Record<string, unknown>,
        creatorResponse: f.creatorResponse,
        responseDate: f.responseDate,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
        user: {
          id: f.userId,
          name: f.user.name,
          email: null,
          image: f.user.image,
        },
        deployment: {
          id: f.deployment.id,
          name: f.deployment.name,
          description: f.deployment.description,
          createdBy: f.deployment.createdBy,
        },
      })),
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<FeedbackApiResponse>> {
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
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.createdBy !== session.user.id && !agent.isPublic) {
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
        categories: validatedData.categories || {},
        metadata: validatedData.metadata || {},
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        deployment: {
          select: {
            id: true,
            name: true,
            description: true,
            createdBy: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: feedback.id,
        deploymentId: feedback.deploymentId,
        userId: feedback.userId,
        rating: feedback.rating,
        comment: feedback.comment,
        sentimentScore: feedback.sentimentScore ? Number(feedback.sentimentScore) : 0,
        categories: feedback.categories as Record<string, number> | null,
        metadata: feedback.metadata as Record<string, unknown>,
        creatorResponse: feedback.creatorResponse,
        responseDate: feedback.responseDate,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt,
        user: {
          id: feedback.userId,
          name: feedback.user.name,
          email: null,
          image: feedback.user.image,
        },
        deployment: {
          id: feedback.deployment.id,
          name: feedback.deployment.name,
          description: feedback.deployment.description,
          createdBy: feedback.deployment.createdBy,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: [error] },
        { status: 400 }
      );
    }

    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<FeedbackApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const feedback = await prisma.agentFeedback.findUnique({
      where: { id: params.id },
      include: {
        user: true,
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      );
    }

    if (feedback.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await prisma.agentFeedback.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      data: null as any,
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 