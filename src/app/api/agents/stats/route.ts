import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export const dynamic = 'force-dynamic';

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
      activeAgents,
      totalDownloads
    ] = await Promise.all([
      prisma.deployment.count({ where: { createdBy: session.user.id } }),
      prisma.deployment.count({ where: { createdBy: session.user.id, status: 'active' } }),
      prisma.deployment.aggregate({
        _sum: { downloadCount: true },
        where: { createdBy: session.user.id }
      })
    ]);

    // Placeholder for revenue, replace with actual calculation if available
    const totalRevenue = 0;

    return NextResponse.json({
      totalRevenue,
      totalAgents,
      activeAgents,
      totalDownloads: totalDownloads._sum.downloadCount || 0,
    });
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent stats' },
      { status: 500 }
    );
  }
} 