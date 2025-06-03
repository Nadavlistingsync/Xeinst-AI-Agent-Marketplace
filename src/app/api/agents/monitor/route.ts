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

    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('id');

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: agentId },
      include: {
        deployer: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        metrics: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        logs: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.deployedBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to monitor this agent' },
        { status: 403 }
      );
    }

    const latestMetrics = agent.metrics[0];
    const health = {
      status: agent.status,
      lastChecked: new Date().toISOString(),
      isHealthy: agent.status === 'active',
      metrics: latestMetrics ? {
        errorRate: latestMetrics.errorRate,
        responseTime: latestMetrics.responseTime,
        successRate: latestMetrics.successRate,
        totalRequests: latestMetrics.totalRequests,
        activeUsers: latestMetrics.activeUsers,
        averageResponseTime: latestMetrics.averageResponseTime,
        requestsPerMinute: latestMetrics.requestsPerMinute,
        averageTokensUsed: latestMetrics.averageTokensUsed,
        costPerRequest: latestMetrics.costPerRequest,
        totalCost: latestMetrics.totalCost
      } : null,
      recentLogs: agent.logs.map(log => ({
        level: log.level,
        message: log.message,
        timestamp: log.createdAt
      }))
    };

    return NextResponse.json({
      agent: {
        id: agent.id,
        name: agent.name,
        status: agent.status,
        description: agent.description,
        framework: agent.framework,
        modelType: agent.modelType,
        environment: agent.environment,
        rating: agent.rating,
        totalRatings: agent.totalRatings,
        downloadCount: agent.downloadCount,
        startDate: agent.startDate,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt
      },
      health,
    });
  } catch (error) {
    console.error('Error monitoring agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 