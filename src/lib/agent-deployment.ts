import { z } from 'zod';
import { prisma } from "./db";
import { Deployment, AgentLog, AgentMetrics, AgentFeedback, Agent } from "@prisma/client";
import { Deployment as DeploymentSchema } from './schema';
import JSZip from 'jszip';
import { logAgentEvent } from './agent-monitoring';
import { Prisma } from '@prisma/client';
import prismaClient from './db';

const prismaClient = prisma;

export const agentValidationSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  modelType: z.string(),
  framework: z.string(),
  requirements: z.string().optional(),
  fileUrl: z.string().url(),
  source: z.string(),
  version: z.string(),
});

export type AgentValidationSchema = z.infer<typeof agentValidationSchema>;

export async function validateAgentCode(fileUrl: string): Promise<boolean> {
  try {
    const response = await fetch(fileUrl);
    const code = await response.text();

    // Basic validation checks
    const hasValidImports = /import\s+.*from\s+['"].*['"]/.test(code);
    const hasValidExports = /export\s+(default|const|function|class)/.test(code);
    const hasValidStructure = /class|function|const/.test(code);

    return hasValidImports && hasValidExports && hasValidStructure;
  } catch (error) {
    console.error('Error validating agent code:', error);
    return false;
  }
}

export async function deployAgent(agentId: string, userId: string) {
  try {
    // Create deployment record
    const deployment = await prismaClient.deployment.create({
      data: {
        name: 'New Deployment',
        description: 'Initial deployment',
        framework: 'nodejs',
        requirements: null,
        source: 'local',
        version: '1.0.0',
        deployedBy: userId,
        status: 'pending',
        startDate: new Date(),
        config: {},
      }
    });

    // Log deployment start
    await logAgentEvent({
      level: 'info',
      message: 'Deployment started',
      metadata: { deploymentId: deployment.id }
    });

    // Update agent status
    await prismaClient.agent.update({
      where: { id: agentId },
      data: {
        status: 'deploying',
      }
    });

    // Simulate deployment process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update deployment status
    await prismaClient.deployment.update({
      where: { id: deployment.id },
      data: {
        status: 'completed',
        endDate: new Date()
      }
    });

    // Update agent status
    await prismaClient.agent.update({
      where: { id: agentId },
      data: {
        status: 'active',
      }
    });

    // Log successful deployment
    await logAgentEvent({
      level: 'info',
      message: 'Deployment completed',
      metadata: { deploymentId: deployment.id }
    });

    return deployment;
  } catch (error) {
    // Log deployment failure
    await logAgentEvent({
      level: 'error',
      message: 'Deployment failed',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });

    // Update agent status
    await prismaClient.agent.update({
      where: { id: agentId },
      data: {
        status: 'failed'
      }
    });

    throw error;
  }
}

export async function getAgentDeployments(agentId: string) {
  return prismaClient.deployment.findMany({
    where: { agentId },
    orderBy: { startDate: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });
}

export async function getDeploymentStatus(deploymentId: string) {
  return prismaClient.deployment.findUnique({
    where: { id: deploymentId },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });
}

export async function cancelDeployment(deploymentId: string) {
  const deployment = await prismaClient.deployment.findUnique({
    where: { id: deploymentId }
  });

  if (!deployment) {
    throw new Error('Deployment not found');
  }

  if (deployment.status !== 'pending') {
    throw new Error('Can only cancel pending deployments');
  }

  await prismaClient.deployment.update({
    where: { id: deploymentId },
    data: {
      status: 'cancelled',
      endDate: new Date()
    }
  });

  await logAgentEvent({
    level: 'info',
    message: 'Deployment cancelled',
    metadata: { deploymentId }
  });

  return deployment;
}

export async function getActiveDeployments() {
  return prismaClient.deployment.findMany({
    where: {
      status: 'pending'
    },
    orderBy: { startDate: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      },
      agent: {
        select: {
          name: true,
          description: true
        }
      }
    }
  });
}

export async function getDeploymentHistory(agentId: string, limit = 10) {
  return prismaClient.deployment.findMany({
    where: { agentId },
    orderBy: { startDate: 'desc' },
    take: limit,
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });
}

async function createServerlessFunction({
  name,
  code,
  framework,
  requirements,
}: {
  name: string;
  code: string;
  framework: string;
  requirements?: string;
}): Promise<string> {
  // Create a serverless function using Vercel's API
  const response = await fetch('https://api.vercel.com/v1/functions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VERCEL_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      code,
      framework,
      requirements,
      runtime: framework === 'python' ? 'python3.9' : 'nodejs18.x',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create serverless function');
  }

  const data = await response.json();
  return data.url;
}

export async function stopAgent(
  agentId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const agent = await prismaClient.deployment.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return { success: false, error: 'Agent not found' };
    }

    if (agent.deployed_by !== userId) {
      return { success: false, error: 'Not authorized to stop this agent' };
    }

    // Delete the serverless function
    const functionName = `agent-${agentId}`;
    await deleteServerlessFunction(functionName);

    await prismaClient.deployment.update({
      where: { id: agentId },
      data: { status: 'stopped' },
    });

    return { success: true };
  } catch (error) {
    console.error('Error stopping agent:', error);
    return { success: false, error: 'Failed to stop agent' };
  }
}

async function deleteServerlessFunction(name: string): Promise<void> {
  const response = await fetch(`https://api.vercel.com/v1/functions/${name}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${process.env.VERCEL_API_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete serverless function');
  }
}

export async function createAgentVersion({
  agentId,
  version,
  file_url,
  requirements,
  createdBy,
  changelog,
}: {
  agentId: string;
  version: string;
  file_url: string;
  requirements?: string;
  createdBy: string;
  changelog?: string;
}) {
  return prismaClient.agentVersion.create({
    data: {
      agentId,
      version,
      file_url,
      requirements,
      createdBy,
      changelog,
    },
  });
}

export async function getAgentVersions(agentId: string) {
  return prismaClient.agentVersion.findMany({
    where: { agentId },
    orderBy: { createdAt: 'desc' },
  });
}

interface DeploymentCreateInput {
  agentId: string;
  deployedBy: string;
  name: string;
  description?: string;
  environment: string;
  config: Record<string, any>;
}

interface DeploymentUpdateInput {
  name?: string;
  description?: string;
  environment?: string;
  config?: Record<string, any>;
  status?: "pending" | "running" | "completed" | "failed";
}

export interface DeploymentOptions {
  userId?: string;
  agentId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  query?: string;
  framework?: string;
  accessLevel?: string;
  licenseType?: string;
}

export async function createDeployment(data: DeploymentSchema): Promise<Deployment> {
  return await prismaClient.deployment.create({
    data: {
      name: data.name,
      description: data.description,
      framework: data.framework,
      requirements: data.requirements,
      source: data.source,
      version: data.version,
      deployedBy: data.deployedBy,
      fileUrl: data.fileUrl,
      status: 'pending',
      startDate: new Date(),
      config: data.config || {},
      accessLevel: data.accessLevel,
      licenseType: data.licenseType,
      environment: data.environment,
    }
  });
}

export async function updateDeployment(id: string, data: Partial<DeploymentSchema>): Promise<Deployment> {
  return await prismaClient.deployment.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date()
    }
  });
}

export async function getDeployment(id: string): Promise<Deployment | null> {
  return await prismaClient.deployment.findUnique({
    where: { id }
  });
}

export async function getDeployments(options: DeploymentOptions = {}): Promise<Deployment[]> {
  const where: any = {};
  
  if (options.agentId) where.agentId = options.agentId;
  if (options.status) where.status = options.status;
  if (options.startDate) where.startDate = { gte: options.startDate };
  if (options.endDate) where.endDate = { lte: options.endDate };
  if (options.framework) where.framework = options.framework;
  if (options.accessLevel) where.accessLevel = options.accessLevel;
  if (options.licenseType) where.licenseType = options.licenseType;

  return await prismaClient.deployment.findMany({
    where,
    orderBy: { startDate: 'desc' }
  });
}

export async function getDeploymentLogs(deploymentId: string): Promise<AgentLog[]> {
  return await prismaClient.agentLog.findMany({
    where: { deploymentId },
    orderBy: { timestamp: 'desc' }
  });
}

export async function getDeploymentMetrics(deploymentId: string): Promise<AgentMetrics | null> {
  return await prismaClient.agentMetrics.findUnique({
    where: { deploymentId }
  });
}

export async function getDeploymentFeedbacks(deploymentId: string): Promise<AgentFeedback[]> {
  const feedbacks = await prismaClient.agentFeedback.findMany({
    where: { deploymentId },
    orderBy: { createdAt: 'desc' }
  });
  // Ensure categories and sentimentScore are correct types
  return feedbacks.map(fb => ({
    ...fb,
    sentimentScore: typeof fb.sentimentScore === 'object' && fb.sentimentScore !== null && 'toNumber' in fb.sentimentScore
      ? fb.sentimentScore.toNumber()
      : fb.sentimentScore || 0,
    categories: Array.isArray(fb.categories)
      ? fb.categories
      : typeof fb.categories === 'string'
        ? [fb.categories]
        : [],
  }));
}

export async function updateDeploymentStatus(id: string, status: string): Promise<Deployment> {
  return await prismaClient.deployment.update({
    where: { id },
    data: {
      status,
      ...(status === 'completed' || status === 'failed' ? { endDate: new Date() } : {})
    }
  });
}

export async function getDeploymentAnalytics(deploymentId: string) {
  try {
    const [metrics, logs, feedbacks] = await Promise.all([
      getDeploymentMetrics(deploymentId),
      getDeploymentLogs(deploymentId),
      getDeploymentFeedbacks(deploymentId),
    ]);

    return {
      metrics: metrics || {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        successRate: 0,
        activeUsers: 0,
        cpuUsage: 0,
        memoryUsage: 0,
      },
      logs,
      feedbacks,
    };
  } catch (error) {
    console.error('Error getting deployment analytics:', error);
    throw new Error('Failed to get deployment analytics');
  }
}

export async function getDeploymentVersions(deploymentId: string): Promise<any[]> {
  return prismaClient.deploymentVersion.findMany({
    where: { deploymentId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createDeploymentVersion(deploymentId: string, data: any): Promise<any> {
  return prismaClient.deploymentVersion.create({
    data: {
      deploymentId,
      ...data,
    },
  });
}

export async function getDeploymentVersion(id: string): Promise<any | null> {
  return prismaClient.deploymentVersion.findUnique({
    where: { id },
  });
}

export async function deleteDeployment(id: string): Promise<void> {
  await prismaClient.deployment.delete({
    where: { id }
  });
}

export async function getPublicDeployments(options: {
  skip?: number;
  take?: number;
  orderBy?: any;
}) {
  return prismaClient.deployment.findMany({
    skip: options.skip,
    take: options.take,
    where: {
      accessLevel: 'public',
    },
    orderBy: options.orderBy,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

export async function getDeploymentsByFramework(framework: string) {
  return prismaClient.deployment.findMany({
    where: { framework },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

export async function getDeploymentsByAccessLevel(accessLevel: string) {
  return prismaClient.deployment.findMany({
    where: { accessLevel },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

export async function validateDeploymentAccess(
  deploymentId: string,
  userId: string
) {
  const deployment = await prismaClient.deployment.findUnique({
    where: { id: deploymentId },
  });

  if (!deployment) {
    throw new Error('Deployment not found');
  }

  if (deployment.deployedBy !== userId) {
    throw new Error('Unauthorized access');
  }

  return deployment;
} 