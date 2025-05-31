import { PrismaClient } from '@prisma/client';
import { AgentFeedback, AgentLog, AgentMetric } from './schema';
import { eq, gte, lte, desc, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

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

export async function logAgentRequest(
  agentId: string,
  request: any,
  response?: any,
  metadata?: Record<string, any>
) {
  return prisma.agentLog.create({
    data: {
      agentId,
      level: 'info',
      message: 'Agent request processed',
      metadata: {
        request,
        response,
        ...metadata,
      },
      timestamp: new Date(),
    },
  });
}

export async function getAgentMetrics(agentId: string, timeRange?: { start: Date; end: Date }) {
  const logs = await prisma.agentLog.findMany({
    where: {
      agentId,
      timestamp: timeRange
        ? {
            gte: timeRange.start,
            lte: timeRange.end,
          }
        : undefined,
    },
    orderBy: {
      timestamp: 'desc',
    },
  });

  const metrics = {
    totalRequests: logs.length,
    averageResponseTime: 0,
    totalTokens: 0,
    successRate: 0,
    errorRate: 0,
    dailyStats: {} as Record<string, {
      requests: number;
      averageResponseTime: number;
      totalTokens: number;
      successRate: number;
      errorRate: number;
    }>,
  };

  let totalResponseTime = 0;
  let totalTokens = 0;
  let successCount = 0;
  let errorCount = 0;

  logs.forEach(log => {
    const date = log.timestamp.toISOString().split('T')[0];
    if (!metrics.dailyStats[date]) {
      metrics.dailyStats[date] = {
        requests: 0,
        averageResponseTime: 0,
        totalTokens: 0,
        successRate: 0,
        errorRate: 0,
      };
    }

    metrics.dailyStats[date].requests++;

    if (log.metadata?.responseTime) {
      totalResponseTime += log.metadata.responseTime;
      metrics.dailyStats[date].averageResponseTime += log.metadata.responseTime;
    }

    if (log.metadata?.tokensUsed) {
      totalTokens += log.metadata.tokensUsed;
      metrics.dailyStats[date].totalTokens += log.metadata.tokensUsed;
    }

    if (log.level === 'error') {
      errorCount++;
      metrics.dailyStats[date].errorRate++;
    } else {
      successCount++;
      metrics.dailyStats[date].successRate++;
    }
  });

  metrics.averageResponseTime = totalResponseTime / logs.length || 0;
  metrics.totalTokens = totalTokens;
  metrics.successRate = (successCount / logs.length) * 100 || 0;
  metrics.errorRate = (errorCount / logs.length) * 100 || 0;

  Object.values(metrics.dailyStats).forEach(stats => {
    stats.averageResponseTime = stats.averageResponseTime / stats.requests || 0;
    stats.successRate = (stats.successRate / stats.requests) * 100 || 0;
    stats.errorRate = (stats.errorRate / stats.requests) * 100 || 0;
  });

  return metrics;
}

export async function getAgentLogs(
  agentId: string,
  options?: {
    level?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }
) {
  return prisma.agentLog.findMany({
    where: {
      agentId,
      level: options?.level,
      timestamp: {
        gte: options?.startDate,
        lte: options?.endDate,
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
    take: options?.limit,
  });
}

export async function getAgentPerformance(agentId: string) {
  const logs = await prisma.agentLog.findMany({
    where: {
      agentId,
      level: 'info',
      message: 'Deployment completed',
    },
    orderBy: {
      timestamp: 'desc',
    },
  });

  return logs.map(log => ({
    timestamp: log.timestamp,
    responseTime: log.metadata?.responseTime || 0,
    tokensUsed: log.metadata?.tokensUsed || 0,
  }));
}

export async function getAgentHealth(agentId: string) {
  const metrics = await getAgentMetrics(agentId, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date());
  const recentLogs = await getAgentLogs(agentId, {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    level: 'info',
    limit: 100
  });

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

export async function getAgentErrors(agentId: string) {
  return prisma.agentLog.findMany({
    where: {
      agentId,
      level: 'error',
    },
    orderBy: {
      timestamp: 'desc',
    },
  });
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
  const metrics = await getAgentMetrics(agentId, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date());
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

export async function getAgentFeedbacks(
  agentId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }
) {
  return prisma.agentFeedback.findMany({
    where: {
      agentId,
      createdAt: {
        gte: options?.startDate,
        lte: options?.endDate,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: options?.limit,
  });
}

export async function getAgentFeedbackStats(agentId: string) {
  const feedbacks = await prisma.agentFeedback.findMany({
    where: { agentId },
    orderBy: { createdAt: 'desc' },
  });

  const stats = {
    totalFeedbacks: feedbacks.length,
    averageRating: 0,
    sentimentDistribution: {
      positive: 0,
      neutral: 0,
      negative: 0,
    },
    categoryDistribution: {} as Record<string, number>,
  };

  if (feedbacks.length === 0) {
    return stats;
  }

  let totalRating = 0;
  let totalSentiment = 0;

  feedbacks.forEach(feedback => {
    totalRating += feedback.rating;
    totalSentiment += feedback.sentimentScore || 0;

    if (feedback.sentimentScore) {
      if (feedback.sentimentScore > 0.5) {
        stats.sentimentDistribution.positive++;
      } else if (feedback.sentimentScore < -0.5) {
        stats.sentimentDistribution.negative++;
      } else {
        stats.sentimentDistribution.neutral++;
      }
    }

    if (feedback.categories) {
      feedback.categories.forEach(category => {
        stats.categoryDistribution[category] = (stats.categoryDistribution[category] || 0) + 1;
      });
    }
  });

  stats.averageRating = totalRating / feedbacks.length;
  stats.sentimentDistribution.positive = (stats.sentimentDistribution.positive / feedbacks.length) * 100;
  stats.sentimentDistribution.neutral = (stats.sentimentDistribution.neutral / feedbacks.length) * 100;
  stats.sentimentDistribution.negative = (stats.sentimentDistribution.negative / feedbacks.length) * 100;

  return stats;
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