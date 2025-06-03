import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const categoriesSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minCount: z.number().optional().default(1)
});

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

    const { searchParams } = new URL(request.url);
    const validatedParams = categoriesSchema.parse({
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      minCount: searchParams.get('minCount') ? parseInt(searchParams.get('minCount')!) : undefined
    });

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true
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

    if (agent.createdBy !== session.user.id && !agent.isPublic) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const where = {
      agentId: params.id,
      ...(validatedParams.startDate && {
        createdAt: {
          gte: new Date(validatedParams.startDate)
        }
      }),
      ...(validatedParams.endDate && {
        createdAt: {
          lte: new Date(validatedParams.endDate)
        }
      })
    };

    const feedback = await prisma.agentFeedback.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    const categoryCounts: Record<string, number> = {};
    const categorySentiment: Record<string, { positive: number; negative: number; neutral: number }> = {};

    feedback.forEach((item) => {
      if (item.categories) {
        const categories = item.categories as Record<string, number>;
        Object.entries(categories).forEach(([category, value]) => {
          // Update category counts
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;

          // Initialize sentiment tracking for category if not exists
          if (!categorySentiment[category]) {
            categorySentiment[category] = {
              positive: 0,
              negative: 0,
              neutral: 0
            };
          }

          // Update sentiment counts
          if (item.sentimentScore) {
            const score = Number(item.sentimentScore);
            if (score > 0.5) {
              categorySentiment[category].positive++;
            } else if (score < -0.5) {
              categorySentiment[category].negative++;
            } else {
              categorySentiment[category].neutral++;
            }
          }
        });
      }
    });

    // Filter categories by minimum count
    const filteredCategories = Object.entries(categoryCounts)
      .filter(([_, count]) => count >= (validatedParams.minCount || 1))
      .reduce((acc, [category, count]) => {
        acc[category] = {
          count,
          sentiment: categorySentiment[category]
        };
        return acc;
      }, {} as Record<string, { count: number; sentiment: { positive: number; negative: number; neutral: number } }>);

    return NextResponse.json({
      success: true,
      data: {
        categories: filteredCategories,
        totalCategories: Object.keys(filteredCategories).length,
        totalFeedback: feedback.length
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 