import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { isDatabaseAvailable, createDatabaseErrorResponse } from "../../../../lib/db-check";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    // Check if database is available
    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        createDatabaseErrorResponse(),
        { status: 503 }
      );
    }

  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's agents with usage stats
    const agents = await prisma.agent.findMany({
      where: { createdBy: session.user.id },
      include: {
        reviews: true,
        webhookLogs: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform agents with calculated stats
    const agentsWithStats = agents.map(agent => {
      const usageCount = agent.webhookLogs.length;
      const earnings = usageCount * (agent.price || 0) * 0.7; // 70% to creator
      const averageRating = agent.reviews.length > 0 
        ? agent.reviews.reduce((sum, review) => sum + review.rating, 0) / agent.reviews.length
        : 0;

      return {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        category: agent.category,
        price: agent.price || 0,
        status: agent.status === 'active' ? 'active' : 'inactive',
        usageCount,
        earnings,
        averageRating,
        reviewCount: agent.reviews.length,
        createdAt: agent.createdAt.toISOString()
      };
    });

    return NextResponse.json({
      agents: agentsWithStats,
      total: agentsWithStats.length
    });
  } catch (error) {
    console.error('Error fetching user agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user agents' },
      { status: 500 }
    );
  }
}
