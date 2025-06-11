import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/types/prisma';
import { createNotification } from '@/lib/notifications';
import { NotificationType } from '@/types/prisma';
import { withErrorHandling } from '@/lib/error-handling';
import { withRateLimit } from '@/lib/rate-limit';
import { withValidation } from '@/lib/validation';
import { z } from 'zod';

// Define response schema
const responseSchema = z.object({
  response: z.string().min(1, 'Response is required'),
});

// Handler function
async function handler(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const feedback = await prisma.feedback.findUnique({
    where: { id: params.id },
    include: { user: true }
  });

  if (!feedback) {
    return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
  }

  if (feedback.userId === session.user.id) {
    return NextResponse.json(
      { error: 'Cannot respond to your own feedback' },
      { status: 400 }
    );
  }

  const body = await request.json();
  const validatedData = responseSchema.parse(body);

  const updatedFeedback = await prisma.feedback.update({
    where: { id: params.id },
    data: {
      response: validatedData.response,
      respondedAt: new Date(),
      respondedBy: session.user.id
    }
  });

  // Create notification for feedback author
  await createNotification({
    userId: feedback.userId,
    type: NotificationType.FEEDBACK_RESPONSE,
    message: 'Your feedback has received a response',
    metadata: {
      feedbackId: feedback.id,
      responderId: session.user.id,
      responderName: session.user.name || 'A team member'
    }
  });

  return NextResponse.json(updatedFeedback);
}

// Export the wrapped handler
export const POST = withErrorHandling(withRateLimit(withValidation(handler, responseSchema))); 