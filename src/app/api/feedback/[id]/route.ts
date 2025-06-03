import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { feedbackSchema, type FeedbackApiResponse } from '@/types/feedback';
import { type AgentFeedback } from '@prisma/client';

interface FeedbackData {
  id: string;
  rating: number;
  comment: string | null;
  sentimentScore: number | null;
  categories: Record<string, number> | null;
  createdAt: string;
  updatedAt: string;
}

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
        createdAt: true,
        updatedAt: true,
        status: true,
        description: true,
        framework: true,
        deployedBy: true,
        rating: true,
        requirements: true,
        version: true,
        createdBy: true,
        totalRatings: true,
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

    const feedback = await prisma.agentFeedback.findMany({
      where: { agentId: params.id },
      orderBy: { createdAt: 'desc' }
    });

    const feedbackData = feedback.map((item) => ({
      id: item.id,
      rating: item.rating,
      comment: item.comment,
      sentimentScore: item.sentimentScore ? Number(item.sentimentScore) : null,
      categories: item.categories as Record<string, number> | null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: feedbackData
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
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
        createdAt: true,
        updatedAt: true,
        status: true,
        description: true,
        framework: true,
        deployedBy: true,
        rating: true,
        requirements: true,
        version: true,
        createdBy: true,
        totalRatings: true,
        isPublic: true
      }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
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
        categories: validatedData.categories,
        sentimentScore: validatedData.sentimentScore
      }
    });

    return NextResponse.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
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