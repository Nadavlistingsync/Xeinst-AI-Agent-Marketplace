import { prisma } from "./prisma";
import { DeploymentStatus, Prisma, AgentLog as PrismaAgentLog, AgentFeedback } from '@prisma/client';
import type { AgentHealth, AgentMetrics, CreateNotificationInput, AgentLog as AgentLogType } from '@/types/agent-monitoring';
import type { Deployment } from '@/types/prisma';
import { z } from 'zod';
import { createNotification as createNotificationHelper } from './notification';
import { JsonValue } from '../types/json';

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

export interface AgentLogWithMetadata extends PrismaAgentLog {
  metadata: Prisma.JsonValue;
}

export interface AgentLog {
  id: string;
  deploymentId: string;
  level: string;
  message: string;
  metadata: JsonValue;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
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

export async function getAgentLogs(
  deploymentId: string,
  options: {
    level?: 'info' | 'error' | 'warning';
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<AgentLogWithMetadata[]> {
  const { level, startDate, endDate, limit = 100 } = options;

  const where: Prisma.AgentLogWhereInput = {
    deploymentId,
    ...(level && { level }),
    ...(startDate && endDate && {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    }),
  };

  const logs = await prisma.agentLog.findMany({
    where,
    orderBy: {
      timestamp: 'desc',
    },
    take: limit,
  });

  return logs.map(log => ({
    ...log,
    metadata: log.metadata || {},
  }));
}

export async function getAgentLogsByLevel(
  deploymentId: string,
  level: 'info' | 'error' | 'warning'
): Promise<AgentLogWithMetadata[]> {
  const logs = await prisma.agentLog.findMany({
    where: {
      deploymentId,
      level,
    },
    orderBy: {
      timestamp: 'desc',
    },
  });

  return logs.map(log => ({
    ...log,
    metadata: log.metadata || {},
  }));
}

export async function getAgentLogsByDateRange(
  deploymentId: string,
  startDate: Date,
  endDate: Date
): Promise<AgentLogWithMetadata[]> {
  const logs = await prisma.agentLog.findMany({
    where: {
      deploymentId,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
  });

  return logs.map(log => ({
    ...log,
    metadata: log.metadata || {},
  }));
}

export async function createAgentLog(
  deploymentId: string,
  level: 'info' | 'error' | 'warning',
  message: string,
  metadata?: Prisma.JsonValue
): Promise<AgentLogWithMetadata> {
  const log = await prisma.agentLog.create({
    data: {
      deploymentId,
      level,
      message,
      metadata: metadata || Prisma.JsonNull,
      timestamp: new Date(),
    },
  });

  return {
    ...log,
    metadata: log.metadata || {},
  };
}

export async function getAgentMetrics(agentId: string): Promise<AgentMetrics | null> {
  return prisma.agentMetrics.findFirst({
    where: { deploymentId: agentId },
  });
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
  const logs = await getAgentLogs(agentId, { level: 'error', limit: 10 });
  const feedback = await getAgentFeedback(agentId);

  return {
    totalRequests: metrics?.totalRequests || 0,
    successRate: metrics?.successRate || 0,
    errorRate: metrics?.errorRate || 0,
    averageResponseTime: metrics?.averageResponseTime || 0,
    topErrors: logs.map(log => log.message),
    recentFeedback: feedback,
  };
}

export async function getAgentWarnings(deploymentId: string): Promise<AgentLogType[]> {
  const rawLogs = await prisma.agentLog.findMany({
    where: {
      deploymentId,
      level: 'warning',
    },
    orderBy: { timestamp: 'desc' },
    take: 50,
  });

  return mapPrismaLogsToAgentLogs(rawLogs);
}

export async function getAgentErrors(deploymentId: string): Promise<AgentLogType[]> {
  const rawLogs = await prisma.agentLog.findMany({
    where: {
      deploymentId,
      level: 'error',
    },
    orderBy: { timestamp: 'desc' },
    take: 50,
  });

  return mapPrismaLogsToAgentLogs(rawLogs);
}

export async function getAgentInfo(deploymentId: string): Promise<AgentLogType[]> {
  const rawLogs = await prisma.agentLog.findMany({
    where: {
      deploymentId,
      level: 'info',
    },
    orderBy: { timestamp: 'desc' },
    take: 50,
  });

  return mapPrismaLogsToAgentLogs(rawLogs);
}

export async function getAgentFeedback(deploymentId: string): Promise<AgentFeedback[]> {
  return prisma.agentFeedback.findMany({
    where: { deploymentId },
    orderBy: { createdAt: 'desc' },
  });
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
  return prisma.agentFeedback.create({
    data: {
      deploymentId: validatedData.deploymentId,
      userId: validatedData.userId,
      rating: validatedData.rating,
      comment: validatedData.comment,
      sentimentScore: validatedData.sentimentScore,
      categories: validatedData.categories ? (validatedData.categories as Prisma.InputJsonValue) : Prisma.JsonNull,
      metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : Prisma.JsonNull
    }
  });
}

export async function updateAgentHealth(deploymentId: string, health: AgentHealth): Promise<void> {
  await prisma.deployment.update({
    where: { id: deploymentId },
    data: { health: health as unknown as Prisma.InputJsonValue }
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
      health: health ? (health as Prisma.InputJsonValue) : undefined,
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
    metadata: data.metadata as Record<string, any>
  });
}

export async function getAgentHealth(deploymentId: string, options: { detailed?: boolean } = {}): Promise<AgentHealth | null> {
  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
    include: {
      metrics: {
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
    },
  });

  if (!deployment) return null;

  const latestMetrics = deployment.metrics[0];
  const metrics = latestMetrics ? {
    errorRate: latestMetrics.errorRate,
    responseTime: latestMetrics.responseTime,
    successRate: latestMetrics.successRate,
    totalRequests: latestMetrics.totalRequests,
    activeUsers: latestMetrics.activeUsers,
  } : {
    errorRate: 0,
    responseTime: 0,
    successRate: 0,
    totalRequests: 0,
    activeUsers: 0,
  };

  let logs: AgentLogType[] = [];
  if (options.detailed) {
    const rawLogs = await prisma.agentLog.findMany({
      where: { deploymentId },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    const validLogs = rawLogs
      .filter(log => isValidLogLevel(log.level) && !!log.deploymentId)
      .map(log => ({
        ...log,
        deploymentId: log.deploymentId as string,
        level: log.level as 'info' | 'warning' | 'error',
      }));

    logs = validLogs;
  }

  return {
    status: deployment.status,
    lastChecked: new Date(),
    metrics,
    logs: logs as unknown as AgentLogType[],
  };
}

interface MonitoringMetrics {
  errorRate: number;
  responseTime: number;
  successRate: number;
  totalRequests: number;
  activeUsers: number;
}

export async function recordMetrics(
  deploymentId: string,
  metrics: MonitoringMetrics
) {
  await updateAgentMetrics(deploymentId, metrics);
}

export interface DeploymentMetrics {
  errorRate: number;
  responseTime: number;
  successRate: number;
  totalRequests: number;
  activeUsers: number;
}

export async function getDeploymentMetrics(deploymentId: string) {
  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
    include: {
      metrics: {
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
    },
  });

  if (!deployment) {
    return {
      errorRate: 0,
      responseTime: 0,
      successRate: 0,
      totalRequests: 0,
      activeUsers: 0,
    };
  }

  const latestMetrics = deployment.metrics[0];
  if (!latestMetrics) {
    return {
      errorRate: 0,
      responseTime: 0,
      successRate: 0,
      totalRequests: 0,
      activeUsers: 0,
    };
  }

  return {
    errorRate: latestMetrics.errorRate,
    responseTime: latestMetrics.responseTime,
    successRate: latestMetrics.successRate,
    totalRequests: latestMetrics.totalRequests,
    activeUsers: latestMetrics.activeUsers,
  };
}

export async function getDeploymentById(id: string) {
  return prisma.deployment.findUnique({
    where: { id },
    include: {
      metrics: true,
    },
  });
}

export async function getDeploymentsByAgent(agentId: string) {
  return prisma.deployment.findMany({
    where: { createdBy: agentId },
    include: {
      metrics: true,
    },
  });
}

export async function getActiveDeployments() {
  return prisma.deployment.findMany({
    where: { status: 'active' },
    include: {
      metrics: true,
    },
  });
}

export async function getDeploymentsByUser(userId: string) {
  return prisma.deployment.findMany({
    where: { createdBy: userId },
    include: {
      metrics: true,
    },
  });
}

type PrismaLog = Omit<PrismaAgentLog, 'level'> & {
  level: string;
};

function isValidLogLevel(level: string): level is 'info' | 'warning' | 'error' {
  return ['info', 'warning', 'error'].includes(level);
}

function mapPrismaLogToAgentLog(log: PrismaLog): AgentLogType | null {
  if (!isValidLogLevel(log.level) || !log.deploymentId) {
    return null;
  }

  return {
    ...log,
    deploymentId: log.deploymentId as string,
    level: log.level
  };
}

function mapPrismaLogsToAgentLogs(logs: PrismaLog[]): AgentLogType[] {
  return logs
    .map(mapPrismaLogToAgentLog)
    .filter((log): log is AgentLogType => log !== null);
} 