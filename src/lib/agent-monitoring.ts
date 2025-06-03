import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { type AgentHealth, type AgentMetrics, type AgentLog } from '@/types/agent';
import { Prisma } from '@prisma/client';
import type { AgentFeedback } from '@/lib/schema';
import { PrismaClient, Deployment, DeploymentStatus } from '@prisma/client';
import { z } from 'zod';
import { createNotification } from './notification';
import { NotificationType, NotificationSeverity } from './types';

const metricsSchema = z.object({
  errorRate: z.number(),
  responseTime: z.number(),
  successRate: z.number(),
  totalRequests: z.number(),
  activeUsers: z.number(),
  averageResponseTime: z.number(),
  requestsPerMinute: z.number(),
  averageTokensUsed: z.number(),
  costPerRequest: z.number(),
  totalCost: z.number(),
  cpuUsage: z.number(),
  memoryUsage: z.number(),
  activeConnections: z.number(),
  deploymentId: z.string(),
});

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().nullable(),
  sentimentScore: z.number().nullable(),
  categories: z.record(z.number()).nullable(),
  deploymentId: z.string(),
  userId: z.string(),
});

const prismaClient = new PrismaClient();

export interface LogEntry {
  level: 'info' | 'warning' | 'error';
  message: string;
  metadata?: Record<string, any>;
}

export interface MetricsData {
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  successRate: number;
  activeUsers: number;
  requestsPerMinute: number;
  averageTokensUsed: number;
  costPerRequest: number;
  totalCost: number;
}

export interface GetAgentLogsOptions {
  startDate?: Date;
  endDate?: Date;
  level?: 'info' | 'warning' | 'error';
  limit?: number;
}

export interface MetricsUpdate {
  totalRequests?: number;
  averageResponseTime?: number;
  errorRate?: number;
  successRate?: number;
  activeUsers?: number;
  requestsPerMinute?: number;
  averageTokensUsed?: number;
  costPerRequest?: number;
  totalCost?: number;
}

export type MonitoringOptions = {
  startDate?: Date;
  endDate?: Date;
  interval?: 'hour' | 'day' | 'week' | 'month';
};

export async function logAgentEvent(
  deploymentId: string,
  level: 'info' | 'warning' | 'error',
  message: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await prisma.agentLog.create({
    data: {
      deploymentId,
      level,
      message,
      metadata: metadata ? (metadata as any) : undefined,
      timestamp: new Date()
    }
  });
}

export async function updateAgentMetrics(deploymentId: string, metrics: Partial<AgentMetrics>): Promise<AgentMetrics> {
  const validatedMetrics = metricsSchema.partial().parse(metrics);
  const existing = await prisma.agentMetrics.findFirst({ where: { deploymentId } });
  if (existing) {
    return prisma.agentMetrics.update({
      where: { id: existing.id },
      data: validatedMetrics,
    });
  } else {
    // Fill all required fields with defaults if not provided
    return prisma.agentMetrics.create({
      data: {
        deploymentId,
        errorRate: validatedMetrics.errorRate ?? 0,
        responseTime: validatedMetrics.responseTime ?? 0,
        successRate: validatedMetrics.successRate ?? 0,
        totalRequests: validatedMetrics.totalRequests ?? 0,
        activeUsers: validatedMetrics.activeUsers ?? 0,
        averageResponseTime: validatedMetrics.averageResponseTime ?? 0,
        requestsPerMinute: validatedMetrics.requestsPerMinute ?? 0,
        averageTokensUsed: validatedMetrics.averageTokensUsed ?? 0,
        costPerRequest: validatedMetrics.costPerRequest ?? 0,
        totalCost: validatedMetrics.totalCost ?? 0,
      },
    });
  }
}

export async function getAgentLogs(
  agentId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    level?: string;
    limit?: number;
  } = {}
): Promise<any[]> {
  const { startDate, endDate, level, limit = 100 } = options;

  const where: Prisma.AgentLogWhereInput = {
    deploymentId: agentId,
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  };

  if (level) {
    where.level = level;
  }

  return prisma.agentLog.findMany({
    where,
    orderBy: {
      createdAt: 'desc'
    },
    take: limit,
  });
}

export async function getAgentMetrics(agentId: string): Promise<AgentMetrics | null> {
  const metrics = await prisma.agentMetrics.findUnique({
    where: { id: agentId },
  });

  return metrics;
}

export async function getAgentAnalytics(agentId: string): Promise<{
  totalRequests: number;
  successRate: number;
  errorRate: number;
  averageResponseTime: number;
  topErrors: string[];
  recentFeedback: AgentFeedback[];
}> {
  const metrics = await getAgentMetrics(agentId);
  const recentFeedback = await getAgentFeedback(agentId);

  if (!metrics) {
    return {
      totalRequests: 0,
      successRate: 0,
      errorRate: 0,
      averageResponseTime: 0,
      topErrors: [],
      recentFeedback: [],
    };
  }

  const logs = await getAgentLogs(agentId, { level: 'error', limit: 10 });
  const topErrors = logs.map(log => log.message);

  return {
    totalRequests: metrics.totalRequests,
    successRate: metrics.successRate,
    errorRate: metrics.errorRate,
    averageResponseTime: metrics.responseTime,
    topErrors,
    recentFeedback,
  };
}

export async function getAgentWarnings(deploymentId: string): Promise<AgentLog[]> {
  const logs = await prisma.agentLog.findMany({
    where: {
      deploymentId,
      level: 'warning',
    },
    orderBy: { createdAt: 'desc' },
  });
  return logs.map(log => ({
    id: log.id,
    level: (log.level === 'info' || log.level === 'warning' || log.level === 'error' ? log.level : 'info') as 'info' | 'warning' | 'error',
    message: log.message,
    timestamp: log.timestamp,
    metadata: log.metadata as Record<string, unknown>
  }));
}

export async function getAgentErrors(deploymentId: string): Promise<AgentLog[]> {
  const logs = await prisma.agentLog.findMany({
    where: {
      deploymentId,
      level: 'error',
    },
    orderBy: { createdAt: 'desc' },
  });
  return logs.map(log => ({
    id: log.id,
    level: (log.level === 'info' || log.level === 'warning' || log.level === 'error' ? log.level : 'info') as 'info' | 'warning' | 'error',
    message: log.message,
    timestamp: log.timestamp,
    metadata: log.metadata as Record<string, unknown>
  }));
}

export async function getAgentInfo(agentId: string): Promise<AgentLog[]> {
  const logs = await prisma.agentLog.findMany({
    where: {
      deploymentId: agentId,
      level: 'info',
    },
    orderBy: { createdAt: 'desc' },
  });
  return logs.map(log => ({
    id: log.id,
    level: (log.level === 'info' || log.level === 'warning' || log.level === 'error' ? log.level : 'info') as 'info' | 'warning' | 'error',
    message: log.message,
    timestamp: log.timestamp,
    metadata: log.metadata as Record<string, unknown>
  }));
}

export async function getAgentFeedback(deploymentId: string): Promise<AgentFeedback[]> {
  const feedback = await prisma.agentFeedback.findMany({
    where: { deploymentId },
    orderBy: { createdAt: 'desc' },
  });
  
  return feedback.map(f => ({
    ...f,
    sentimentScore: f.sentimentScore ?? 0,
    categories: f.categories as Record<string, number> | null,
  }));
}

export async function getAgentPerformanceMetrics(agentId: string) {
  const metrics = await prisma.agentMetrics.findFirst({
    where: { deploymentId: agentId },
    orderBy: { createdAt: 'desc' },
  });

  if (!metrics) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      responseTime: 0,
      errorRate: 0,
      successRate: 0,
      activeUsers: 0,
      requestsPerMinute: 0,
      averageTokensUsed: 0,
      costPerRequest: 0,
      totalCost: 0,
    };
  }

  return {
    totalRequests: metrics.totalRequests || 0,
    averageResponseTime: metrics.responseTime || 0,
    responseTime: metrics.responseTime || 0,
    errorRate: metrics.errorRate || 0,
    successRate: metrics.successRate || 0,
    activeUsers: metrics.activeUsers || 0,
    requestsPerMinute: metrics.requestsPerMinute || 0,
    averageTokensUsed: metrics.averageTokensUsed || 0,
    costPerRequest: metrics.costPerRequest || 0,
    totalCost: metrics.totalCost || 0,
  };
}

export async function getAgentUsageStats(agentId: string): Promise<{
  totalRequests: number;
  activeUsers: number;
  averageResponseTime: number;
  errorRate: number;
  successRate: number;
}> {
  const metrics = await getAgentPerformanceMetrics(agentId);
  
  return {
    totalRequests: metrics.totalRequests,
    activeUsers: metrics.activeUsers,
    averageResponseTime: metrics.responseTime,
    errorRate: metrics.errorRate,
    successRate: metrics.successRate,
  };
}

export async function getAgentHealth(agentId: string): Promise<AgentHealth> {
  const agent = await prisma.deployment.findUnique({
    where: { id: agentId },
    include: {
      metrics: true,
      logs: true
    }
  });

  if (!agent) {
    throw new ApiError('Agent not found', 404);
  }

  const health: AgentHealth = {
    status: 'healthy',
    issues: [],
    metrics: {
      errorRate: 0,
      responseTime: 0,
      successRate: 0,
      totalRequests: 0,
      activeUsers: 0
    }
  };

  // Calculate health metrics
  const metrics = agent.metrics;
  if (metrics && metrics.length > 0) {
    const latestMetrics = metrics[metrics.length - 1];
    health.metrics = {
      errorRate: latestMetrics.errorRate,
      responseTime: latestMetrics.responseTime || 0,
      successRate: latestMetrics.successRate,
      totalRequests: latestMetrics.totalRequests,
      activeUsers: latestMetrics.activeUsers
    };

    // Check for health issues
    if (latestMetrics.errorRate > 0.1) {
      health.status = 'unhealthy';
      health.issues.push('High error rate detected');
    } else if (latestMetrics.errorRate > 0.05) {
      health.status = 'degraded';
      health.issues.push('Elevated error rate');
    }

    if (latestMetrics.responseTime > 1000) {
      health.status = 'unhealthy';
      health.issues.push('High response time');
    } else if (latestMetrics.responseTime > 500) {
      health.status = 'degraded';
      health.issues.push('Elevated response time');
    }
  }

  // Only assign allowed values
  if (health.status !== 'healthy' && health.status !== 'degraded' && health.status !== 'unhealthy') {
    health.status = 'healthy';
  }

  return health;
}

export async function getAgentDeploymentHistory(agentId: string): Promise<any[]> {
  return await prisma.agentLog.findMany({
    where: {
      deploymentId: agentId,
      level: 'info',
      message: 'Deployment completed',
    },
    orderBy: { timestamp: 'desc' },
  });
}

export async function submitAgentFeedback(
  agentId: string,
  userId: string,
  rating: number,
  comment: string | null = null
): Promise<void> {
  await prisma.agentFeedback.create({
    data: {
      deploymentId: agentId,
      userId,
      rating,
      comment,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function getAgentFeedbackStats(deploymentId: string) {
  const feedbacks = await getAgentFeedback(deploymentId);
  if (feedbacks.length === 0) {
    return {
      averageRating: 0,
      totalFeedbacks: 0,
      sentimentDistribution: {},
      categoryDistribution: {},
    };
  }
  const averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
  const sentimentDistribution = feedbacks.reduce((acc, f) => {
    const score = f.sentimentScore ?? 0;
    const key = score < 0 ? 'negative' : score > 0 ? 'positive' : 'neutral';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const categoryDistribution = feedbacks.reduce((acc, f) => {
    const categories = (f.categories as Record<string, number>) || {};
    Object.entries(categories).forEach(([category, value]) => {
      acc[category] = (acc[category] || 0) + value;
    });
    return acc;
  }, {} as Record<string, number>);
  return {
    averageRating,
    totalFeedbacks: feedbacks.length,
    sentimentDistribution,
    categoryDistribution,
  };
}

export async function getAgentDeployments(agentId: string): Promise<any[]> {
  return prisma.agentLog.findMany({
    where: {
      deploymentId: agentId,
      level: 'info',
      message: 'Deployment completed',
    },
    orderBy: { timestamp: 'desc' },
  });
}

export async function createAgentFeedback(data: {
  deploymentId: string;
  userId: string;
  rating: number;
  comment: string | null;
  sentimentScore: number;
  categories: Record<string, number> | null;
}): Promise<AgentFeedback> {
  return prisma.agentFeedback.create({
    data: {
      deploymentId: data.deploymentId,
      userId: data.userId,
      rating: data.rating,
      comment: data.comment,
      sentimentScore: data.sentimentScore,
      categories: data.categories as Prisma.JsonValue,
      metadata: {}
    }
  });
}

export async function updateAgentFeedback(
  id: string,
  data: Partial<{
    rating: number;
    comment: string | null;
    sentimentScore: number;
    categories: Record<string, number> | null;
  }>
): Promise<AgentFeedback> {
  return prisma.agentFeedback.update({
    where: { id },
    data: {
      rating: data.rating,
      comment: data.comment,
      sentimentScore: data.sentimentScore,
      categories: data.categories as Prisma.JsonValue,
      metadata: {}
    }
  });
}

export async function createAgentFeedbackWithResponse(
  deploymentId: string,
  userId: string,
  validatedFeedback: {
    rating: number;
    comment: string | null;
    sentimentScore: number;
    categories: Record<string, number> | null;
  }
): Promise<AgentFeedback> {
  return prisma.agentFeedback.create({
    data: {
      deploymentId,
      userId,
      rating: validatedFeedback.rating,
      comment: validatedFeedback.comment,
      sentimentScore: validatedFeedback.sentimentScore || 0,
      categories: validatedFeedback.categories as any,
      metadata: {}
    }
  });
}

export async function analyzeAgentPerformance(agentId: string) {
  const [metrics, feedbacks, logs] = await Promise.all([
    getAgentPerformanceMetrics(agentId),
    getAgentFeedback(agentId),
    getAgentLogs(agentId),
  ]);

  const performance = {
    metrics,
    feedback: {
      averageRating: 0,
      totalFeedbacks: feedbacks.length,
      sentimentScore: 0,
    },
    logs: {
      totalLogs: logs.length,
      errorCount: logs.filter(log => log.level === 'error').length,
      warningCount: logs.filter(log => log.level === 'warning').length,
    },
    recommendations: [] as string[],
  };

  if (feedbacks.length > 0) {
    performance.feedback.averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
  }

  // Add recommendations based on metrics
  if (metrics.errorRate > 0.1) {
    performance.recommendations.push('High error rate detected. Consider reviewing error logs and improving error handling.');
  }

  if (metrics.responseTime > 1000) {
    performance.recommendations.push('Slow response time detected. Consider optimizing performance.');
  }

  if (performance.feedback.averageRating < 3) {
    performance.recommendations.push('Low user satisfaction. Consider gathering more feedback to identify issues.');
  }

  return performance;
}

export async function monitorAgentHealth(deploymentId: string): Promise<void> {
  const metrics = await getAgentMetrics(deploymentId);
  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
    include: { agent: true }
  });

  if (!deployment) {
    throw new Error('Deployment not found');
  }

  // Check for critical issues
  if (metrics.errorRate > 0.5) {
    await createNotification({
      userId: deployment.agent.createdBy,
      type: 'system_alert' as NotificationType,
      title: 'High Error Rate Detected',
      message: `Your agent "${deployment.name}" is experiencing a high error rate of ${(metrics.errorRate * 100).toFixed(1)}%`,
      severity: 'error' as NotificationSeverity,
      metadata: {
        deploymentId,
        metrics
      }
    });
  }

  if (metrics.sentimentScore < -0.5) {
    await createNotification({
      userId: deployment.agent.createdBy,
      type: 'feedback_alert' as NotificationType,
      title: 'Negative Feedback Alert',
      message: `Your agent "${deployment.name}" is receiving negative feedback`,
      severity: 'warning' as NotificationSeverity,
      metadata: {
        deploymentId,
        metrics
      }
    });
  }
}

export async function getAgentDeploymentStatus(agentId: string) {
  const deployment = await prisma.deployment.findFirst({
    where: { id: agentId },
    orderBy: { createdAt: 'desc' },
  });

  if (!deployment) {
    return {
      status: 'not_deployed' as const,
      lastDeployed: null,
      version: null,
    };
  }

  return {
    status: deployment.status as 'active' | 'inactive' | 'failed',
    lastDeployed: deployment.createdAt,
    version: deployment.version,
  };
}

export async function getAgentDeploymentMetrics(agentId: string) {
  const deployment = await prisma.deployment.findFirst({
    where: { id: agentId },
    orderBy: { createdAt: 'desc' },
  });

  if (!deployment) {
    return null;
  }

  const metrics = await getAgentPerformanceMetrics(agentId);

  return {
    deploymentId: deployment.id,
    status: deployment.status,
    metrics,
    lastUpdated: new Date(),
  };
}

export async function getAgentDeploymentLogs(agentId: string) {
  return await getAgentLogs(agentId);
}

export async function getAgentDeploymentFeedback(agentId: string) {
  return await getAgentFeedback(agentId);
}

export async function analyzeAgentDeployment(agentId: string) {
  const [deployment, metrics, feedbacks, logs] = await Promise.all([
    prisma.deployment.findFirst({
      where: { id: agentId },
      orderBy: { createdAt: 'desc' },
    }),
    getAgentPerformanceMetrics(agentId),
    getAgentFeedback(agentId),
    getAgentLogs(agentId),
  ]);

  if (!deployment) {
    return null;
  }

  const analysis = {
    deploymentId: deployment.id,
    status: deployment.status,
    metrics,
    feedback: {
      averageRating: 0,
      totalFeedbacks: feedbacks.length,
      sentimentScore: 0,
    },
    logs: {
      totalLogs: logs.length,
      errorCount: logs.filter(log => log.level === 'error').length,
      warningCount: logs.filter(log => log.level === 'warning').length,
    },
    recommendations: [] as string[],
  };

  if (feedbacks.length > 0) {
    analysis.feedback.averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
  }

  // Add recommendations based on metrics
  if (metrics.errorRate > 0.1) {
    analysis.recommendations.push('High error rate detected. Consider reviewing error logs and improving error handling.');
  }

  if (metrics.responseTime > 1000) {
    analysis.recommendations.push('Slow response time detected. Consider optimizing performance.');
  }

  if (analysis.feedback.averageRating < 3) {
    analysis.recommendations.push('Low user satisfaction. Consider gathering more feedback to identify issues.');
  }

  return analysis;
}

export async function monitorAgentDeployment(agentId: string) {
  const [deployment, metrics, logs, feedbacks] = await Promise.all([
    prisma.deployment.findFirst({
      where: { id: agentId },
      orderBy: { createdAt: 'desc' },
    }),
    getAgentPerformanceMetrics(agentId),
    getAgentLogs(agentId),
    getAgentFeedback(agentId),
  ]);

  if (!deployment) {
    return null;
  }

  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  const issues: string[] = [];

  // Check error rate
  if (metrics.errorRate > 0.1) {
    status = 'unhealthy';
    issues.push('High error rate detected');
  } else if (metrics.errorRate > 0.05) {
    status = 'degraded';
    issues.push('Elevated error rate');
  }

  // Check response time
  if (metrics.responseTime > 1000) {
    status = 'unhealthy';
    issues.push('Slow response time');
  } else if (metrics.responseTime > 500) {
    status = 'degraded';
    issues.push('Elevated response time');
  }

  // Check recent errors
  const recentErrors = logs.filter(log => 
    log.level === 'error' && 
    log.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );
  if (recentErrors.length > 0) {
    issues.push(`${recentErrors.length} errors in the last 24 hours`);
  }

  // Check user satisfaction
  if (feedbacks.length > 0) {
    const averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
    if (averageRating < 3) {
      issues.push('Low user satisfaction');
    }
  }

  return {
    deploymentId: deployment.id,
    status: deployment.status,
    health: {
      status,
      issues,
      metrics: {
        errorRate: metrics.errorRate,
        responseTime: metrics.responseTime,
        successRate: metrics.successRate,
        totalRequests: metrics.totalRequests,
        activeUsers: metrics.activeUsers,
      },
    },
  };
}

export async function updateAgentDeploymentMetrics(
  agentId: string,
  metrics: z.infer<typeof metricsSchema>
): Promise<AgentMetrics> {
  const validatedMetrics = metricsSchema.parse(metrics);

  return prisma.agentMetrics.upsert({
    where: { id: agentId },
    create: {
      ...validatedMetrics,
      id: agentId,
    },
    update: validatedMetrics,
  });
}

export async function createAgentDeploymentLog(
  agentId: string,
  level: string,
  message: string,
  metadata?: any
) {
  return await prisma.agentLog.create({
    data: {
      deploymentId: agentId,
      level: level as 'info' | 'warning' | 'error',
      message,
      metadata: metadata || {},
      timestamp: new Date(),
    },
  });
}

export async function createAgentDeploymentFeedback(data: {
  deploymentId: string;
  userId: string;
  rating: number;
  comment?: string;
  categories?: string[];
}) {
  return await prisma.agentFeedback.create({
    data: {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function respondToAgentDeploymentFeedback(feedbackId: string, response: string) {
  return await prisma.agentFeedback.update({
    where: { id: feedbackId },
    data: {
      response,
      updatedAt: new Date(),
    },
  });
}

export async function getAgentDeploymentAnalytics(agentId: string) {
  const [deployment, metrics, feedbacks, logs] = await Promise.all([
    prisma.deployment.findFirst({
      where: { id: agentId },
      orderBy: { createdAt: 'desc' },
    }),
    getAgentPerformanceMetrics(agentId),
    getAgentFeedback(agentId),
    getAgentLogs(agentId),
  ]);

  if (!deployment) {
    return null;
  }

  return {
    deploymentId: deployment.id,
    status: deployment.status,
    metrics,
    feedback: {
      averageRating: feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
        : 0,
      totalFeedbacks: feedbacks.length,
    },
    logs: {
      totalLogs: logs.length,
      errorCount: logs.filter(log => log.level === 'error').length,
      warningCount: logs.filter(log => log.level === 'warning').length,
    },
  };
}

export async function updateAgentHealth(
  agentId: string,
  health: AgentHealth
): Promise<void> {
  await prisma.deployment.update({
    where: { id: agentId },
    data: {
      health: health as any // TODO: Update Prisma schema to include health field
    }
  });
}

export interface AgentMetricsData {
  errorRate: number;
  successRate: number;
  activeUsers: number;
  totalRequests: number;
  averageResponseTime: number;
  requestsPerMinute: number;
  averageTokensUsed: number;
  costPerRequest: number;
  totalCost: number;
}

export interface FeedbackMetrics {
  averageRating: number;
  totalFeedbacks: number;
  sentimentScore: number;
  categories: Record<string, number>;
}

export async function getFeedbackMetrics(deploymentId: string): Promise<FeedbackMetrics> {
  const feedbacks = await prisma.agentFeedback.findMany({
    where: { deploymentId },
  });

  const totalFeedbacks = feedbacks.length;
  const averageRating = totalFeedbacks > 0
    ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks
    : 0;

  const sentimentScore = totalFeedbacks > 0
    ? feedbacks.reduce((sum, f) => sum + (f.sentimentScore ? Number(f.sentimentScore) : 0), 0) / totalFeedbacks
    : 0;

  const categories: Record<string, number> = {};
  feedbacks.forEach(feedback => {
    if (feedback.categories) {
      const cats = feedback.categories as Record<string, number>;
      Object.entries(cats).forEach(([key, value]) => {
        categories[key] = (categories[key] || 0) + value;
      });
    }
  });

  return {
    averageRating,
    totalFeedbacks,
    sentimentScore,
    categories,
  };
}

export async function updateDeploymentStatus(
  deploymentId: string,
  status: DeploymentStatus,
  health?: Record<string, any>
): Promise<Deployment> {
  return await prisma.deployment.update({
    where: { id: deploymentId },
    data: {
      status,
      ...(health && { health: health as any }),
    },
  });
}

export async function addAgentFeedback(deploymentId: string, feedback: Partial<AgentFeedback>): Promise<AgentFeedback> {
  const validatedFeedback = feedbackSchema.partial().parse(feedback);
  return prisma.agentFeedback.create({
    data: {
      deploymentId,
      rating: validatedFeedback.rating ?? 0,
      userId: validatedFeedback.userId ?? '',
      comment: validatedFeedback.comment ?? null,
      sentimentScore: validatedFeedback.sentimentScore ?? null,
      categories: validatedFeedback.categories ?? null,
    },
  });
} 