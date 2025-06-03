import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { z } from 'zod';

const responseSchema = z.object({
  response: z.string().min(1).max(1000)
});

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

    const feedback = await prisma.agentFeedback.findUnique({
      where: { id: params.id },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            createdBy: true
          }
        }
      }
    });

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    if (feedback.agent.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = responseSchema.parse(body);

    const updatedFeedback = await prisma.agentFeedback.update({
      where: { id: params.id },
      data: {
        creatorResponse: validatedData.response,
        responseDate: new Date(),
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

    // Create notification for feedback creator
    await prisma.notification.create({
      data: {
        userId: feedback.userId,
        type: 'FEEDBACK_RESPONSE',
        title: 'Response to Your Feedback',
        message: `The creator of ${feedback.agent.name} has responded to your feedback`,
        metadata: {
          agentId: feedback.agent.id,
          feedbackId: feedback.id
        },
        read: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedFeedback);
  } catch (error) {
    console.error('Error responding to feedback:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    const errorResponse = error instanceof ApiError ? error : new ApiError('Failed to respond to feedback');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.statusCode }
    );
  }
} 