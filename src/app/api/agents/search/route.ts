import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let searchParams: URLSearchParams;
    try {
      const url = new URL(request.url);
      searchParams = url.searchParams;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const query = searchParams.get('query') || '';
    const category = searchParams.get('category');
    const framework = searchParams.get('framework');
    const minRating = searchParams.get('minRating');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'rating';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {
      isPublic: true,
    };

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (framework) {
      where.framework = framework;
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating) };
    }

    if (maxPrice) {
      where.price = { lte: parseFloat(maxPrice) };
    }

    const [total, agents] = await Promise.all([
      prisma.deployment.count({ where }),
      prisma.deployment.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      agents,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error searching agents:', error);
    return NextResponse.json(
      { error: 'Failed to search agents' },
      { status: 500 }
    );
  }
} 