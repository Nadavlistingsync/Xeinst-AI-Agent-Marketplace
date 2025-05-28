import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      totalRevenue,
      totalAgents,
      activeAgents,
      totalDownloads,
    ] = await Promise.all([
      // Calculate total revenue from earnings
      prisma.earnings.aggregate({
        where: {
          user_id: session.user.id,
          status: 'paid',
        },
        _sum: {
          amount: true,
        },
      }),
      // Count total agents
      prisma.deployment.count({
        where: {
          deployed_by: session.user.id,
        },
      }),
      // Count active agents
      prisma.deployment.count({
        where: {
          deployed_by: session.user.id,
          status: 'active',
        },
      }),
      // Sum total downloads
      prisma.products.aggregate({
        where: {
          uploaded_by: session.user.id,
        },
        _sum: {
          download_count: true,
        },
      }),
    ]);

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      totalAgents,
      activeAgents,
      totalDownloads: totalDownloads._sum.download_count || 0,
    });
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 