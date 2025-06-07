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

    // Safely parse URL
    let url: URL;
    try {
      url = new URL(request.url);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request URL' },
        { status: 400 }
      );
    }

    const searchParams = url.searchParams;
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'rating';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where = {
      isPublic: true,
      status: 'published',
      ...(category ? { category } : {}),
      ...(query ? {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query] } }
        ]
      } : {})
    };

    const [agents, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: {
          [sort]: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          createdBy: {
            select: {
              name: true,
              image: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    return NextResponse.json({
      agents,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error searching agents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 