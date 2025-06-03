import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { Prisma } from '@prisma/client';

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
        createdBy: true,
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

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Prisma.AgentFeedbackWhereInput = {
      agentId: params.id,
      ...(startDate && {
        createdAt: {
          gte: new Date(startDate)
        }
      }),
      ...(endDate && {
        createdAt: {
          lte: new Date(endDate)
        }
      })
    };

    const feedbacks = await prisma.agentFeedback.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (format === 'json') {
      return NextResponse.json(feedbacks);
    }

    // CSV format
    const headers = [
      'ID',
      'Rating',
      'Comment',
      'Sentiment Score',
      'Categories',
      'User Name',
      'User Email',
      'Created At',
      'Response',
      'Response Date'
    ].join(',');

    const rows = feedbacks.map(feedback => {
      const categories = feedback.categories ? JSON.stringify(feedback.categories) : '';
      return [
        feedback.id,
        feedback.rating,
        `"${feedback.comment?.replace(/"/g, '""') || ''}"`,
        feedback.sentimentScore || '',
        `"${categories}"`,
        `"${feedback.user?.name || ''}"`,
        `"${feedback.user?.email || ''}"`,
        feedback.createdAt.toISOString(),
        `"${feedback.creatorResponse?.replace(/"/g, '""') || ''}"`,
        feedback.responseDate?.toISOString() || ''
      ].join(',');
    });

    const csv = [headers, ...rows].join('\n');
    const response = new NextResponse(csv);
    response.headers.set('Content-Type', 'text/csv');
    response.headers.set('Content-Disposition', `attachment; filename="feedback-${agent.name}-${new Date().toISOString()}.csv"`);
    return response;
  } catch (error) {
    console.error('Error exporting feedback:', error);
    const errorResponse = error instanceof ApiError ? error : new ApiError('Failed to export feedback');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.statusCode }
    );
  }
} 