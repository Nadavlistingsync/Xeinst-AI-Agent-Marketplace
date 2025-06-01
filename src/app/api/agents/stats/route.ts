import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createErrorResponse } from '@/lib/api';
import { z } from 'zod';

const statsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  includeDetails: z.boolean().optional(),
});

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      includeDetails: searchParams.get('includeDetails') === 'true'
    };

    const validatedParams = statsQuerySchema.parse(queryParams);

    const dateFilter = validatedParams.startDate && validatedParams.endDate
      ? {
          createdAt: {
            gte: new Date(validatedParams.startDate),
            lte: new Date(validatedParams.endDate)
          }
        }
      : {};

    const [
      totalRevenue,
      totalAgents,
      activeAgents,
      totalDownloads,
      recentActivity
    ] = await Promise.all([
      // Calculate total revenue from earnings
      prisma.earning.aggregate({
        where: {
          userId: session.user.id,
          ...dateFilter
        },
        _sum: {
          amount: true
        }
      }),
      // Count total agents
      prisma.deployment.count({
        where: {
          userId: session.user.id,
          ...dateFilter
        }
      }),
      // Count active agents
      prisma.deployment.count({
        where: {
          userId: session.user.id,
          status: 'active',
          ...dateFilter
        }
      }),
      // Sum total downloads
      prisma.deployment.aggregate({
        where: {
          userId: session.user.id,
          ...dateFilter
        },
        _sum: {
          downloadCount: true
        }
      }),
      // Get recent activity if details are requested
      validatedParams.includeDetails
        ? prisma.deployment.findMany({
            where: {
              userId: session.user.id,
              ...dateFilter
            },
            orderBy: {
              updatedAt: 'desc'
            },
            take: 5,
            select: {
              id: true,
              name: true,
              status: true,
              updatedAt: true,
              downloadCount: true
            }
          })
        : Promise.resolve([])
    ]);

    const response = {
      totalRevenue: totalRevenue._sum.amount || 0,
      totalAgents,
      activeAgents,
      totalDownloads: totalDownloads._sum.downloadCount || 0,
      metadata: {
        timeRange: {
          start: validatedParams.startDate,
          end: validatedParams.endDate
        },
        lastUpdated: new Date().toISOString()
      }
    };

    if (validatedParams.includeDetails) {
      return NextResponse.json({
        ...response,
        recentActivity
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }

    const errorResponse = createErrorResponse(error, 'Failed to fetch agent stats');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.status }
    );
  }
} 