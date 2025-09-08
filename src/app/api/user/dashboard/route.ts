import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        creditsUsed: true,
        creditsPurchased: true,
        earnings: true,
        subscription: true,
        canUploadAgents: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's agents
    const userAgents = await prisma.agent.findMany({
      where: { createdBy: userId },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        status: true,
        totalRuns: true,
        earnings: true,
        createdAt: true,
        _count: {
          select: {
            executions: true,
            reviews: true,
            purchases: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get recent executions
    const recentExecutions = await prisma.agentExecution.findMany({
      where: { userId: userId },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            price: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get recent purchases
    const recentPurchases = await prisma.agentPurchase.findMany({
      where: { userId: userId },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            price: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get earnings breakdown
    const earningsBreakdown = await prisma.earnings.findMany({
      where: { userId: userId },
      include: {
        agent: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // Calculate total stats
    const totalAgentEarnings = userAgents.reduce((sum, agent) => sum + (agent.earnings || 0), 0);
    const totalAgentRuns = userAgents.reduce((sum, agent) => sum + agent.totalRuns, 0);
    const totalAgentPurchases = userAgents.reduce((sum, agent) => sum + agent._count.purchases, 0);

    // Get monthly earnings
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyEarnings = await prisma.earnings.aggregate({
      where: {
        userId: userId,
        createdAt: { gte: currentMonth }
      },
      _sum: { amount: true }
    });

    // Get credit transactions
    const creditTransactions = await prisma.transaction.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        totalAgentEarnings,
        totalAgentRuns,
        totalAgentPurchases,
        monthlyEarnings: monthlyEarnings._sum.amount || 0
      },
      agents: userAgents,
      recentExecutions,
      recentPurchases,
      earningsBreakdown,
      creditTransactions,
      stats: {
        totalAgents: userAgents.length,
        activeAgents: userAgents.filter(a => a.status === 'active').length,
        pendingAgents: userAgents.filter(a => a.status === 'pending').length,
        totalEarnings: totalAgentEarnings,
        totalRuns: totalAgentRuns,
        totalPurchases: totalAgentPurchases,
        monthlyEarnings: monthlyEarnings._sum.amount || 0
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
