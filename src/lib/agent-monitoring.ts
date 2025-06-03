import { prisma } from './db';
import { Prisma } from '@prisma/client';
import { AgentLog, AgentMetrics, AgentFeedback } from './schema';
import { eq, gte, lte, desc, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { createNotification } from './notification';

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

export interface MonitoringOptions {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export async function logAgentEvent(
  agentId: string,
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  metadata?: Record<string, any>
) {
  return prisma.agentLog.create({
    data: {
      agentId,
      level,
      message,
      metadata: metadata || {},
      timestamp: new Date(),
    },
  });
}

export async function updateAgentMetrics(
  agentId: string,
  data: MetricsUpdate
) {
  return prisma.agentMetrics.upsert({
    where: { agentId },
    update: {
      ...data,
      lastUpdated: new Date(),
    },
    create: {
      agentId,
      ...data,
      lastUpdated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function getAgentLogs(
  agentId: string,
  options: GetAgentLogsOptions = {}
) {
  const { level, startDate, endDate, limit = 100 } = options;

  const where: Prisma.AgentLogWhereInput = {
    agentId,
  };

  if (level) {
    where.level = level;
  }

  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) {
      where.timestamp.gte = startDate;
    }
    if (endDate) {
      where.timestamp.lte = endDate;
    }
  }

  return prisma.agentLog.findMany({
    where,
    orderBy: {
      timestamp: 'desc',
    },
    take: limit,
  });
}

export async function getAgentMetrics(agentId: string, options: MonitoringOptions = {}) {
  const where: Prisma.AgentMetricsWhereInput = { agentId };

  if (options.startDate) {
    where.createdAt = { gte: options.startDate };
  }
  if (options.endDate) {
    where.createdAt = { lte: options.endDate };
  }

  const metrics = await prisma.agentMetrics.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  if (metrics.length === 0) {
    return null;
  }

  return {
    totalRequests: metrics.reduce((sum, m) => sum + (m.totalRequests || 0), 0),
    averageResponseTime: metrics.reduce((sum, m) => sum + (m.averageResponseTime || 0), 0) / metrics.length || 0,
    errorRate: metrics.reduce((sum, m) => sum + (m.errorRate || 0), 0) / metrics.length || 0,
    successRate: metrics.reduce((sum, m) => sum + (m.successRate || 0), 0) / metrics.length || 0,
    activeUsers: metrics.reduce((sum, m) => sum + (m.activeUsers || 0), 0),
    requestsPerMinute: metrics.reduce((sum, m) => sum + (m.requestsPerMinute || 0), 0) / metrics.length || 0,
    averageTokensUsed: metrics.reduce((sum, m) => sum + (m.averageTokensUsed || 0), 0) / metrics.length || 0,
    costPerRequest: metrics.reduce((sum, m) => sum + (m.costPerRequest || 0), 0) / metrics.length || 0,
    totalCost: metrics.reduce((sum, m) => sum + (m.totalCost || 0), 0),
  };
}

export async function getAgentAnalytics(agentId: string) {
  const [metrics, logs] = await Promise.all([
    getAgentMetrics(agentId),
    getAgentLogs(agentId),
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
      lastUpdated: new Date(),
    } : null,
  };
}

export async function getAgentWarnings(agentId: string): Promise<AgentLog[]> {
  return await prisma.agentLog.findMany({
    where: {
      agentId,
      level: 'warning',
    },
    orderBy: { timestamp: 'desc' },
  });
}

export async function getAgentErrors(agentId: string): Promise<AgentLog[]> {
  return await prisma.agentLog.findMany({
    where: {
      agentId,
      level: 'error',
    },
    orderBy: { timestamp: 'desc' },
  });
}

export async function getAgentInfo(agentId: string): Promise<AgentLog[]> {
  return await prisma.agentLog.findMany({
    where: {
      agentId,
      level: 'info',
    },
    orderBy: { timestamp: 'desc' },
  });
}

export async function getAgentFeedback(agentId: string, options: MonitoringOptions = {}) {
  const where: Prisma.AgentFeedbackWhereInput = { agentId };

  if (options.startDate) {
    where.createdAt = { gte: options.startDate };
  }
  if (options.endDate) {
    where.createdAt = { lte: options.endDate };
  }

  return await prisma.agentFeedback.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function getAgentPerformanceMetrics(agentId: string) {
  const metrics = await prisma.agentMetrics.findUnique({
    where: { agentId },
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
      totalCost: 0,
    };
  }

  return {
    totalRequests: metrics.totalRequests || 0,
    averageResponseTime: metrics.averageResponseTime || 0,
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
    averageResponseTime: metrics.averageResponseTime,
    errorRate: metrics.errorRate,
    successRate: metrics.successRate,
  };
}

export async function getAgentHealth(agentId: string) {
  const metrics = await getAgentPerformanceMetrics(agentId);
  const errors = await getAgentErrors(agentId);
  const warnings = await getAgentWarnings(agentId);

  const health = {
    status: 'healthy' as const,
    issues: [] as string[],
    metrics: {
      errorRate: metrics.errorRate,
      responseTime: metrics.averageResponseTime,
      successRate: metrics.successRate,
      totalRequests: metrics.totalRequests,
      activeUsers: metrics.activeUsers,
    },
  };

  if (metrics.errorRate > 0.1) {
    health.status = 'unhealthy';
    health.issues.push('High error rate detected');
  }

  if (metrics.averageResponseTime > 1000) {
    health.status = 'degraded';
    health.issues.push('Slow response time');
  }

  if (errors.length > 0) {
    health.issues.push(`${errors.length} errors in the last period`);
  }

  if (warnings.length > 0) {
    health.issues.push(`${warnings.length} warnings in the last period`);
  }

  return health;
}

export async function getAgentDeploymentHistory(agentId: string): Promise<any[]> {
  return await prisma.deployment.findMany({
    where: and(
      eq(agentLogs.agentId, agentId),
      eq(agentLogs.level, 'info'),
      eq(agentLogs.message, 'Deployment completed')
    ),
    orderBy: [desc(agentLogs.timestamp)]
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
      agentId,
      userId,
      rating,
      comment,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
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

  if (options.startDate) {
    where.createdAt = { gte: options.startDate };
  }
  if (options.endDate) {
    where.createdAt = { lte: options.endDate };
  }

  return await prisma.agentFeedback.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  });
}

export async function getAgentFeedbackStats(agentId: string) {
  const feedbacks = await getAgentFeedbacks(agentId);
  
  if (feedbacks.length === 0) {
    return {
      averageRating: 0,
      totalFeedbacks: 0,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    };
  }

  const ratingDistribution = feedbacks.reduce((acc, feedback) => {
    const rating = Math.round(feedback.rating);
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const averageRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length;

  return {
    averageRating,
    totalFeedbacks: feedbacks.length,
    ratingDistribution,
  };
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
  agentId: string;
  userId: string;
  rating: number;
  comment?: string;
}): Promise<AgentFeedback> {
  return await prisma.agentFeedback.create({
    data: {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function analyzeAgentPerformance(agentId: string) {
  const [metrics, feedbacks, logs] = await Promise.all([
    getAgentPerformanceMetrics(agentId),
    getAgentFeedbacks(agentId),
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

  if (metrics.averageResponseTime > 1000) {
    performance.recommendations.push('Slow response time detected. Consider optimizing performance.');
  }

  if (performance.feedback.averageRating < 3) {
    performance.recommendations.push('Low user satisfaction. Consider gathering more feedback to identify issues.');
  }

  return performance;
}

export async function monitorAgentHealth(agentId: string) {
  const [metrics, logs, feedbacks] = await Promise.all([
    getAgentPerformanceMetrics(agentId),
    getAgentLogs(agentId),
    getAgentFeedbacks(agentId),
  ]);

  const health = {
    status: 'healthy' as const,
    issues: [] as string[],
    metrics: {
      errorRate: metrics.errorRate,
      responseTime: metrics.averageResponseTime,
      successRate: metrics.successRate,
      totalRequests: metrics.totalRequests,
      activeUsers: metrics.activeUsers,
    },
  };

  // Check error rate
  if (metrics.errorRate > 0.1) {
    health.status = 'unhealthy';
    health.issues.push('High error rate detected');
  }

  // Check response time
  if (metrics.averageResponseTime > 1000) {
    health.status = 'degraded';
    health.issues.push('Slow response time');
  }

  // Check recent errors
  const recentErrors = logs.filter(log => 
    log.level === 'error' && 
    log.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );
  if (recentErrors.length > 0) {
    health.issues.push(`${recentErrors.length} errors in the last 24 hours`);
  }

  // Check user satisfaction
  if (feedbacks.length > 0) {
    const averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
    if (averageRating < 3) {
      health.issues.push('Low user satisfaction');
    }
  }

  return health;
}

export async function getAgentDeploymentStatus(agentId: string) {
  const deployment = await prisma.deployment.findFirst({
    where: { agentId },
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
    where: { agentId },
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
      where: { agentId },
      orderBy: { createdAt: 'desc' },
    }),
    getAgentPerformanceMetrics(agentId),
    getAgentFeedbacks(agentId),
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

  if (metrics.averageResponseTime > 1000) {
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
      where: { agentId },
      orderBy: { createdAt: 'desc' },
    }),
    getAgentPerformanceMetrics(agentId),
    getAgentLogs(agentId),
    getAgentFeedbacks(agentId),
  ]);

  if (!deployment) {
    return null;
  }

  const health = {
    deploymentId: deployment.id,
    status: deployment.status,
    health: {
      status: 'healthy' as const,
      issues: [] as string[],
      metrics: {
        errorRate: metrics.errorRate,
        responseTime: metrics.averageResponseTime,
        successRate: metrics.successRate,
        totalRequests: metrics.totalRequests,
        activeUsers: metrics.activeUsers,
      },
    },
  };

  // Check error rate
  if (metrics.errorRate > 0.1) {
    health.health.status = 'unhealthy';
    health.health.issues.push('High error rate detected');
  }

  // Check response time
  if (metrics.averageResponseTime > 1000) {
    health.health.status = 'degraded';
    health.health.issues.push('Slow response time');
  }

  // Check recent errors
  const recentErrors = logs.filter(log => 
    log.level === 'error' && 
    log.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );
  if (recentErrors.length > 0) {
    health.health.issues.push(`${recentErrors.length} errors in the last 24 hours`);
  }

  // Check user satisfaction
  if (feedbacks.length > 0) {
    const averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
    if (averageRating < 3) {
      health.health.issues.push('Low user satisfaction');
    }
  }

  return health;
}

export async function updateAgentDeploymentMetrics(agentId: string, metrics: Partial<AgentMetrics>) {
  return await prisma.agentMetrics.upsert({
    where: { agentId },
    update: {
      ...metrics,
      lastUpdated: new Date(),
    },
    create: {
      agentId,
      ...metrics,
      lastUpdated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
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
      agentId,
      level: level as 'info' | 'warning' | 'error',
      message,
      metadata: metadata || {},
      timestamp: new Date(),
    },
  });
}

export async function createAgentDeploymentFeedback(data: {
  agentId: string;
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
      where: { agentId },
      orderBy: { createdAt: 'desc' },
    }),
    getAgentPerformanceMetrics(agentId),
    getAgentFeedbacks(agentId),
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