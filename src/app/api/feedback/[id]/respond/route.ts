import { prisma } from '@/lib/db';
import { AgentFeedback } from '@/lib/schema';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { response } = await request.json();
    if (!response) {
      return NextResponse.json(
        { error: 'Response is required' },
        { status: 400 }
      );
    }

    const feedback = await prisma.agentFeedback.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        agentId: true,
        userId: true,
        rating: true,
        comment: true,
        categories: true,
        sentimentScore: true,
        creatorResponse: true,
        responseDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    const updatedFeedback = await prisma.agentFeedback.update({
      where: { id: params.id },
      data: {
        creatorResponse: response,
        responseDate: new Date(),
      },
    });

    // Create notification for the user who provided the feedback
    await createNotification({
      user_id: feedback.userId,
      type: 'feedback_received',
      title: 'Feedback Response Received',
      message: `The creator has responded to your feedback.`,
      metadata: {
        feedbackId: params.id,
        agentId: feedback.agentId,
      },
    });

    return NextResponse.json(updatedFeedback);
  } catch (error) {
    console.error('Error responding to feedback:', error);
    return NextResponse.json(
      { error: 'Failed to respond to feedback' },
      { status: 500 }
    );
  }
} 