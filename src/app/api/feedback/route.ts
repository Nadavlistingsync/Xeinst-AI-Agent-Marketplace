import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Feedback, FeedbackSuccess, FeedbackError } from '@/types/feedback';
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

export async function GET(): Promise<NextResponse<FeedbackSuccess | FeedbackError>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', message: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    const deployments = await prisma.deployment.findMany({
      where: {
        OR: [
          { createdBy: session.user.id },
          { accessLevel: 'public' }
        ]
      },
      include: {
        feedbacks: {
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
        }
      }
    });

    const feedback = deployments.flatMap(deployment => 
      deployment.feedbacks.map(feedback => ({
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
          image: feedback.user.image
        },
        deployment: {
          id: deployment.id,
          name: deployment.name,
          description: deployment.description,
          createdBy: deployment.createdBy
        }
      }))
    );

    if (feedback.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No feedback found', message: 'No feedback found', status: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: feedback[0]
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
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