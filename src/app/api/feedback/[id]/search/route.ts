import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createErrorResponse } from '@/lib/api';
import { z } from 'zod';

const searchQuerySchema = z.object({
  query: z.string().min(1).max(1000),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minRating: z.number().min(1).max(5).optional(),
  maxRating: z.number().min(1).max(5).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.enum(['rating', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate agent ID
    if (!z.string().uuid().safeParse(params.id).success) {
      return NextResponse.json(
        { error: 'Invalid agent ID format' },
        { status: 400 }
      );
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            subscription_tier: true
          }
        }
      }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Check if user has access to the agent
    if (agent.userId !== session.user.id && agent.access_level !== 'public') {
      if (agent.access_level === 'premium' && session.user.subscription_tier !== 'premium') {
        return NextResponse.json(
          { error: 'Premium subscription required' },
          { status: 403 }
        );
      }
      if (agent.access_level === 'basic' && session.user.subscription_tier !== 'basic') {
        return NextResponse.json(
          { error: 'Basic subscription required' },
          { status: 403 }
        );
      }
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      query: searchParams.get('query'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      minRating: searchParams.get('minRating') ? parseInt(searchParams.get('minRating')!) : undefined,
      maxRating: searchParams.get('maxRating') ? parseInt(searchParams.get('maxRating')!) : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      sortBy: searchParams.get('sortBy') as 'rating' | 'createdAt' | 'updatedAt' | null,
      sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc' | null
    };

    const validatedParams = searchQuerySchema.parse(queryParams);

    // Calculate pagination
    const page = validatedParams.page || 1;
    const limit = validatedParams.limit || 10;
    const skip = (page - 1) * limit;

    // Build search query
    const where = {
      agentId: params.id,
      OR: [
        { comment: { contains: validatedParams.query, mode: 'insensitive' } }
      ],
      ...(validatedParams.startDate && validatedParams.endDate ? {
        createdAt: {
          gte: new Date(validatedParams.startDate),
          lte: new Date(validatedParams.endDate)
        }
      } : {}),
      ...(validatedParams.minRating && validatedParams.maxRating ? {
        rating: {
          gte: validatedParams.minRating,
          lte: validatedParams.maxRating
        }
      } : validatedParams.minRating ? {
        rating: { gte: validatedParams.minRating }
      } : validatedParams.maxRating ? {
        rating: { lte: validatedParams.maxRating }
      } : {})
    };

    // Get total count for pagination
    const total = await prisma.feedback.count({ where });

    // Get feedback entries
    const feedback = await prisma.feedback.findMany({
      where,
      orderBy: {
        [validatedParams.sortBy || 'createdAt']: validatedParams.sortOrder || 'desc'
      },
      skip,
      take: limit
    });

    return NextResponse.json({
      data: feedback,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      metadata: {
        agentId: params.id,
        query: validatedParams.query,
        timeRange: {
          start: validatedParams.startDate,
          end: validatedParams.endDate
        },
        filters: {
          minRating: validatedParams.minRating,
          maxRating: validatedParams.maxRating
        },
        sort: {
          by: validatedParams.sortBy,
          order: validatedParams.sortOrder
        },
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error searching feedback:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }

    const errorResponse = createErrorResponse(error, 'Failed to search feedback');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.status }
    );
  }
} 