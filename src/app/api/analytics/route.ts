import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    const agentId = searchParams.get('agentId');

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get user's agents
    const userAgents = await prisma.agent.findMany({
      where: { createdBy: session.user.id },
      select: { id: true, name: true }
    });

    // Get analytics data
    const [
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      totalRevenue,
      averageExecutionTime,
      executionsByDay,
      topAgents,
      recentExecutions
    ] = await Promise.all([
      // Total executions
      prisma.agentExecution.count({
        where: {
          agent: { createdBy: session.user.id },
          createdAt: { gte: startDate },
          ...(agentId && { agentId })
        }
      }),

      // Successful executions
      prisma.agentExecution.count({
        where: {
          agent: { createdBy: session.user.id },
          status: 'completed',
          createdAt: { gte: startDate },
          ...(agentId && { agentId })
        }
      }),

      // Failed executions
      prisma.agentExecution.count({
        where: {
          agent: { createdBy: session.user.id },
          status: 'failed',
          createdAt: { gte: startDate },
          ...(agentId && { agentId })
        }
      }),

      // Total revenue (80% of agent price for each successful execution)
      prisma.agentExecution.aggregate({
        where: {
          agent: { createdBy: session.user.id },
          status: 'completed',
          createdAt: { gte: startDate },
          ...(agentId && { agentId })
        },
        _sum: {
          executionTime: true
        }
      }).then(async (result) => {
        // Calculate revenue based on agent prices
        const executions = await prisma.agentExecution.findMany({
          where: {
            agent: { createdBy: session.user.id },
            status: 'completed',
            createdAt: { gte: startDate },
            ...(agentId && { agentId })
          },
          include: {
            agent: {
              select: { price: true }
            }
          }
        });
        
        return executions.reduce((sum, exec) => sum + (exec.agent.price * 0.8), 0);
      }),

      // Average execution time
      prisma.agentExecution.aggregate({
        where: {
          agent: { createdBy: session.user.id },
          status: 'completed',
          createdAt: { gte: startDate },
          ...(agentId && { agentId })
        },
        _avg: {
          executionTime: true
        }
      }),

      // Executions by day
      prisma.agentExecution.groupBy({
        by: ['createdAt'],
        where: {
          agent: { createdBy: session.user.id },
          createdAt: { gte: startDate },
          ...(agentId && { agentId })
        },
        _count: {
          id: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      }),

      // Top performing agents
      prisma.agentExecution.groupBy({
        by: ['agentId'],
        where: {
          agent: { createdBy: session.user.id },
          createdAt: { gte: startDate }
        },
        _count: {
          id: true
        },
        _avg: {
          executionTime: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 5
      }),

      // Recent executions
      prisma.agentExecution.findMany({
        where: {
          agent: { createdBy: session.user.id },
          createdAt: { gte: startDate },
          ...(agentId && { agentId })
        },
        include: {
          agent: {
            select: { name: true }
          },
          user: {
            select: { name: true, email: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      })
    ]);

    // Process executions by day data
    const executionsByDayData = executionsByDay.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      count: item._count.id
    }));

    // Process top agents data
    const topAgentsData = await Promise.all(
      topAgents.map(async (agent) => {
        const agentDetails = await prisma.agent.findUnique({
          where: { id: agent.agentId },
          select: { name: true, price: true }
        });
        
        return {
          agentId: agent.agentId,
          name: agentDetails?.name || 'Unknown',
          executions: agent._count.id,
          averageTime: Math.round(agent._avg.executionTime || 0),
          revenue: (agentDetails?.price || 0) * agent._count.id * 0.8
        };
      })
    );

    return NextResponse.json({
      period,
      startDate,
      endDate: now,
      summary: {
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
        totalRevenue,
        averageExecutionTime: Math.round(averageExecutionTime._avg.executionTime || 0)
      },
      charts: {
        executionsByDay: executionsByDayData,
        topAgents: topAgentsData
      },
      recentExecutions: recentExecutions.map(exec => ({
        id: exec.id,
        agentName: exec.agent.name,
        userName: exec.user.name || exec.user.email,
        status: exec.status,
        executionTime: exec.executionTime,
        createdAt: exec.createdAt,
        error: exec.error
      })),
      userAgents
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
