import { prisma } from './db';
import { AgentLog, AgentMetrics, AgentFeedback } from '@prisma/client';
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

export interface LogEntry {
  deploymentId: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  metadata?: Record<string, any>;
}

export interface MetricsUpdate {
  totalRequests?: number;
  averageResponseTime?: number;
  errorRate?: number;
  successRate?: number;
  activeUsers?: number;
}

export async function logAgentRequest(deploymentId: string, log: LogEntry): Promise<AgentLog> {
  return prisma.agentLog.create({
    data: {
      deploymentId,
      level: log.level,
      message: log.message,
      metadata: log.metadata,
      timestamp: new Date(),
    },
  });
}

export async function updateAgentMetrics(deploymentId: string, metrics: MetricsUpdate): Promise<AgentMetrics> {
  return prisma.agentMetrics.upsert({
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

export async function getAgentMetrics(deploymentId: string): Promise<AgentMetrics | null> {
  return prisma.agentMetrics.findUnique({
    where: { deploymentId },
  });
}

export async function getAgentLogs(deploymentId: string, options?: {
  level?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<AgentLog[]> {
  return prisma.agentLog.findMany({
    where: {
      deploymentId,
      ...(options?.level && { level: options.level }),
      ...(options?.startDate && { timestamp: { gte: options.startDate } }),
      ...(options?.endDate && { timestamp: { lte: options.endDate } }),
    },
    orderBy: { timestamp: "desc" },
  });
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
    averageResponseTime: metrics.averageResponseTime || 0,
    errorRate: metrics.errorRate || 0,
    successRate: metrics.successRate || 0,
    totalRequests: metrics.totalRequests || 0,
  };
}

export async function getAgentErrorLogs(deploymentId: string): Promise<AgentLog[]> {
  return prisma.agentLog.findMany({
    where: {
      deploymentId,
      level: "error",
    },
    orderBy: { timestamp: "desc" },
  });
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
    totalRequests: metrics.totalRequests || 0,
    activeUsers: metrics.activeUsers || 0,
    averageResponseTime: metrics.averageResponseTime || 0,
  };
}

export async function getAgentHealth(agentId: string) {
  const metrics = await getAgentMetrics(agentId);
  const recentLogs = await getAgentLogs(agentId, {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    level: 'info',
    limit: 100
  });

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

export async function getAgentFeedbacks(deploymentId: string): Promise<AgentFeedback[]> {
  return prisma.agentFeedback.findMany({
    where: { deploymentId },
    orderBy: { createdAt: "desc" },
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

export async function createAgentFeedback(data: {
  deploymentId: string;
  userId: string;
  rating: number;
  comment?: string;
  sentimentScore?: number;
  categories?: string[];
}): Promise<AgentFeedback> {
  return prisma.agentFeedback.create({
    data: {
      deploymentId: data.deploymentId,
      userId: data.userId,
      rating: data.rating,
      comment: data.comment,
      sentimentScore: data.sentimentScore,
      categories: data.categories,
      createdAt: new Date(),
    },
  });
}

export async function analyzeAgentFeedback(deploymentId: string): Promise<{
  totalRatings: number;
  averageRating: number;
  sentimentScore: number;
  categoryDistribution: Record<string, number>;
}> {
  const feedbacks = await getAgentFeedbacks(deploymentId);
  if (feedbacks.length === 0) {
    return {
      totalRatings: 0,
      averageRating: 0,
      sentimentScore: 0,
      categoryDistribution: {},
    };
  }

  const totalRatings = feedbacks.length;
  const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
  const averageRating = totalRating / totalRatings;

  let totalSentiment = 0;
  let positiveFeedbacks = 0;
  let negativeFeedbacks = 0;
  const categoryCounts: Record<string, number> = {};

  feedbacks.forEach(feedback => {
    if (feedback.sentimentScore) {
      totalSentiment += Number(feedback.sentimentScore);
      if (feedback.sentimentScore > 0.5) {
        positiveFeedbacks++;
      } else if (feedback.sentimentScore < -0.5) {
        negativeFeedbacks++;
      }
    }

    if (feedback.categories && Array.isArray(feedback.categories)) {
      feedback.categories.forEach(category => {
        if (typeof category === "string") {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      });
    }
  });

  const sentimentScore = totalSentiment / totalRatings;
  const categoryDistribution = Object.fromEntries(
    Object.entries(categoryCounts).map(([category, count]) => [
      category,
      count / totalRatings,
    ])
  );

  return {
    totalRatings,
    averageRating,
    sentimentScore,
    categoryDistribution,
  };
} 