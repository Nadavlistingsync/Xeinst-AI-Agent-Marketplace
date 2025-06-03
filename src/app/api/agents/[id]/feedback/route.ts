import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { submitAgentFeedback, getAgentFeedback } from '@/lib/agent-monitoring';
import { createErrorResponse, createSuccessResponse } from '@/lib/api';
import { z } from 'zod';

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function GET(
  _request: Request,
  context: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const timeRange = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date()
    };
    const feedback = await getAgentFeedback(context.params.id, timeRange);
    return createSuccessResponse(feedback);
  } catch (error) {
    console.error('Error fetching agent feedback:', error);
    return createErrorResponse('Failed to fetch feedback');
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse('Unauthorized');
    }

    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);

    await submitAgentFeedback(params.id, session.user.id, validatedData.rating, validatedData.comment);
    return createSuccessResponse({ message: 'Feedback submitted' });
  } catch (error) {
    console.error('Error submitting agent feedback:', error);
    if (error instanceof z.ZodError) {
      return createErrorResponse('Invalid feedback data');
    }
    return createErrorResponse('Failed to submit feedback');
  }
} 