import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's agents and their stats
    const agents = await prisma.agent.findMany({
      where: { createdBy: session.user.id },
      include: {
        reviews: true,
        webhookLogs: true
      }
    });

    // Calculate stats
    const totalAgents = agents.length;
    const totalEarnings = agents.reduce((sum, agent) => {
      // Calculate earnings based on usage (simplified)
      const usageCount = agent.webhookLogs.length;
      return sum + (usageCount * (agent.price || 0) * 0.7); // 70% to creator
    }, 0);

    // For now, we'll estimate total users based on webhook logs
    // In a real implementation, you'd track user IDs in webhook logs
    const totalUsers = agents.reduce((sum, agent) => sum + agent.webhookLogs.length, 0);

    // Monthly earnings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyEarnings = agents.reduce((sum, agent) => {
      const monthlyLogs = agent.webhookLogs.filter(
        log => log.createdAt >= thirtyDaysAgo
      );
      const monthlyUsage = monthlyLogs.length;
      return sum + (monthlyUsage * (agent.price || 0) * 0.7);
    }, 0);

    return NextResponse.json({
      totalAgents,
      totalEarnings,
      totalUsers,
      monthlyEarnings
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
