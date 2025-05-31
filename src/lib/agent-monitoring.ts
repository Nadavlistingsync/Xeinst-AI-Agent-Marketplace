import { Prisma } from '@prisma/client';
import prismaClient from './db';
import { AgentLog, AgentMetrics, AgentFeedback } from './schema';
import { eq, gte, lte, desc, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface LogEntry {
  level: 'info' | 'warning' | 'error';
  message: string;
  metadata?: Record<string, any>;
}

export interface MetricsData {
  total_requests: number;
  average_response_time: number;
  error_rate: number;
  success_rate: number;
  active_users: number;
  requests_per_minute: number;
  average_tokens_used: number;
  cost_per_request: number;
  total_cost: number;
}

export interface GetAgentLogsOptions {
  start_date?: Date;
  end_date?: Date;
  level?: 'info' | 'warning' | 'error';
  limit?: number;
}

export interface MetricsUpdate {
  total_requests?: number;
  average_response_time?: number;
  error_rate?: number;
  success_rate?: number;
  active_users?: number;
  requests_per_minute?: number;
  average_tokens_used?: number;
  cost_per_request?: number;
  total_cost?: number;
}

export async function logAgentEvent(entry: LogEntry): Promise<void> {
  await prismaClient.agentLog.create({
    data: {
      level: entry.level,
      message: entry.message,
      metadata: entry.metadata || {},
      timestamp: new Date(),
    },
  });
}

export async function updateAgentMetrics(
  deploymentId: string,
  metrics: MetricsData
): Promise<void> {
  await prismaClient.agentMetrics.upsert({
    where: { deploymentId },
    create: {
      deploymentId,
      ...metrics,
      lastUpdated: new Date(),
    },
    update: {
      ...metrics,
      lastUpdated: new Date(),
    },
  });
}

export async function getAgentLogs(deploymentId: string): Promise<AgentLog[]> {
  return await prismaClient.agentLog.findMany({
    where: { deploymentId },
    orderBy: { timestamp: 'desc' },
  });
}

export async function getAgentMetrics(deploymentId: string): Promise<AgentMetrics | null> {
  return await prismaClient.agentMetrics.findUnique({
    where: { deploymentId },
  });
}

export async function getAgentAnalytics(deploymentId: string) {
  const [metrics, logs] = await Promise.all([
    getAgentMetrics(deploymentId),
    getAgentLogs(deploymentId),
  ]);

  return {
    metrics,
    logs,
    summary: metrics ? {
      totalRequests: metrics.totalRequests,
      averageResponseTime: metrics.averageResponseTime,
      errorRate: metrics.errorRate,
      successRate: metrics.successRate,
      activeUsers: metrics.activeUsers,
      cpuUsage: metrics.cpuUsage,
      memoryUsage: metrics.memoryUsage,
      lastUpdated: metrics.lastUpdated,
    } : null,
  };
}

export async function getAgentWarnings(deploymentId: string): Promise<AgentLog[]> {
  return await prismaClient.agentLog.findMany({
    where: {
      deploymentId,
      level: 'warning',
    },
    orderBy: { timestamp: 'desc' },
  });
}

export async function getAgentErrors(deploymentId: string): Promise<AgentLog[]> {
  return await prismaClient.agentLog.findMany({
    where: {
      deploymentId,
      level: 'error',
    },
    orderBy: { timestamp: 'desc' },
  });
}

export async function getAgentInfo(deploymentId: string): Promise<AgentLog[]> {
  return await prismaClient.agentLog.findMany({
    where: {
      deploymentId,
      level: 'info',
    },
    orderBy: { timestamp: 'desc' },
  });
}

export async function getAgentFeedback(deploymentId: string) {
  const feedbacks = await prismaClient.agentFeedback.findMany({
    where: { deploymentId },
    orderBy: { createdAt: 'desc' },
  });

  const totalSentiment = feedbacks.reduce((sum, feedback) => {
    const sentiment = typeof feedback.sentimentScore === 'object' && feedback.sentimentScore !== null && 'toNumber' in feedback.sentimentScore
      ? feedback.sentimentScore.toNumber()
      : feedback.sentimentScore || 0;
    return sum + sentiment;
  }, 0);

  const sentimentAnalysis = {
    positive: 0,
    negative: 0,
    neutral: 0,
    categories: {} as Record<string, number>,
  };

  feedbacks.forEach(feedback => {
    const sentiment = typeof feedback.sentimentScore === 'object' && feedback.sentimentScore !== null && 'toNumber' in feedback.sentimentScore
      ? feedback.sentimentScore.toNumber()
      : feedback.sentimentScore || 0;
    if (sentiment > 0.5) {
      sentimentAnalysis.positive++;
    } else if (sentiment < -0.5) {
      sentimentAnalysis.negative++;
    } else {
      sentimentAnalysis.neutral++;
    }

    const categories = Array.isArray(feedback.categories)
      ? feedback.categories
      : typeof feedback.categories === 'string'
        ? [feedback.categories]
        : [];
    categories.forEach((category: string) => {
      sentimentAnalysis.categories[category] = (sentimentAnalysis.categories[category] || 0) + 1;
    });
  });

  return {
    feedbacks,
    sentimentAnalysis,
    averageSentiment: feedbacks.length > 0 ? totalSentiment / feedbacks.length : 0,
  };
}

export async function getAgentPerformanceMetrics(deploymentId: string): Promise<{
  averageResponseTime: number;
  errorRate: number;
  successRate: number;
  totalRequests: number;
}> {
  const metrics = await getAgentMetrics(deploymentId);
  if (!metrics) {
    return {
      averageResponseTime: 0,
      errorRate: 0,
      successRate: 0,
      totalRequests: 0,
    };
  }

  return {
    averageResponseTime: metrics.averageResponseTime,
    errorRate: metrics.errorRate,
    successRate: metrics.successRate,
    totalRequests: metrics.totalRequests,
  };
}

export async function getAgentUsageStats(deploymentId: string): Promise<{
  totalRequests: number;
  activeUsers: number;
  averageResponseTime: number;
}> {
  const metrics = await getAgentMetrics(deploymentId);
  if (!metrics) {
    return {
      totalRequests: 0,
      activeUsers: 0,
      averageResponseTime: 0,
    };
  }

  return {
    totalRequests: metrics.totalRequests,
    activeUsers: metrics.activeUsers,
    averageResponseTime: metrics.averageResponseTime,
  };
}

export async function getAgentHealth(agentId: string) {
  const metrics = await getAgentMetrics(agentId);
  const recentLogs = await getAgentLogs(agentId);

  const errorRate = metrics?.errorRate || 0;
  const responseTime = metrics?.averageResponseTime || 0;
  const successRate = metrics?.successRate || 0;

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
      totalRequests: metrics?.totalRequests || 0,
      activeUsers: metrics?.activeUsers || 0
    }
  };
}

export async function getAgentDeploymentHistory(agentId: string): Promise<any[]> {
  const deploymentHistory = await prismaClient.agentLog.findMany({
    where: and(
      eq(agentLogs.agentId, agentId),
      eq(agentLogs.level, 'info'),
      eq(agentLogs.message, 'Deployment completed')
    ),
    orderBy: [desc(agentLogs.timestamp)]
  });

  return deploymentHistory;
}

export async function submitAgentFeedback(
  agentId: string,
  userId: string,
  rating: number,
  comment: string | null = null
): Promise<void> {
  await prismaClient.agentFeedback.create({
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
  options: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<AgentFeedback[]> {
  const where: Prisma.AgentFeedbackWhereInput = { agentId };

  if (options.startDate) where.createdAt = { gte: options.startDate };
  if (options.endDate) where.createdAt = { lte: options.endDate };

  return await prismaClient.agentFeedback.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  });
}

export async function getAgentFeedbackStats(agentId: string) {
  const feedbacks = await prismaClient.agentFeedback.findMany({
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
    totalSentiment += feedback.sentimentScore ? Number(feedback.sentimentScore) : 0;

    if (feedback.sentimentScore) {
      if (Number(feedback.sentimentScore) > 0.5) {
        stats.sentimentDistribution.positive++;
      } else if (Number(feedback.sentimentScore) < -0.5) {
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
  return prismaClient.agentLog.findMany({
    where: and(
      eq(agentLogs.agentId, agentId),
      eq(agentLogs.level, 'info'),
      eq(agentLogs.message, 'Deployment completed')
    ),
    orderBy: [desc(agentLogs.timestamp)]
  });
}

export async function createAgentFeedback(data: {
  agentId: string;
  userId: string;
  rating: number;
  comment?: string;
}): Promise<AgentFeedback> {
  return await prismaClient.agentFeedback.create({
    data: {
      agentId: data.agentId,
      userId: data.userId,
      rating: data.rating,
      comment: data.comment,
      createdAt: new Date(),
    },
  });
}

export async function analyzeAgentPerformance(
  deploymentId: string,
  timeRange: { start: Date; end: Date }
): Promise<{
  averageResponseTime: number;
  errorRate: number;
  totalRequests: number;
  successRate: number;
}> {
  const metrics = await prismaClient.agentMetrics.findFirst({
    where: {
      deploymentId,
      lastUpdated: {
        gte: timeRange.start,
        lte: timeRange.end,
      },
    },
  });

  if (!metrics) {
    return {
      averageResponseTime: 0,
      errorRate: 0,
      totalRequests: 0,
      successRate: 0,
    };
  }

  return {
    averageResponseTime: metrics.averageResponseTime,
    errorRate: metrics.errorRate,
    totalRequests: metrics.totalRequests,
    successRate: metrics.successRate,
  };
} 