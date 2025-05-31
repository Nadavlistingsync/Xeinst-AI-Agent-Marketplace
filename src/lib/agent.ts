import { Prisma } from '@prisma/client';
import prismaClient from './db';
import { Agent } from './schema';

export interface AgentOptions {
  user_id?: string;
  category?: string;
  status?: string;
  query?: string;
  framework?: string;
  access_level?: string;
  license_type?: string;
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

export async function getAgentDeployments(agent_id: string) {
  try {
    return await prismaClient.deployment.findMany({
      where: { agent_id },
      orderBy: { start_date: 'desc' },
    });
  } catch (error) {
    console.error('Error getting agent deployments:', error);
    throw new Error('Failed to get agent deployments');
  }
}

export async function getAgentMetrics(agent_id: string) {
  try {
    const deployments = await getAgentDeployments(agent_id);
    const deployment_ids = deployments.map(d => d.id);

    const metrics = await prismaClient.agentMetrics.findMany({
      where: {
        agent_id: { in: deployment_ids },
      },
    });

    return metrics;
  } catch (error) {
    console.error('Error getting agent metrics:', error);
    throw new Error('Failed to get agent metrics');
  }
}

export async function getAgentLogs(agent_id: string) {
  try {
    const deployments = await getAgentDeployments(agent_id);
    const deployment_ids = deployments.map(d => d.id);

    return await prismaClient.agentLog.findMany({
      where: {
        agent_id: { in: deployment_ids },
      },
      orderBy: { timestamp: 'desc' },
    });
  } catch (error) {
    console.error('Error getting agent logs:', error);
    throw new Error('Failed to get agent logs');
  }
}

export async function getAgentAnalytics(agent_id: string) {
  try {
    const [deployments, metrics, logs] = await Promise.all([
      getAgentDeployments(agent_id),
      getAgentMetrics(agent_id),
      getAgentLogs(agent_id),
    ]);

    return {
      deployments,
      metrics,
      logs,
      summary: {
        total_deployments: deployments.length,
        active_deployments: deployments.filter(d => d.status === 'active').length,
        total_requests: metrics.reduce((sum, m) => sum + m.total_requests, 0),
        average_response_time: metrics.reduce((sum, m) => sum + m.average_response_time, 0) / metrics.length || 0,
        error_rate: metrics.reduce((sum, m) => sum + m.error_rate, 0) / metrics.length || 0,
        success_rate: metrics.reduce((sum, m) => sum + m.success_rate, 0) / metrics.length || 0,
        active_users: metrics.reduce((sum, m) => sum + m.active_users, 0),
        cpu_usage: metrics.reduce((sum, m) => sum + m.cpu_usage, 0) / metrics.length || 0,
        memory_usage: metrics.reduce((sum, m) => sum + m.memory_usage, 0) / metrics.length || 0,
      },
    };
  } catch (error) {
    console.error('Error getting agent analytics:', error);
    throw new Error('Failed to get agent analytics');
  }
}

export async function getAgentFeedbacks(
  agent_id: string,
  options: {
    start_date?: Date;
    end_date?: Date;
    limit?: number;
  } = {}
): Promise<any[]> {
  const where: Prisma.AgentFeedbackWhereInput = { agent_id };

  if (options.start_date) where.created_at = { gte: options.start_date };
  if (options.end_date) where.created_at = { lte: options.end_date };

  return await prismaClient.agentFeedback.findMany({
    where,
    orderBy: { created_at: 'desc' },
    take: options.limit,
  });
} 