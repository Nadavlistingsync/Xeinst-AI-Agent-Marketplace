import { Prisma } from '@prisma/client';
import { prismaClient } from './db';
import { Agent } from './schema';

export interface CreateAgentInput {
  name: string;
  description: string;
  framework: string;
  file_url?: string;
  deployed_by: string;
  modelType: string;
  requirements?: string;
  version: string;
  source: string;
}

export interface UpdateAgentInput {
  name?: string;
  description?: string;
  framework?: string;
  file_url?: string;
  modelType?: string;
  requirements?: string;
  version?: string;
  source?: string;
}

export interface AgentOptions {
  startDate?: Date;
  endDate?: Date;
  status?: string;
}

export async function createAgent(data: CreateAgentInput) {
  return await prismaClient.deployment.create({
    data: {
      name: data.name,
      description: data.description,
      framework: data.framework,
      file_url: data.file_url,
      deployed_by: data.deployed_by,
      modelType: data.modelType,
      requirements: data.requirements,
      version: data.version,
      source: data.source,
    },
  });
}

export async function updateAgent(id: string, data: UpdateAgentInput) {
  return await prismaClient.deployment.update({
    where: { id },
    data,
  });
}

export async function getAgents(options: AgentOptions = {}) {
  const where: Prisma.DeploymentWhereInput = {};

  if (options.startDate) {
    where.created_at = { gte: options.startDate };
  }
  if (options.endDate) {
    where.created_at = { lte: options.endDate };
  }
  if (options.status) {
    where.status = options.status;
  }

  return await prismaClient.deployment.findMany({
    where,
    orderBy: { created_at: "desc" },
  });
}

export async function getAgent(id: string) {
  return await prismaClient.deployment.findUnique({
    where: { id },
  });
}

export async function deleteAgent(id: string) {
  await prismaClient.deployment.delete({
    where: { id },
  });
}

export async function getAgentDeployments(agentId: string) {
  return await prismaClient.deployment.findMany({
    where: { id: agentId },
    orderBy: { created_at: "desc" },
  });
}

export async function getAgentMetrics(agentId: string) {
  const metrics = await prismaClient.agentMetrics.findMany({
    where: { agentId },
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

export async function getAgentLogs(agentId: string) {
  return await prismaClient.agentLog.findMany({
    where: { agentId },
    orderBy: { timestamp: "desc" },
  });
}

export async function getAgentFeedback(agentId: string, options: { startDate?: Date; endDate?: Date } = {}) {
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