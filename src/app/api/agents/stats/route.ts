import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [
      totalAgents,
      totalDeployments,
      activeDeployments,
      averageRating,
    ] = await Promise.all([
      prisma.deployment.count(),
      prisma.deployment.count(),
      prisma.deployment.count({ where: { status: 'active' } }),
      prisma.deployment.aggregate({
        _avg: {
          rating: true,
        },
      }),
    ]);

    return NextResponse.json({
      totalAgents,
      totalDeployments,
      activeDeployments,
      averageRating: averageRating._avg.rating || 0,
    });
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent stats' },
      { status: 500 }
    );
  }
} 