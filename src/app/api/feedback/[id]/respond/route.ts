import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "../../../../../lib/auth";
import { prisma } from '@/types/prisma';
import { z } from 'zod';

const responseSchema = z.object({
  response: z.string().min(1),
});

async function handler(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const feedback = await prisma.agentFeedback.findUnique({
    where: { id: params.id },
  });

  if (!feedback) {
    return NextResponse.json(
      { error: 'Feedback not found' },
      { status: 404 }
    );
  }

  if (feedback.userId === session.user.id) {
    return NextResponse.json(
      { error: 'Cannot respond to your own feedback' },
      { status: 400 }
    );
  }

  const validatedData = responseSchema.parse(await request.json());

  const updatedFeedback = await prisma.agentFeedback.update({
    where: { id: params.id },
    data: {
      creatorResponse: validatedData.response,
      responseDate: new Date(),
      metadata: {
        status: 'responded',
      },
    },
  });

  await prisma.notification.create({
    data: {
      userId: feedback.userId,
      type: 'feedback_alert',
      message: 'Your feedback has received a response',
      metadata: {
        feedbackId: feedback.id,
        response: validatedData.response,
      },
    },
  });

  return NextResponse.json(updatedFeedback);
}

export const POST = handler;

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const feedback = await prisma.agentFeedback.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          subscriptionTier: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!feedback) {
    return NextResponse.json(
      { error: 'Feedback not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(feedback);
} 