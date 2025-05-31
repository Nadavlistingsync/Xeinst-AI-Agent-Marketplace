import { z } from 'zod';
import { prisma } from "./db";
import { Deployment, AgentLog, AgentMetrics, AgentFeedback, Agent } from "@prisma/client";
import { Deployment as DeploymentSchema } from './schema';
import JSZip from 'jszip';
import { logAgentRequest } from './agent-monitoring';

const prismaClient = prisma;

export const agentValidationSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  model_type: z.string(),
  framework: z.string(),
  requirements: z.string().optional(),
  file_url: z.string().url(),
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
        agentId,
        userId,
        status: 'pending',
        startedAt: new Date()
      }
    });

    // Log deployment start
    await logAgentRequest(agentId, {
      level: 'info',
      message: 'Deployment started',
      metadata: { deploymentId: deployment.id }
    });

    // Update agent status
    await prismaClient.agent.update({
      where: { id: agentId },
      data: {
        status: 'deploying',
        lastDeployedAt: new Date()
      }
    });

    // Simulate deployment process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update deployment status
    await prismaClient.deployment.update({
      where: { id: deployment.id },
      data: {
        status: 'completed',
        completedAt: new Date()
      }
    });

    // Update agent status
    await prismaClient.agent.update({
      where: { id: agentId },
      data: {
        status: 'active',
        lastDeployedAt: new Date()
      }
    });

    // Log successful deployment
    await logAgentRequest(agentId, {
      level: 'info',
      message: 'Deployment completed',
      metadata: { deploymentId: deployment.id }
    });

    return deployment;
  } catch (error) {
    // Log deployment failure
    await logAgentRequest(agentId, {
      level: 'error',
      message: 'Deployment failed',
      metadata: { error: error.message }
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
    orderBy: { startedAt: 'desc' },
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
      completedAt: new Date()
    }
  });

  await logAgentRequest(deployment.agentId, {
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
    orderBy: { startedAt: 'desc' },
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
    orderBy: { startedAt: 'desc' },
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

export async function createDeployment(data: DeploymentCreateInput): Promise<Deployment> {
  const deployment = await prismaClient.deployment.create({
    data: {
      agentId: data.agentId,
      deployedBy: data.deployedBy,
      name: data.name,
      description: data.description,
      environment: data.environment,
      config: data.config,
      status: "pending",
      startedAt: new Date(),
    },
  });

  await logAgentRequest(data.agentId, {
    level: "info",
    message: "Deployment created",
    metadata: { deploymentId: deployment.id },
  });

  return deployment;
}

export async function getDeployment(id: string): Promise<Deployment | null> {
  return prismaClient.deployment.findUnique({
    where: { id },
    include: {
      agent: true,
      deployedBy: true,
    },
  });
}

export async function getDeployments(userId: string): Promise<Deployment[]> {
  return prismaClient.deployment.findMany({
    where: { deployedBy: userId },
    orderBy: { startedAt: "desc" },
    include: {
      agent: true,
      deployedBy: true,
    },
  });
}

export async function updateDeployment(id: string, data: DeploymentUpdateInput): Promise<Deployment> {
  const deployment = await prismaClient.deployment.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });

  await logAgentRequest(deployment.agentId, {
    level: "info",
    message: "Deployment updated",
    metadata: { deploymentId: id },
  });

  return deployment;
}

export async function getDeploymentFeedbacks(deploymentId: string): Promise<AgentFeedback[]> {
  return prismaClient.agentFeedback.findMany({
    where: { deploymentId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDeploymentMetrics(deploymentId: string): Promise<AgentMetrics | null> {
  return prismaClient.agentMetrics.findUnique({
    where: { deploymentId },
  });
}

export async function getDeploymentLogs(deploymentId: string): Promise<AgentLog[]> {
  return prismaClient.agentLog.findMany({
    where: { deploymentId },
    orderBy: { timestamp: "desc" },
  });
}

export async function getDeployments(options: {
  userId?: string;
  agentId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<Deployment[]> {
  const { userId, agentId, status, startDate, endDate } = options;

  return prismaClient.deployment.findMany({
    where: {
      ...(userId && { deployedBy: userId }),
      ...(agentId && { agentId }),
      ...(status && { status }),
      ...(startDate && { startedAt: { gte: startDate } }),
      ...(endDate && { startedAt: { lte: endDate } }),
    },
    orderBy: { startedAt: "desc" },
    include: {
      agent: true,
      deployedBy: true,
    },
  });
}

export async function getDeploymentLogs(deploymentId: string, options: {
  level?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): Promise<AgentLog[]> {
  const { level, startDate, endDate, limit = 100 } = options;

  return prismaClient.agentLog.findMany({
    where: {
      deploymentId,
      ...(level && { level }),
      ...(startDate && { timestamp: { gte: startDate } }),
      ...(endDate && { timestamp: { lte: endDate } }),
    },
    orderBy: { timestamp: "desc" },
    take: limit,
  });
}

export async function getDeploymentMetrics(deploymentId: string): Promise<AgentMetrics | null> {
  return prismaClient.agentMetrics.findUnique({
    where: { deploymentId },
  });
}

export async function completeDeployment(id: string): Promise<Deployment> {
  const deployment = await prismaClient.deployment.update({
    where: { id },
    data: {
      status: "completed",
      completedAt: new Date(),
    },
  });

  await logAgentRequest(deployment.agentId, {
    level: "info",
    message: "Deployment completed",
    metadata: { deploymentId: id },
  });

  return deployment;
}

export async function failDeployment(id: string, error: Error): Promise<Deployment> {
  const deployment = await prismaClient.deployment.update({
    where: { id },
    data: {
      status: "failed",
      completedAt: new Date(),
      error: error.message,
    },
  });

  await logAgentRequest(deployment.agentId, {
    level: "error",
    message: "Deployment failed",
    metadata: { error: error.message },
  });

  return deployment;
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

export async function getDeployments(options: {
  query?: string;
  framework?: string;
  accessLevel?: string;
  licenseType?: string;
} = {}): Promise<Deployment[]> {
  const where: any = {};
  
  if (options.query) {
    where.OR = [
      { name: { contains: options.query, mode: 'insensitive' } },
      { description: { contains: options.query, mode: 'insensitive' } }
    ];
  }
  
  if (options.framework) {
    where.framework = options.framework;
  }
  
  if (options.accessLevel) {
    where.accessLevel = options.accessLevel;
  }
  
  if (options.licenseType) {
    where.licenseType = options.licenseType;
  }
  
  return prismaClient.deployment.findMany({
    where,
    include: {
      deployer: true,
      metrics: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function deleteDeployment(id: string): Promise<void> {
  await prismaClient.deployment.delete({
    where: { id }
  });
}

export async function getDeploymentLogs(deploymentId: string, options: {
  level?: string;
  startDate?: Date;
  endDate?: Date;
} = {}): Promise<AgentLog[]> {
  const where: any = { deploymentId };
  
  if (options.level) {
    where.level = options.level;
  }
  
  if (options.startDate || options.endDate) {
    where.createdAt = {};
    if (options.startDate) {
      where.createdAt.gte = options.startDate;
    }
    if (options.endDate) {
      where.createdAt.lte = options.endDate;
    }
  }
  
  return prismaClient.agentLog.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
}

export async function getDeploymentMetrics(deploymentId: string): Promise<AgentMetrics | null> {
  return prismaClient.agentMetrics.findUnique({
    where: { deploymentId }
  });
}

export async function updateDeploymentStatus(
  deploymentId: string,
  status: string,
  metadata?: Record<string, any>
) {
  const deployment = await prismaClient.deployment.update({
    where: { id: deploymentId },
    data: {
      status,
      updatedAt: new Date(),
    },
  });

  await logAgentRequest(deploymentId, {
    type: 'deployment',
    action: 'update_status',
    status,
    metadata,
  });

  return deployment;
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