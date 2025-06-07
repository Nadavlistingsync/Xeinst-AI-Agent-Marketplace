import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const searchTerms = query.split(' ').filter(Boolean);
    const where: any = {
      OR: searchTerms.map(term => ({
        name: {
          contains: term,
          mode: 'insensitive' as const
        }
      }))
    };

    if (category) {
      where.category = category;
    }

    const [agents, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          reviews: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.product.count({ where })
    ]);

    return new Response(JSON.stringify({
      agents,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error searching agents:', error);
    return new Response(JSON.stringify({ error: 'Failed to search agents' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 