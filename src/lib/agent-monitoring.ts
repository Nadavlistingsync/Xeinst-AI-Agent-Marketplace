import { prisma } from '@/lib/prisma';
import { type AgentHealth, type AgentMetrics, type AgentLog, type AgentFeedback, type CreateNotificationInput } from '@/types/agent-monitoring';
import { Prisma, Deployment, DeploymentStatus } from '@prisma/client';
import { z } from 'zod';
import { createNotification as createNotificationHelper } from './notification';
import { JsonValue } from '@prisma/client/runtime/library';

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

export interface GetAgentHealthOptions {
  detailed?: boolean;
  includeMetrics?: boolean;
}

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
      metadata: metadata ? (metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
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
      data: {
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
  } else {
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

export async function getAgentLogs(deploymentId: string, options: GetAgentLogsOptions = {}): Promise<AgentLog[]> {
  const where: Prisma.AgentLogWhereInput = {
    deploymentId,
  };

  if (options.startDate) where.timestamp = { gte: options.startDate };
  if (options.endDate) where.timestamp = { lte: options.endDate };
  if (options.level) where.level = options.level;

  const logs = await prisma.agentLog.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: options.limit,
  });

  return logs.map(log => ({
    id: log.id,
    deploymentId: log.deploymentId,
    level: log.level as 'info' | 'warning' | 'error',
    message: log.message,
    metadata: log.metadata as JsonValue,
    timestamp: log.timestamp,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
  }));
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

  const logs = await getAgentLogs(agentId, { level: 'error' });
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
    deploymentId: log.deploymentId,
    level: log.level as 'info' | 'warning' | 'error',
    message: log.message,
    timestamp: log.timestamp,
    metadata: log.metadata as JsonValue,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt
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
    deploymentId: log.deploymentId,
    level: log.level as 'info' | 'warning' | 'error',
    message: log.message,
    timestamp: log.timestamp,
    metadata: log.metadata as JsonValue,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt
  }));
}

export async function getAgentInfo(deploymentId: string): Promise<AgentLog[]> {
  const logs = await prisma.agentLog.findMany({
    where: {
      deploymentId,
      level: 'info',
    },
    orderBy: { createdAt: 'desc' },
  });
  return logs.map(log => ({
    id: log.id,
    deploymentId: log.deploymentId,
    level: log.level as 'info' | 'warning' | 'error',
    message: log.message,
    timestamp: log.timestamp,
    metadata: log.metadata as JsonValue,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt
  }));
}

export async function getAgentFeedback(deploymentId: string): Promise<AgentFeedback[]> {
  const feedback = await prisma.agentFeedback.findMany({
    where: { deploymentId },
    orderBy: { createdAt: 'desc' },
  });
  return feedback.map(fb => ({
    ...fb,
    sentimentScore: typeof fb.sentimentScore === 'number' ? fb.sentimentScore : 0,
    categories: typeof fb.categories === 'object' && fb.categories !== null ? fb.categories as Record<string, number> : null
  }));
}

export async function createAgentFeedback(data: {
  deploymentId: string;
  userId: string;
  rating: number;
  comment?: string;
  sentimentScore?: number;
  categories?: Record<string, number>;
  metadata?: JsonValue;
}): Promise<AgentFeedback> {
  const validatedData = feedbackSchema.parse(data);
  const fb = await prisma.agentFeedback.create({
    data: {
      deploymentId: validatedData.deploymentId,
      userId: validatedData.userId,
      rating: validatedData.rating,
      comment: validatedData.comment,
      sentimentScore: typeof validatedData.sentimentScore === 'number' ? validatedData.sentimentScore : 0,
      categories: validatedData.categories ? (validatedData.categories as Prisma.InputJsonValue) : undefined,
      metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : undefined,
    },
  });
  return {
    ...fb,
    sentimentScore: typeof fb.sentimentScore === 'number' ? fb.sentimentScore : 0,
    categories: typeof fb.categories === 'object' && fb.categories !== null ? fb.categories as Record<string, number> : null
  };
}

export async function updateAgentHealth(deploymentId: string, health: AgentHealth): Promise<void> {
  await prisma.deployment.update({
    where: { id: deploymentId },
    data: {
      health: health ? (health as unknown as Prisma.InputJsonValue) : undefined,
    },
  });
}

export async function updateDeploymentStatus(
  deploymentId: string,
  status: DeploymentStatus,
  health?: Record<string, any>
): Promise<Deployment> {
  return prisma.deployment.update({
    where: { id: deploymentId },
    data: {
      status,
      health: health ? (health as unknown as Prisma.InputJsonValue) : undefined,
    },
  });
}

export async function addAgentFeedback(data: {
  deploymentId: string;
  userId: string;
  rating: number;
  comment?: string;
  sentimentScore?: number;
  categories?: Record<string, number>;
  metadata?: JsonValue;
}): Promise<AgentFeedback> {
  return createAgentFeedback(data);
}

export async function createNotification(data: CreateNotificationInput) {
  return createNotificationHelper({
    ...data,
    metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : undefined
  });
}

export async function getAgentHealth(deploymentId: string, options: GetAgentHealthOptions = {}): Promise<AgentHealth | null> {
  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
    include: {
      metrics: options.includeMetrics
    }
  });

  if (!deployment) {
    return null;
  }

  const health: AgentHealth = {
    id: deployment.id,
    status: deployment.status,
    lastUpdated: deployment.updatedAt.toISOString(),
    metrics: options.includeMetrics ? {
      errorRate: deployment.metrics?.[0]?.errorRate ?? 0,
      responseTime: deployment.metrics?.[0]?.responseTime ?? 0,
      successRate: deployment.metrics?.[0]?.successRate ?? 0,
      totalRequests: deployment.metrics?.[0]?.totalRequests ?? 0,
      activeUsers: deployment.metrics?.[0]?.activeUsers ?? 0
    } : undefined
  };

  return health;
} 