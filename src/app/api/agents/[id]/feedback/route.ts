import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { submitAgentFeedback, getAgentFeedback } from '@/lib/agent-monitoring';

export async function GET(
  _request: Request,
  context: { params: { id: string } }
) {
  try {
    const feedback = await getAgentFeedback(context.params.id);
    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error fetching agent feedback:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const body = await request.json();
    const { rating, comment } = body;
    if (!rating || rating < 1 || rating > 5) {
      return new NextResponse('Invalid rating', { status: 400 });
    }
    await submitAgentFeedback({
      agentId: params.id,
      userId: session.user.id,
      rating,
      comment,
    });
    return new NextResponse('Feedback submitted', { status: 201 });
  } catch (error) {
    console.error('Error submitting agent feedback:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 