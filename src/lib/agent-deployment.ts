import { z } from 'zod';
import { prisma } from "./db";
import { Deployment, AgentLog, AgentMetrics, AgentFeedback } from "@prisma/client";
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
  user_id?: string;
  category?: string;
  status?: string;
  query?: string;
  framework?: string;
  access_level?: string;
  licenseType?: string;
}

export async function getAgentDeployments(options: AgentDeploymentOptions = {}) {
  const {
    user_id,
    category,
    status,
    query,
    framework,
    access_level,
    licenseType,
  } = options;

  const where: Prisma.DeploymentWhereInput = {};

  if (user_id) {
    where.deployed_by = user_id;
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

  if (access_level) {
    where.access_level = access_level;
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
      created_at: 'desc',
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
          created_at: 'desc',
        },
      },
    },
  });

  return deployment;
}

export async function createAgentDeployment(data: AgentValidationType, user_id: string) {
  const deployment = await prisma.deployment.create({
    data: {
      ...data,
      deployed_by: user_id,
      status: 'pending',
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
    user_id,
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
  const metrics = await prisma.agentMetrics.findUnique({
    where: { deploymentId },
  });

  return metrics;
}

export async function updateAgentMetrics(deploymentId: string, data: Partial<Prisma.AgentMetricsUpdateInput>) {
  const metrics = await prisma.agentMetrics.upsert({
    where: { deploymentId },
    update: data,
    create: {
      deploymentId,
      ...data,
    },
  });

  return metrics;
}

export async function getAgentFeedback(deploymentId: string, options: {
  user_id?: string;
  minRating?: number;
  maxRating?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
} = {}) {
  const { user_id, minRating, maxRating, startDate, endDate, limit = 100 } = options;

  const where: Prisma.AgentFeedbackWhereInput = {
    deploymentId,
  };

  if (user_id) {
    where.user_id = user_id;
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
    where.created_at = {};
    if (startDate) {
      where.created_at.gte = startDate;
    }
    if (endDate) {
      where.created_at.lte = endDate;
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
      created_at: 'desc',
    },
    take: limit,
  });

  return feedback;
}

export async function createAgentFeedback(data: {
  deploymentId: string;
  user_id: string;
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
    user_id: data.user_id,
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
  code: string;
  userId: string;
  version: string;
}): Promise<Deployment> {
  const deployment = await prisma.deployment.create({
    data: {
      name: data.name,
      description: data.description,
      code: data.code,
      deployed_by: data.userId,
      version: data.version,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
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
      version: true,
      created_at: true,
      status: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });
} 