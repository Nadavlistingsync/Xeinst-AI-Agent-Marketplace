import { prisma } from './db';
import { Prisma, Deployment, DeploymentStatus } from '@prisma/client';

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
  status?: DeploymentStatus;
}

export async function createAgent(data: CreateAgentInput) {
  return await prisma.deployment.create({
    data: {
      name: data.name,
      description: data.description,
      framework: data.framework,
      deployedBy: data.deployedBy,
      modelType: data.modelType,
      requirements: data.requirements,
      version: data.version,
      source: data.source,
      status: DeploymentStatus.pending,
      startDate: new Date(),
      rating: 0,
      totalRatings: 0,
      downloadCount: 0,
      health: Prisma.JsonNull,
    },
  });
}

export async function updateAgent(id: string, data: UpdateAgentInput) {
  return await prisma.deployment.update({
    where: { id },
    data,
  });
}

export async function getAgents(options: AgentOptions = {}): Promise<Deployment[]> {
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

export async function getAgentDeployments(deploymentId: string): Promise<Deployment[]> {
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

export async function createDeployment(data: {
  name: string;
  description: string;
  accessLevel: string;
  licenseType: string;
  environment: string;
  framework: string;
  modelType: string;
  version: string;
  requirements: string[];
  isPublic: boolean;
  createdBy: string;
  earningsSplit: number;
  source: string;
  deployedBy: string;
}) {
  return prisma.deployment.create({
    data: {
      ...data,
      status: DeploymentStatus.pending,
      startDate: new Date(),
      rating: 0,
      totalRatings: 0,
      downloadCount: 0,
      health: Prisma.JsonNull,
    },
  });
}

export async function updateDeployment(id: string, data: Partial<{
  name: string;
  description: string;
  accessLevel: string;
  licenseType: string;
  environment: string;
  framework: string;
  modelType: string;
  version: string;
  requirements: string[];
  isPublic: boolean;
  earningsSplit: number;
  status: DeploymentStatus;
  health: Prisma.InputJsonValue;
}>) {
  return prisma.deployment.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
} 