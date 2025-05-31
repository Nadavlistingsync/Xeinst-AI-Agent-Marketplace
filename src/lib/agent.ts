import { Prisma } from '@prisma/client';
import prismaClient from './db';
import { Agent } from './schema';

export interface AgentOptions {
  userId?: string;
  category?: string;
  status?: string;
  query?: string;
  framework?: string;
  accessLevel?: string;
  licenseType?: string;
}

export async function createAgent(data: {
  name: string;
  description: string;
  longDescription?: string;
  documentation?: string;
  category: string;
  framework: string;
  requirements: string[];
  source: string;
  version: string;
  createdBy: string;
  accessLevel: string;
  licenseType: string;
  environment: string;
  fileUrl: string;
  imageUrl?: string;
}): Promise<Agent> {
  return await prismaClient.agent.create({
    data: {
      ...data,
      status: 'active',
    },
  });
}

export async function updateAgent(
  id: string,
  data: Partial<Agent>
): Promise<Agent> {
  return await prismaClient.agent.update({
    where: { id },
    data,
  });
}

export async function getAgents(
  options: AgentOptions = {}
): Promise<Agent[]> {
  const where: Prisma.AgentWhereInput = {};

  if (options.userId) where.createdBy = options.userId;
  if (options.category) where.category = options.category;
  if (options.status) where.status = options.status;
  if (options.framework) where.framework = options.framework;
  if (options.accessLevel) where.accessLevel = options.accessLevel;
  if (options.licenseType) where.licenseType = options.licenseType;
  if (options.query) {
    where.OR = [
      { name: { contains: options.query, mode: 'insensitive' } },
      { description: { contains: options.query, mode: 'insensitive' } },
    ];
  }

  return await prismaClient.agent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAgent(id: string): Promise<Agent | null> {
  return await prismaClient.agent.findUnique({
    where: { id },
  });
}

export async function deleteAgent(id: string): Promise<void> {
  await prismaClient.agent.delete({
    where: { id },
  });
}

export async function getAgentDeployments(
  agentId: string,
  options: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<any[]> {
  const where: Prisma.DeploymentWhereInput = { agentId };

  if (options.status) where.status = options.status;
  if (options.startDate) where.startDate = { gte: options.startDate };
  if (options.endDate) where.endDate = { lte: options.endDate };

  return await prismaClient.deployment.findMany({
    where,
    orderBy: { startDate: 'desc' },
    take: options.limit,
  });
}

export async function getAgentMetrics(
  agentId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<any[]> {
  const deployments = await getAgentDeployments(agentId, options);
  const deploymentIds = deployments.map(d => d.id);

  const where: Prisma.AgentMetricsWhereInput = {
    deploymentId: { in: deploymentIds },
  };

  if (options.startDate) where.lastUpdated = { gte: options.startDate };
  if (options.endDate) where.lastUpdated = { lte: options.endDate };

  return await prismaClient.agentMetrics.findMany({
    where,
    orderBy: { lastUpdated: 'desc' },
    take: options.limit,
  });
}

export async function getAgentFeedbacks(
  agentId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<any[]> {
  const where: Prisma.AgentFeedbackWhereInput = { agentId };

  if (options.startDate) where.createdAt = { gte: options.startDate };
  if (options.endDate) where.createdAt = { lte: options.endDate };

  return await prismaClient.agentFeedback.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit,
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
): Promise<any[]> {
  const deployments = await getAgentDeployments(agentId, options);
  const deploymentIds = deployments.map(d => d.id);

  const where: Prisma.AgentLogWhereInput = {
    deploymentId: { in: deploymentIds },
  };

  if (options.level) where.level = options.level;
  if (options.startDate) where.createdAt = { gte: options.startDate };
  if (options.endDate) where.createdAt = { lte: options.endDate };

  return await prismaClient.agentLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  });
} 