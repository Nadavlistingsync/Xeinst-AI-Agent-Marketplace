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
  type: string;
  capabilities: string[];
  configuration: Record<string, any>;
}): Promise<Agent> {
  try {
    return await prismaClient.agent.create({
      data: {
        ...data,
        status: 'active',
      },
    });
  } catch (error) {
    console.error('Error creating agent:', error);
    throw new Error('Failed to create agent');
  }
}

export async function updateAgent(id: string, data: Partial<Agent>): Promise<Agent> {
  try {
    return await prismaClient.agent.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error updating agent:', error);
    throw new Error('Failed to update agent');
  }
}

export async function getAgents(options: {
  type?: string;
  status?: string;
} = {}): Promise<Agent[]> {
  try {
    const where: Prisma.AgentWhereInput = {};
    
    if (options.type) where.type = options.type;
    if (options.status) where.status = options.status;

    return await prismaClient.agent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error getting agents:', error);
    throw new Error('Failed to get agents');
  }
}

export async function getAgent(id: string): Promise<Agent | null> {
  try {
    return await prismaClient.agent.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error getting agent:', error);
    throw new Error('Failed to get agent');
  }
}

export async function deleteAgent(id: string): Promise<void> {
  try {
    await prismaClient.agent.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting agent:', error);
    throw new Error('Failed to delete agent');
  }
}

export async function getAgentDeployments(agentId: string) {
  try {
    return await prismaClient.deployment.findMany({
      where: { agentId },
      orderBy: { startDate: 'desc' },
    });
  } catch (error) {
    console.error('Error getting agent deployments:', error);
    throw new Error('Failed to get agent deployments');
  }
}

export async function getAgentMetrics(agentId: string) {
  try {
    const deployments = await getAgentDeployments(agentId);
    const deploymentIds = deployments.map(d => d.id);

    const metrics = await prismaClient.agentMetrics.findMany({
      where: {
        agentId: { in: deploymentIds },
      },
    });

    return metrics;
  } catch (error) {
    console.error('Error getting agent metrics:', error);
    throw new Error('Failed to get agent metrics');
  }
}

export async function getAgentLogs(agentId: string) {
  try {
    const deployments = await getAgentDeployments(agentId);
    const deploymentIds = deployments.map(d => d.id);

    return await prismaClient.agentLog.findMany({
      where: {
        agentId: { in: deploymentIds },
      },
      orderBy: { timestamp: 'desc' },
    });
  } catch (error) {
    console.error('Error getting agent logs:', error);
    throw new Error('Failed to get agent logs');
  }
}

export async function getAgentAnalytics(agentId: string) {
  try {
    const [deployments, metrics, logs] = await Promise.all([
      getAgentDeployments(agentId),
      getAgentMetrics(agentId),
      getAgentLogs(agentId),
    ]);

    return {
      deployments,
      metrics,
      logs,
      summary: {
        totalDeployments: deployments.length,
        activeDeployments: deployments.filter(d => d.status === 'active').length,
        totalRequests: metrics.reduce((sum, m) => sum + m.totalRequests, 0),
        averageResponseTime: metrics.reduce((sum, m) => sum + m.averageResponseTime, 0) / metrics.length || 0,
        errorRate: metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length || 0,
        successRate: metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length || 0,
        activeUsers: metrics.reduce((sum, m) => sum + m.activeUsers, 0),
        cpuUsage: metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length || 0,
        memoryUsage: metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length || 0,
      },
    };
  } catch (error) {
    console.error('Error getting agent analytics:', error);
    throw new Error('Failed to get agent analytics');
  }
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