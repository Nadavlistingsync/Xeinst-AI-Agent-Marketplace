import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type FeedbackExport } from '../../../../../types/feedback';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<{ success: boolean; data?: { exports: FeedbackExport[] }; error?: string }>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      select: {
        createdBy: true,
        accessLevel: true
      }
    });

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.createdBy !== session.user.id && agent.accessLevel !== 'public') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const feedback = await prisma.agentFeedback.findMany({
      where: {
        deploymentId: params.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const exports: FeedbackExport[] = feedback.map((f) => ({
      id: f.id,
      rating: f.rating,
      comment: f.comment,
      sentimentScore: f.sentimentScore ? Number(f.sentimentScore) : null,
      categories: f.categories as Record<string, number> | null,
      createdAt: f.createdAt,
      response: f.creatorResponse,
      responseDate: f.responseDate,
      userName: f.user.name,
      userEmail: f.user.email,
    }));

    return NextResponse.json({
      success: true,
      data: {
        exports,
      },
    });
  } catch (error) {
    console.error('Error exporting feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 