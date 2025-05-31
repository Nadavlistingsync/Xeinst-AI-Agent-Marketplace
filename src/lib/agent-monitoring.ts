import { prisma } from './prisma';
import { agentFeedbacks, agentMetrics, agentLogs } from '@/lib/schema';
import { eq, gte, lte, desc, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface AgentMetrics {
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  successRate: number;
  activeUsers: number;
  requestsPerMinute: number;
  averageTokensUsed: number;
  costPerRequest: number;
  totalCost: number;
  lastUpdated: Date;
}

export interface AgentLog {
  id: string;
  agentId: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  metadata: Record<string, any>;
  timestamp: Date;
  created_at: Date;
  updated_at: Date;
}

export interface GetAgentLogsOptions {
  startDate?: Date;
  endDate?: Date;
  level?: 'info' | 'warning' | 'error';
  limit?: number;
}

export async function updateAgentMetrics(agentId: string, data: {
  totalRequests?: number;
  averageResponseTime?: number;
  errorRate?: number;
  successRate?: number;
  activeUsers?: number;
  requestsPerMinute?: number;
  averageTokensUsed?: number;
  costPerRequest?: number;
  totalCost?: number;
}) {
  return prisma.agentMetrics.upsert({
    where: { agentId },
    update: {
      ...data,
      lastUpdated: new Date()
    },
    create: {
      agentId,
      ...data,
      lastUpdated: new Date()
    }
  });
}

export async function logAgentRequest(agentId: string, data: {
  level: string;
  message: string;
  metadata?: any;
}) {
  return prisma.agentLog.create({
    data: {
      agentId,
      ...data,
      timestamp: new Date()
    }
  });
}

export async function getAgentMetrics(agentId: string) {
  const metrics = await prisma.agentMetrics.findUnique({
    where: { agentId }
  });

  if (!metrics) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
      successRate: 0,
      activeUsers: 0,
      requestsPerMinute: 0,
      averageTokensUsed: 0,
      costPerRequest: 0,
      totalCost: 0
    };
  }

  return metrics;
}

export async function getAgentLogs(agentId: string, limit: number = 100) {
  return prisma.agentLog.findMany({
    where: { agentId },
    orderBy: { timestamp: 'desc' },
    take: limit
  });
}

export async function getAgentPerformance(agentId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const logs = await prisma.agentLog.findMany({
    where: {
      agentId,
      timestamp: {
        gte: startDate
      }
    },
    orderBy: {
      timestamp: 'asc'
    }
  });

  const dailyStats = logs.reduce((acc, log) => {
    const date = log.timestamp.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        requests: 0,
        errors: 0,
        totalResponseTime: 0,
        totalTokens: 0
      };
    }

    acc[date].requests++;
    if (log.level === 'error') {
      acc[date].errors++;
    }

    if (log.metadata) {
      if (log.metadata.responseTime) {
        acc[date].totalResponseTime += log.metadata.responseTime;
      }
      if (log.metadata.tokensUsed) {
        acc[date].totalTokens += log.metadata.tokensUsed;
      }
    }

    return acc;
  }, {} as Record<string, {
    requests: number;
    errors: number;
    totalResponseTime: number;
    totalTokens: number;
  }>);

  return Object.entries(dailyStats).map(([date, stats]) => ({
    date,
    requests: stats.requests,
    errorRate: stats.errors / stats.requests,
    averageResponseTime: stats.totalResponseTime / stats.requests,
    averageTokensUsed: stats.totalTokens / stats.requests
  }));
}

export async function getAgentHealth(agentId: string) {
  const metrics = await getAgentMetrics(agentId);
  const recentLogs = await getAgentLogs(agentId, 100);

  const errorRate = metrics.errorRate;
  const responseTime = metrics.averageResponseTime;
  const successRate = metrics.successRate;

  let health = 'healthy';
  let issues: string[] = [];

  if (errorRate > 0.1) {
    health = 'unhealthy';
    issues.push('High error rate');
  }

  if (responseTime > 5000) {
    health = 'degraded';
    issues.push('Slow response time');
  }

  if (successRate < 0.9) {
    health = 'degraded';
    issues.push('Low success rate');
  }

  const recentErrors = recentLogs.filter(log => log.level === 'error');
  if (recentErrors.length > 0) {
    issues.push(`Recent errors: ${recentErrors.length}`);
  }

  return {
    status: health,
    issues,
    metrics: {
      errorRate,
      responseTime,
      successRate,
      totalRequests: metrics.totalRequests,
      activeUsers: metrics.activeUsers
    }
  };
}

export async function getAgentErrors(agentId: string, limit = 50) {
  const logs = await prisma.agentLog.findMany({
    where: and(
      eq(agentLogs.agentId, agentId),
      eq(agentLogs.level, 'error')
    ),
    orderBy: [desc(agentLogs.timestamp)],
    limit
  });
  return logs as AgentLog[];
}

export async function getAgentWarnings(agentId: string, limit = 50) {
  const logs = await prisma.agentLog.findMany({
    where: and(
      eq(agentLogs.agentId, agentId),
      eq(agentLogs.level, 'warning')
    ),
    orderBy: [desc(agentLogs.timestamp)],
    limit
  });
  return logs as AgentLog[];
}

export async function getRecentAgentLogs(limit = 100) {
  const logs = await prisma.agentLog.findMany({
    orderBy: [desc(agentLogs.timestamp)],
    limit
  });
  return logs as AgentLog[];
}

export async function getAgentDeploymentHistory(agentId: string): Promise<any[]> {
  const deploymentHistory = await prisma.agentLog.findMany({
    where: and(
      eq(agentLogs.agentId, agentId),
      eq(agentLogs.level, 'info'),
      eq(agentLogs.message, 'Deployment completed')
    ),
    orderBy: [desc(agentLogs.timestamp)]
  });

  return deploymentHistory;
}

export async function getAgentPerformanceMetrics(agentId: string): Promise<any> {
  const metrics = await getAgentMetrics(agentId);
  const logs = await getAgentLogs(agentId, {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    limit: 100
  });

  const errorCount = logs.filter(log => log.level === 'error').length;
  const warningCount = logs.filter(log => log.level === 'warning').length;

  return {
    metrics,
    errorCount,
    warningCount,
    recentLogs: logs
  };
}

export async function submitAgentFeedback(
  agentId: string,
  userId: string,
  rating: number,
  comment: string | null = null
): Promise<void> {
  await prisma.agentFeedback.create({
    data: {
      id: uuidv4(),
      agentId,
      userId,
      rating,
      comment,
      created_at: new Date(),
      updated_at: new Date()
    }
  });
}

export async function getAgentFeedback(agentId: string, timeRange: { start: Date; end: Date }): Promise<any[]> {
  return prisma.agentFeedback.findMany({
    where: and(
      eq(agentFeedbacks.agentId, agentId),
      gte(agentFeedbacks.created_at, timeRange.start),
      lte(agentFeedbacks.created_at, timeRange.end)
    ),
    orderBy: [desc(agentFeedbacks.created_at)]
  });
}

export async function getAgentDeployments(agentId: string): Promise<any[]> {
  return prisma.agentLog.findMany({
    where: and(
      eq(agentLogs.agentId, agentId),
      eq(agentLogs.level, 'info'),
      eq(agentLogs.message, 'Deployment completed')
    ),
    orderBy: [desc(agentLogs.timestamp)]
  });
} 