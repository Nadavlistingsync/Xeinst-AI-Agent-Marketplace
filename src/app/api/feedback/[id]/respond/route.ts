import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/types/prisma';
import { NotificationType } from '@/types/prisma';
import { sendNotification } from '@/lib/notifications';
import { withRetry } from '@/lib/retry';
import { withErrorHandling } from '@/lib/error-handling';
import { withRateLimit } from '@/lib/rate-limit';
import { withValidation } from '@/lib/validation';
import { z } from 'zod';

const responseSchema = z.object({
  response: z.string().min(1).max(1000),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<{ success: boolean; error?: string }>> {
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
        deployment: {
          select: {
            id: true,
            name: true,
            createdBy: true,
          },
        },
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      );
    }

    if (feedback.deployment.createdBy !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = responseSchema.parse(body);

    await prisma.agentFeedback.update({
      where: { id: params.id },
      data: {
        creatorResponse: validatedData.response,
        responseDate: new Date(),
      },
    });

    // Create notification for the feedback author
    await prisma.notification.create({
      data: {
        userId: feedback.userId,
        type: NotificationType.feedback_alert,
        message: `Your feedback for ${feedback.deployment.name} has received a response`,
        metadata: {
          feedbackId: feedback.id,
          deploymentId: feedback.deployment.id
        }
      }
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error responding to feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 