import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from 'zod';
import { createErrorResponse, createSuccessResponse } from '../../../../lib/api';
import type { Prisma } from '../../../../types/prisma';

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().nullable(),
  categories: z.record(z.number()).nullable(),
  metadata: z.record(z.unknown()).nullable(),
});

type FeedbackWithRelations = Prisma.AgentFeedbackGetPayload<{
  include: {
    user: {
      select: {
        name: true;
        image: true;
      };
    };
    deployment: {
      select: {
        id: true;
        name: true;
        description: true;
        createdBy: true;
      };
    };
  };
}>;

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return createErrorResponse(new Error('Unauthorized'));
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!agent) {
      return createErrorResponse(new Error('Agent not found'));
    }

    if (agent.createdBy !== session.user.id && !agent.isPublic) {
      return createErrorResponse(new Error('Unauthorized'));
    }

    const feedback = await prisma.agentFeedback.findMany({
      where: {
        deploymentId: params.id,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        deployment: {
          select: {
            id: true,
            name: true,
            description: true,
            createdBy: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }) as FeedbackWithRelations[];

    const formattedFeedback = feedback.map(f => ({
      id: f.id,
      deploymentId: f.deploymentId,
      userId: f.userId,
      rating: f.rating,
      comment: f.comment,
      sentimentScore: f.sentimentScore ?? 0,
      categories: f.categories as Record<string, number> | null,
      metadata: f.metadata as Prisma.JsonValue,
      creatorResponse: f.creatorResponse,
      responseDate: f.responseDate,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      user: f.user
        ? {
            id: f.userId,
            name: f.user.name ?? null,
            email: null,
            image: f.user.image ?? null,
          }
        : null,
      deployment: f.deployment
        ? {
            id: f.deployment.id,
            name: f.deployment.name,
            description: f.deployment.description,
            createdBy: f.deployment.createdBy,
          }
        : null,
    }));

    return createSuccessResponse(formattedFeedback);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return createErrorResponse(new Error('Unauthorized'));
    }

    const validatedData = await feedbackSchema.parseAsync(await req.json());
    
    const feedback = await prisma.agentFeedback.create({
      data: {
        deploymentId: params.id,
        userId: session.user.id,
        rating: validatedData.rating,
        comment: validatedData.comment,
        categories: validatedData.categories as Prisma.InputJsonValue,
        metadata: validatedData.metadata as Prisma.InputJsonValue,
        sentimentScore: 0 // Default value, will be updated by sentiment analysis
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        },
        deployment: {
          select: {
            id: true,
            name: true,
            description: true,
            createdBy: true,
          },
        },
      }
    }) as FeedbackWithRelations;

    const formattedFeedback = {
      id: feedback.id,
      deploymentId: feedback.deploymentId,
      userId: feedback.userId,
      rating: feedback.rating,
      comment: feedback.comment,
      sentimentScore: feedback.sentimentScore ?? 0,
      categories: feedback.categories as Record<string, number> | null,
      metadata: feedback.metadata as Prisma.JsonValue,
      creatorResponse: feedback.creatorResponse,
      responseDate: feedback.responseDate,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
      user: feedback.user ? {
        id: feedback.userId,
        name: feedback.user.name ?? null,
        email: null,
        image: feedback.user.image ?? null,
      } : null,
      deployment: feedback.deployment ? {
        id: feedback.deployment.id,
        name: feedback.deployment.name,
        description: feedback.deployment.description,
        createdBy: feedback.deployment.createdBy,
      } : null,
    };

    return createSuccessResponse(formattedFeedback);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return createErrorResponse(new Error('Unauthorized'));
    }

    const feedback = await prisma.agentFeedback.findUnique({
      where: { id: params.id },
      include: {
        user: true,
      },
    });

    if (!feedback) {
      return createErrorResponse(new Error('Feedback not found'));
    }

    if (feedback.userId !== session.user.id) {
      return createErrorResponse(new Error('Unauthorized'));
    }

    await prisma.agentFeedback.delete({
      where: { id: params.id },
    });

    return createSuccessResponse(null);
  } catch (error) {
    return createErrorResponse(error);
  }
} 