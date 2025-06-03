import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AgentFeedback } from '@prisma/client';

interface SearchResult {
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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const minRating = parseInt(searchParams.get('minRating') || '0');
    const maxRating = parseInt(searchParams.get('maxRating') || '5');
    const sentiment = searchParams.get('sentiment');
    const category = searchParams.get('category');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        createdBy: true,
        isPublic: true,
      },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (agent.createdBy !== session.user.id && !agent.isPublic) {
      return NextResponse.json(
        { error: 'Not authorized to search feedback for this agent' },
        { status: 403 }
      );
    }

    const skip = (page - 1) * limit;

    const where = {
      agentId: params.id,
      rating: {
        gte: minRating,
        lte: maxRating,
      },
      ...(sentiment && {
        sentimentScore: {
          ...(sentiment === 'positive' && { gt: 0.5 }),
          ...(sentiment === 'negative' && { lt: -0.5 }),
          ...(sentiment === 'neutral' && {
            gte: -0.5,
            lte: 0.5,
          }),
        },
      }),
      ...(category && {
        categories: {
          path: [category],
          gt: 0,
        },
      }),
      OR: [
        {
          comment: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          categories: {
            path: ['$'],
            string_contains: query,
          },
        },
      ],
    };

    const [results, total] = await Promise.all([
      prisma.agentFeedback.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.agentFeedback.count({ where }),
    ]);

    const searchResults: SearchResult[] = results.map((item) => ({
      id: item.id,
      rating: item.rating,
      comment: item.comment,
      sentimentScore: item.sentimentScore,
      categories: item.categories as Record<string, number> | null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      results: searchResults,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      metadata: {
        query,
        filters: {
          minRating,
          maxRating,
          sentiment,
          category,
        },
      },
    });
  } catch (error) {
    console.error('Error searching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to search feedback' },
      { status: 500 }
    );
  }
} 