import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { ApiError } from '@/lib/errors';
import type { Prisma } from '@/types/prisma';

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
        createdBy: true,
        accessLevel: true
      }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.createdBy !== session.user.id && agent.accessLevel !== 'public') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: Prisma.AgentFeedbackWhereInput = {
      deploymentId: params.id,
      OR: [
        {
          comment: {
            contains: query,
            mode: 'insensitive' as Prisma.QueryMode
          }
        },
        {
          categories: {
            path: ['$'],
            string_contains: query
          }
        }
      ]
    };

    const [results, total] = await Promise.all([
      prisma.agentFeedback.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.agentFeedback.count({ where })
    ]);

    const searchResults = results.map((item) => ({
      id: item.id,
      rating: item.rating,
      comment: item.comment,
      sentimentScore: item.sentimentScore ? Number(item.sentimentScore) : null,
      categories: item.categories as Record<string, number> | null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      user: item.user
    }));

    return NextResponse.json({
      results: searchResults,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error searching feedback:', error);
    const errorResponse = error instanceof ApiError ? error : new ApiError('Failed to search feedback');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.statusCode }
    );
  }
} 