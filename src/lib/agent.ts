import { prisma } from './db';
import { Prisma } from '@prisma/client';
import { Agent } from './schema';

export interface CreateAgentInput {
  name: string;
  description: string;
  framework: string;
  fileUrl?: string;
  deployedBy: string;
  modelType: string;
  requirements?: string[];
  version: string;
  source: string;
}

export interface UpdateAgentInput {
  name?: string;
  description?: string;
  framework?: string;
  fileUrl?: string;
  modelType?: string;
  requirements?: string[];
  version?: string;
  source?: string;
}

export interface AgentOptions {
  startDate?: Date;
  endDate?: Date;
  status?: string;
}

export async function createAgent(data: CreateAgentInput) {
  return await prisma.deployment.create({
    data: {
      name: data.name,
      description: data.description,
      framework: data.framework,
      fileUrl: data.fileUrl,
      deployedBy: data.deployedBy,
      modelType: data.modelType,
      requirements: data.requirements,
      version: data.version,
      source: data.source,
    },
  });
}

export async function updateAgent(id: string, data: UpdateAgentInput) {
  return await prisma.deployment.update({
    where: { id },
    data,
  });
}

export async function getAgents(options: AgentOptions = {}) {
  const where: Prisma.DeploymentWhereInput = {};

  if (options.startDate) {
    where.createdAt = { gte: options.startDate };
  }
  if (options.endDate) {
    where.createdAt = { lte: options.endDate };
  }
  if (options.status) {
    where.status = options.status;
  }

  return await prisma.deployment.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function getAgent(id: string) {
  return await prisma.deployment.findUnique({
    where: { id },
  });
}

export async function deleteAgent(id: string) {
  await prisma.deployment.delete({
    where: { id },
  });
}

export async function getAgentDeployments(deploymentId: string) {
  return await prisma.deployment.findMany({
    where: { id: deploymentId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAgentMetrics(deploymentId: string) {
  const metrics = await prisma.agentMetrics.findMany({
    where: { deploymentId },
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

export async function getAgentLogs(deploymentId: string) {
  return await prisma.agentLog.findMany({
    where: { deploymentId },
    orderBy: { timestamp: "desc" },
  });
}

export async function getAgentFeedback(deploymentId: string, options: { startDate?: Date; endDate?: Date } = {}) {
  const where: Prisma.AgentFeedbackWhereInput = { deploymentId };

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