import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { agentFeedbacks } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { createNotification } from '@/lib/notifications';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { response } = await req.json();
    if (!response) {
      return NextResponse.json(
        { error: 'Response is required' },
        { status: 400 }
      );
    }

    // Get the feedback to check ownership
    const feedback = await db
      .select()
      .from(agentFeedbacks)
      .where(eq(agentFeedbacks.id, params.id))
      .limit(1);

    if (!feedback.length) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    // Update the feedback with the response
    await db
      .update(agentFeedbacks)
      .set({
        creator_response: response,
        response_date: new Date(),
      })
      .where(eq(agentFeedbacks.id, params.id));

    // Create notification for the user who provided the feedback
    await createNotification({
      userId: feedback[0].userId,
      type: 'feedback_received',
      title: 'Feedback Response Received',
      message: `The creator has responded to your feedback.`,
      metadata: {
        feedbackId: params.id,
        agentId: feedback[0].agentId,
      },
    });

    return NextResponse.json({ message: 'Response submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback response:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 