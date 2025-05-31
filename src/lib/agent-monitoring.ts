import { Prisma } from '@prisma/client';
import { prismaClient } from './db';
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

export async function logAgentEvent(
  agentId: string,
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  metadata?: Record<string, any>
) {
  return prismaClient.agentLog.create({
    data: {
      agentId,
      level,
      message,
      metadata: metadata || {},
    },
  });
}

export async function updateAgentMetrics(
  agentId: string,
  data: {
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
) {
  return prismaClient.agentMetrics.upsert({
    where: { agentId },
    update: {
      ...data,
      lastUpdated: new Date(),
    },
    create: {
      agentId,
      ...data,
      lastUpdated: new Date(),
    },
  });
}

export async function getAgentLogs(
  agentId: string,
  options: {
    level?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
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

  return prismaClient.agentLog.findMany({
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
    where.created_at = { gte: options.startDate };
  }
  if (options.endDate) {
    where.created_at = { lte: options.endDate };
  }

  const metrics = await prismaClient.agentMetrics.findMany({
    where,
    orderBy: { created_at: "desc" },
  });

  if (metrics.length === 0) {
    return null;
  }

  return {
    totalRequests: metrics.reduce((sum, m) => sum + m.totalRequests, 0),
    averageResponseTime: metrics.reduce((sum, m) => sum + m.averageResponseTime, 0) / metrics.length || 0,
    errorRate: metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length || 0,
    successRate: metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length || 0,
    activeUsers: metrics.reduce((sum, m) => sum + m.activeUsers, 0),
    requestsPerMinute: metrics.reduce((sum, m) => sum + m.requestsPerMinute, 0) / metrics.length || 0,
    averageTokensUsed: metrics.reduce((sum, m) => sum + m.averageTokensUsed, 0) / metrics.length || 0,
    costPerRequest: metrics.reduce((sum, m) => sum + m.costPerRequest, 0) / metrics.length || 0,
    totalCost: metrics.reduce((sum, m) => sum + m.totalCost, 0),
  };
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

export async function getAgentFeedback(agentId: string, options: MonitoringOptions = {}) {
  const where: Prisma.AgentFeedbackWhereInput = { agentId };

  if (options.startDate) {
    where.created_at = { gte: options.startDate };
  }
  if (options.endDate) {
    where.created_at = { lte: options.endDate };
  }

  return await prismaClient.agentFeedback.findMany({
    where,
    orderBy: { created_at: "desc" },
  });
}

export async function getAgentPerformanceMetrics(agentId: string) {
  const metrics = await prismaClient.agentMetrics.findUnique({
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
    totalRequests: metrics.totalRequests,
    averageResponseTime: metrics.averageResponseTime,
    errorRate: metrics.errorRate,
    successRate: metrics.successRate,
    activeUsers: metrics.activeUsers,
    requestsPerMinute: metrics.requestsPerMinute,
    averageTokensUsed: metrics.averageTokensUsed,
    costPerRequest: metrics.costPerRequest,
    totalCost: metrics.totalCost,
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
  user_id: string,
  rating: number,
  comment: string | null = null
): Promise<void> {
  await prismaClient.agentFeedback.create({
    data: {
      id: uuidv4(),
      agentId,
      user_id,
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

  if (options.startDate) where.created_at = { gte: options.startDate };
  if (options.endDate) where.created_at = { lte: options.endDate };

  return await prismaClient.agentFeedback.findMany({
    where,
    orderBy: { created_at: 'desc' },
    take: options.limit,
  });
}

export async function getAgentFeedbackStats(agentId: string) {
  const feedbacks = await prismaClient.agentFeedback.findMany({
    where: { agentId },
    orderBy: { created_at: 'desc' },
  });

  const stats = {
    totalFeedbacks: feedbacks.length,
    average_rating: 0,
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

  stats.average_rating = totalRating / feedbacks.length;
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
  user_id: string;
  rating: number;
  comment?: string;
}): Promise<AgentFeedback> {
  return await prismaClient.agentFeedback.create({
    data: {
      agentId: data.agentId,
      user_id: data.user_id,
      rating: data.rating,
      comment: data.comment,
      created_at: new Date(),
    },
  });
}

export async function analyzeAgentPerformance(agentId: string) {
  const [metrics, logs, feedback] = await Promise.all([
    getAgentMetrics(agentId),
    getAgentLogs(agentId),
    getAgentFeedback(agentId),
  ]);

  if (!metrics) {
    return null;
  }

  const totalFeedbacks = feedback.length;
  const average_rating = feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks || 0;

  const categoryDistribution: Record<string, number> = {};
  feedback.forEach((f) => {
    if (f.categories) {
      const categories = Array.isArray(f.categories) ? f.categories : [f.categories];
      categories.forEach((category) => {
        categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
      });
    }
  });

  const responseRate = feedback.filter((f) => f.creatorResponse).length / totalFeedbacks || 0;
  const averageResponseTime = feedback.reduce((sum, f) => {
    if (f.creatorResponse && f.responseDate) {
      return sum + (f.responseDate.getTime() - f.created_at.getTime());
    }
    return sum;
  }, 0) / feedback.filter((f) => f.creatorResponse && f.responseDate).length || 0;

  return {
    metrics,
    logs,
    feedback: {
      totalFeedbacks,
      average_rating,
      categoryDistribution,
      responseRate,
      averageResponseTime,
    },
  };
}

export async function monitorAgentHealth(agentId: string) {
  const [metrics, logs] = await Promise.all([
    getAgentMetrics(agentId),
    getAgentLogs(agentId, { level: "error" }),
  ]);

  if (!metrics) {
    return null;
  }

  const healthStatus = {
    isHealthy: true,
    issues: [] as string[],
  };

  if (metrics.errorRate > 0.1) {
    healthStatus.isHealthy = false;
    healthStatus.issues.push("High error rate detected");
  }

  if (metrics.averageResponseTime > 5000) {
    healthStatus.isHealthy = false;
    healthStatus.issues.push("Slow response time detected");
  }

  if (metrics.successRate < 0.9) {
    healthStatus.isHealthy = false;
    healthStatus.issues.push("Low success rate detected");
  }

  if (logs.length > 0) {
    healthStatus.isHealthy = false;
    healthStatus.issues.push(`${logs.length} error logs found`);
  }

  return healthStatus;
}

export async function getAgentDeploymentStatus(agentId: string) {
  const deployment = await prismaClient.deployment.findUnique({
    where: { id: agentId },
    include: { metrics: true },
  });

  if (!deployment) {
    return null;
  }

  return {
    status: deployment.status,
    metrics: deployment.metrics,
  };
}

export async function getAgentDeploymentMetrics(agentId: string) {
  const metrics = await prismaClient.agentMetrics.findMany({
    where: { agentId },
    orderBy: { created_at: "desc" },
  });

  if (metrics.length === 0) {
    return null;
  }

  return {
    totalRequests: metrics.reduce((sum, m) => sum + m.totalRequests, 0),
    averageResponseTime: metrics.reduce((sum, m) => sum + m.averageResponseTime, 0) / metrics.length || 0,
    errorRate: metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length || 0,
    successRate: metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length || 0,
    activeUsers: metrics.reduce((sum, m) => sum + m.activeUsers, 0),
    requestsPerMinute: metrics.reduce((sum, m) => sum + m.requestsPerMinute, 0) / metrics.length || 0,
    averageTokensUsed: metrics.reduce((sum, m) => sum + m.averageTokensUsed, 0) / metrics.length || 0,
    costPerRequest: metrics.reduce((sum, m) => sum + m.costPerRequest, 0) / metrics.length || 0,
    totalCost: metrics.reduce((sum, m) => sum + m.totalCost, 0),
  };
}

export async function getAgentDeploymentLogs(agentId: string) {
  return await prismaClient.agentLog.findMany({
    where: { agentId },
    orderBy: { timestamp: "desc" },
  });
}

export async function getAgentDeploymentFeedback(agentId: string) {
  return await prismaClient.agentFeedback.findMany({
    where: { agentId },
    orderBy: { created_at: "desc" },
  });
}

export async function analyzeAgentDeployment(agentId: string) {
  const [metrics, logs, feedback] = await Promise.all([
    getAgentDeploymentMetrics(agentId),
    getAgentDeploymentLogs(agentId),
    getAgentDeploymentFeedback(agentId),
  ]);

  if (!metrics) {
    return null;
  }

  const totalFeedbacks = feedback.length;
  const average_rating = feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks || 0;

  const categoryDistribution: Record<string, number> = {};
  feedback.forEach((f) => {
    if (f.categories) {
      const categories = Array.isArray(f.categories) ? f.categories : [f.categories];
      categories.forEach((category) => {
        categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
      });
    }
  });

  const responseRate = feedback.filter((f) => f.creatorResponse).length / totalFeedbacks || 0;
  const averageResponseTime = feedback.reduce((sum, f) => {
    if (f.creatorResponse && f.responseDate) {
      return sum + (f.responseDate.getTime() - f.created_at.getTime());
    }
    return sum;
  }, 0) / feedback.filter((f) => f.creatorResponse && f.responseDate).length || 0;

  return {
    metrics,
    logs,
    feedback: {
      totalFeedbacks,
      average_rating,
      categoryDistribution,
      responseRate,
      averageResponseTime,
    },
  };
}

export async function monitorAgentDeployment(agentId: string) {
  const [metrics, logs] = await Promise.all([
    getAgentDeploymentMetrics(agentId),
    getAgentDeploymentLogs(agentId, { level: "error" }),
  ]);

  if (!metrics) {
    return null;
  }

  const healthStatus = {
    isHealthy: true,
    issues: [] as string[],
  };

  if (metrics.errorRate > 0.1) {
    healthStatus.isHealthy = false;
    healthStatus.issues.push("High error rate detected");
  }

  if (metrics.averageResponseTime > 5000) {
    healthStatus.isHealthy = false;
    healthStatus.issues.push("Slow response time detected");
  }

  if (metrics.successRate < 0.9) {
    healthStatus.isHealthy = false;
    healthStatus.issues.push("Low success rate detected");
  }

  if (logs.length > 0) {
    healthStatus.isHealthy = false;
    healthStatus.issues.push(`${logs.length} error logs found`);
  }

  return healthStatus;
}

export async function updateAgentDeploymentMetrics(agentId: string, metrics: Partial<AgentMetrics>) {
  return await prismaClient.agentMetrics.upsert({
    where: { agentId },
    create: {
      agentId,
      ...metrics,
    },
    update: metrics,
  });
}

export async function createAgentDeploymentLog(agentId: string, level: string, message: string, metadata?: any) {
  return await prismaClient.agentLog.create({
    data: {
      agentId,
      level,
      message,
      metadata,
      timestamp: new Date(),
    },
  });
}

export async function createAgentDeploymentFeedback(data: {
  agentId: string;
  user_id: string;
  rating: number;
  comment?: string;
  categories?: string[];
}) {
  return await prismaClient.agentFeedback.create({
    data: {
      ...data,
      created_at: new Date(),
    },
  });
}

export async function respondToAgentDeploymentFeedback(feedbackId: string, response: string) {
  return await prismaClient.agentFeedback.update({
    where: { id: feedbackId },
    data: {
      creatorResponse: response,
      responseDate: new Date(),
    },
  });
}

export async function getAgentDeploymentAnalytics(agentId: string) {
  const [metrics, logs, feedback] = await Promise.all([
    getAgentDeploymentMetrics(agentId),
    getAgentDeploymentLogs(agentId),
    getAgentDeploymentFeedback(agentId),
  ]);

  if (!metrics) {
    return null;
  }

  const totalFeedbacks = feedback.length;
  const average_rating = feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks || 0;

  const categoryDistribution: Record<string, number> = {};
  feedback.forEach((f) => {
    if (f.categories) {
      const categories = Array.isArray(f.categories) ? f.categories : [f.categories];
      categories.forEach((category) => {
        categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
      });
    }
  });

  const responseRate = feedback.filter((f) => f.creatorResponse).length / totalFeedbacks || 0;
  const averageResponseTime = feedback.reduce((sum, f) => {
    if (f.creatorResponse && f.responseDate) {
      return sum + (f.responseDate.getTime() - f.created_at.getTime());
    }
    return sum;
  }, 0) / feedback.filter((f) => f.creatorResponse && f.responseDate).length || 0;

  return {
    metrics,
    logs,
    feedback: {
      totalFeedbacks,
      average_rating,
      categoryDistribution,
      responseRate,
      averageResponseTime,
    },
  };
} 