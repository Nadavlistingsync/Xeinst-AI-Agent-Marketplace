import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(1000).optional(),
  sentimentScore: z.number().min(-1).max(1).optional(),
  categories: z.record(z.number()).optional()
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

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        createdBy: true,
        isPublic: true
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

    const feedbacks = await prisma.agentFeedback.findMany({
      where: { agentId: params.id },
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

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    const errorResponse = error instanceof ApiError ? error : new ApiError('Failed to fetch feedback');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.statusCode }
    );
  }
}

export async function POST(
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

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        createdBy: true,
        isPublic: true
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

    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);

    const feedback = await prisma.agentFeedback.create({
      data: {
        agentId: params.id,
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

    // Create notification for agent creator
    if (agent.createdBy !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: agent.createdBy,
          type: 'FEEDBACK_RECEIVED',
          title: 'New Feedback Received',
          message: `You received new feedback for your agent "${agent.name}"`,
          metadata: {
            agentId: agent.id,
            feedbackId: feedback.id
          },
          read: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    const errorResponse = error instanceof ApiError ? error : new ApiError('Failed to create feedback');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.statusCode }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const feedbackId = searchParams.get('feedbackId');

    if (!feedbackId) {
      return NextResponse.json(
        { error: 'Feedback ID is required' },
        { status: 400 }
      );
    }

    const feedback = await prisma.agentFeedback.findUnique({
      where: { id: feedbackId },
      select: {
        id: true,
        agentId: true,
      },
    });

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    if (feedback.agentId !== params.id) {
      return NextResponse.json(
        { error: 'Feedback does not belong to this agent' },
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
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (agent.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete feedback for this agent' },
        { status: 403 }
      );
    }

    await prisma.agentFeedback.delete({
      where: { id: feedbackId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to delete feedback' },
      { status: 500 }
    );
  }
} 