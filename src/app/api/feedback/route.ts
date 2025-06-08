import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Feedback, FeedbackSuccess, FeedbackError, FeedbackListResponse } from '@/types/feedback';
import { JsonValue } from '@prisma/client/runtime/library';
import { NotificationType } from '@prisma/client';

export const dynamic = 'force-dynamic';

const feedbackSchema = z.object({
  deploymentId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  categories: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export async function GET(): Promise<NextResponse<FeedbackListResponse>> {
  try {
    const feedback = await prisma.agentFeedback.findMany({
      where: {},
      include: {
        deployment: true,
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedFeedback = feedback.map(f => ({
      id: f.id,
      userId: f.userId,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      rating: f.rating,
      deploymentId: f.deploymentId,
      comment: f.comment,
      sentimentScore: f.sentimentScore ?? 0,
      categories: f.categories as Record<string, any> | null,
      creatorResponse: f.creatorResponse,
      responseDate: f.responseDate,
      metadata: f.metadata,
      user: {
        id: f.user.id,
        name: f.user.name,
        email: f.user.email,
        image: f.user.image,
      },
      deployment: {
        id: f.deployment.id,
        name: f.deployment.name,
        description: f.deployment.description,
        createdBy: f.deployment.createdBy,
      },
    }));

    return NextResponse.json({ success: true, data: formattedFeedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch feedback',
        message: 'An error occurred while fetching feedback',
        status: 500
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse<FeedbackSuccess | FeedbackError>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized',
          message: 'Unauthorized',
          status: 401
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);

    const deployment = await prisma.deployment.findUnique({
      where: { id: validatedData.deploymentId },
      select: {
        id: true,
        name: true,
        description: true,
        createdBy: true,
        isPublic: true,
      },
    });

    if (!deployment) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Deployment not found',
          message: 'Deployment not found',
          status: 404
        },
        { status: 404 }
      );
    }

    if (!deployment.isPublic && deployment.createdBy !== session.user.id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized',
          message: 'Unauthorized',
          status: 403
        },
        { status: 403 }
      );
    }

    const feedback = await prisma.agentFeedback.create({
      data: {
        deploymentId: validatedData.deploymentId,
        userId: session.user.id,
        rating: validatedData.rating,
        comment: validatedData.comment || null,
        categories: validatedData.categories ? { categories: validatedData.categories } : undefined,
        metadata: validatedData.metadata ? { metadata: validatedData.metadata } : undefined,
        sentimentScore: 0, // Will be updated by the feedback processor
      },
      include: {
        deployment: {
          select: {
            id: true,
            name: true,
            description: true,
            createdBy: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    const formattedFeedback: Feedback = {
      id: feedback.id,
      deploymentId: feedback.deploymentId,
      userId: feedback.userId,
      rating: feedback.rating,
      comment: feedback.comment,
      sentimentScore: feedback.sentimentScore ?? 0,
      categories: feedback.categories as Record<string, number> | null,
      metadata: feedback.metadata as JsonValue,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
      creatorResponse: feedback.creatorResponse,
      responseDate: feedback.responseDate,
      user: {
        id: feedback.user.id,
        name: feedback.user.name,
        email: feedback.user.email,
        image: feedback.user.image,
      },
      deployment: {
        id: feedback.deployment.id,
        name: feedback.deployment.name,
        description: feedback.deployment.description,
        createdBy: feedback.deployment.createdBy,
      },
    };

    // Create notification for the deployment creator
    await prisma.notification.create({
      data: {
        userId: deployment.createdBy,
        type: 'NEW_FEEDBACK' as NotificationType,
        message: `New feedback received for ${deployment.name}`,
        metadata: {
          feedbackId: feedback.id,
          deploymentId: deployment.id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: formattedFeedback,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input',
          message: 'Invalid input',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          })),
          status: 400
        },
        { status: 400 }
      );
    }

    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Internal server error',
        status: 500
      },
      { status: 500 }
    );
  }
} 