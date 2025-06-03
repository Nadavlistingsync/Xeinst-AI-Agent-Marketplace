import { z } from 'zod';
import { prisma } from "./db";
import { DeploymentStatus } from "@prisma/client";
import { Deployment as DeploymentSchema } from './schema';
import JSZip from 'jszip';
import { logAgentEvent } from './agent-monitoring';
import { Prisma } from '@prisma/client';

export const agentValidationSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  modelType: z.string(),
  framework: z.string(),
  requirements: z.string().optional(),
  file_url: z.string().url(),
  source: z.string(),
  version: z.string(),
});

export type AgentValidationType = z.infer<typeof agentValidationSchema>;

export interface AgentDeploymentOptions {
  userId?: string;
  category?: string;
  status?: DeploymentStatus;
  query?: string;
  framework?: string;
  accessLevel?: string;
  licenseType?: string;
}

export async function getAgentDeployments(options: AgentDeploymentOptions = {}) {
  const {
    userId,
    category,
    status,
    query,
    framework,
    accessLevel,
    licenseType,
  } = options;

  const where: Prisma.DeploymentWhereInput = {};

  if (userId) {
    where.deployedBy = userId;
  }

  if (category) {
    where.modelType = category;
  }

  if (status) {
    where.status = status;
  }

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (framework) {
    where.framework = framework;
  }

  if (accessLevel) {
    where.accessLevel = accessLevel;
  }

  if (licenseType) {
    where.licenseType = licenseType;
  }

  const deployments = await prisma.deployment.findMany({
    where,
    include: {
      deployer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      metrics: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return deployments;
}

export async function getAgentDeploymentById(id: string) {
  const deployment = await prisma.deployment.findUnique({
    where: { id },
    include: {
      deployer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      metrics: true,
      logs: {
        orderBy: {
          timestamp: 'desc',
        },
        take: 100,
      },
      feedbacks: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  return deployment;
}

export async function createAgentDeployment(data: AgentValidationType, userId: string) {
  const deployment = await prisma.deployment.create({
    data: {
      name: data.name,
      description: data.description ?? '',
      modelType: data.modelType,
      framework: data.framework,
      fileUrl: data.file_url,
      source: data.source,
      version: data.version,
      deployedBy: userId,
      createdBy: userId,
      status: DeploymentStatus.pending,
      accessLevel: 'public',
      licenseType: 'free',
      environment: 'production',
    },
    include: {
      deployer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  await logAgentEvent(deployment.id, 'info', 'Deployment created', {
    userId,
    deploymentId: deployment.id,
  });

  return deployment;
}

export async function updateAgentDeployment(id: string, data: Partial<AgentValidationType>) {
  const deployment = await prisma.deployment.update({
    where: { id },
    data,
    include: {
      deployer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  await logAgentEvent(deployment.id, 'info', 'Deployment updated', {
    deploymentId: deployment.id,
    updates: data,
  });

  return deployment;
}

export async function deleteAgentDeployment(id: string) {
  const deployment = await prisma.deployment.delete({
    where: { id },
  });

  await logAgentEvent(deployment.id, 'info', 'Deployment deleted', {
    deploymentId: deployment.id,
  });

  return deployment;
}

export async function getAgentLogs(deploymentId: string, options: {
  level?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
} = {}) {
  const { level, startDate, endDate, limit = 100 } = options;

  const where: Prisma.AgentLogWhereInput = {
    deploymentId,
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

  const logs = await prisma.agentLog.findMany({
    where,
    orderBy: {
      timestamp: 'desc',
    },
    take: limit,
  });

  return logs;
}

export async function getAgentMetrics(deploymentId: string) {
  const metrics = await prisma.agentMetrics.findFirst({
    where: { deploymentId },
  });

  return metrics;
}

export async function updateAgentMetrics(deploymentId: string, data: Partial<Prisma.AgentMetricsUpdateInput>) {
  const existing = await prisma.agentMetrics.findFirst({ where: { deploymentId } });
  let metrics;
  if (existing) {
    metrics = await prisma.agentMetrics.update({
      where: { id: existing.id },
      data,
    });
  } else {
    metrics = await prisma.agentMetrics.create({
      data: {
        deploymentId,
        errorRate: typeof data.errorRate === 'number' ? data.errorRate : 0,
        responseTime: typeof data.responseTime === 'number' ? data.responseTime : 0,
        successRate: typeof data.successRate === 'number' ? data.successRate : 0,
        totalRequests: typeof data.totalRequests === 'number' ? data.totalRequests : 0,
        activeUsers: typeof data.activeUsers === 'number' ? data.activeUsers : 0,
        averageResponseTime: typeof data.averageResponseTime === 'number' ? data.averageResponseTime : 0,
        requestsPerMinute: typeof data.requestsPerMinute === 'number' ? data.requestsPerMinute : 0,
        averageTokensUsed: typeof data.averageTokensUsed === 'number' ? data.averageTokensUsed : 0,
        costPerRequest: typeof data.costPerRequest === 'number' ? data.costPerRequest : 0,
        totalCost: typeof data.totalCost === 'number' ? data.totalCost : 0,
      },
    });
  }
  return metrics;
}

export async function getAgentFeedback(deploymentId: string, options: {
  userId?: string;
  minRating?: number;
  maxRating?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
} = {}) {
  const { userId, minRating, maxRating, startDate, endDate, limit = 100 } = options;

  const where: Prisma.AgentFeedbackWhereInput = {
    deploymentId,
  };

  if (userId) {
    where.userId = userId;
  }

  if (minRating !== undefined || maxRating !== undefined) {
    where.rating = {};
    if (minRating !== undefined) {
      where.rating.gte = minRating;
    }
    if (maxRating !== undefined) {
      where.rating.lte = maxRating;
    }
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = startDate;
    }
    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }

  const feedback = await prisma.agentFeedback.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });

  return feedback;
}

export async function createAgentFeedback(data: {
  deploymentId: string;
  userId: string;
  rating: number;
  comment?: string;
}) {
  const feedback = await prisma.agentFeedback.create({
    data,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  await logAgentEvent(data.deploymentId, 'info', 'Feedback created', {
    userId: data.userId,
    feedbackId: feedback.id,
    rating: data.rating,
  });

  return feedback;
}

export async function updateAgentFeedback(id: string, data: {
  rating?: number;
  comment?: string;
  creatorResponse?: string;
}) {
  const feedback = await prisma.agentFeedback.update({
    where: { id },
    data: {
      ...data,
      responseDate: data.creatorResponse ? new Date() : undefined,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  await logAgentEvent(feedback.deploymentId, 'info', 'Feedback updated', {
    feedbackId: feedback.id,
    updates: data,
  });

  return feedback;
}

export async function deleteAgentFeedback(id: string) {
  const feedback = await prisma.agentFeedback.delete({
    where: { id },
  });

  await logAgentEvent(feedback.deploymentId, 'info', 'Feedback deleted', {
    feedbackId: feedback.id,
  });

  return feedback;
}

export async function validateAgentCode(code: string): Promise<boolean> {
  try {
    // Basic validation - check if code is not empty and has required structure
    if (!code || typeof code !== 'string') {
      return false;
    }

    // Add more specific validation logic here
    // For example, check for required functions, proper syntax, etc.
    
    return true;
  } catch (error) {
    console.error('Error validating agent code:', error);
    return false;
  }
}

export async function deployAgent(data: {
  name: string;
  description: string;
  userId: string;
  version: string;
}): Promise<any> {
  const deployment = await prisma.deployment.create({
    data: {
      name: data.name,
      description: data.description,
      deployedBy: data.userId,
      createdBy: data.userId,
      status: 'active',
      accessLevel: 'public',
      licenseType: 'free',
      environment: 'production',
      modelType: '',
      framework: '',
      source: '',
      fileUrl: '',
    },
  });

  await logAgentEvent(deployment.id, 'info', 'Agent deployed', {
    userId: data.userId,
    deploymentId: deployment.id,
  });

  return deployment;
}

export async function getAgentVersions(deploymentId: string) {
  return prisma.deployment.findMany({
    where: {
      id: deploymentId,
    },
    select: {
      createdAt: true,
      status: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
} 