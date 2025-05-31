import { z } from 'zod';
import { prisma } from './prisma';
import JSZip from 'jszip';
import { logAgentRequest } from './agent-monitoring';

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
    const deployment = await prisma.agentDeployment.create({
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
    await prisma.agent.update({
      where: { id: agentId },
      data: {
        status: 'deploying',
        lastDeployedAt: new Date()
      }
    });

    // Simulate deployment process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update deployment status
    await prisma.agentDeployment.update({
      where: { id: deployment.id },
      data: {
        status: 'completed',
        completedAt: new Date()
      }
    });

    // Update agent status
    await prisma.agent.update({
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
    await prisma.agent.update({
      where: { id: agentId },
      data: {
        status: 'failed'
      }
    });

    throw error;
  }
}

export async function getAgentDeployments(agentId: string) {
  return prisma.agentDeployment.findMany({
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
  return prisma.agentDeployment.findUnique({
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
  const deployment = await prisma.agentDeployment.findUnique({
    where: { id: deploymentId }
  });

  if (!deployment) {
    throw new Error('Deployment not found');
  }

  if (deployment.status !== 'pending') {
    throw new Error('Can only cancel pending deployments');
  }

  await prisma.agentDeployment.update({
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
  return prisma.agentDeployment.findMany({
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
  return prisma.agentDeployment.findMany({
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
    const agent = await prisma.deployment.findUnique({
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

    await prisma.deployment.update({
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
  return prisma.agentVersion.create({
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
  return prisma.agentVersion.findMany({
    where: { agentId },
    orderBy: { createdAt: 'desc' },
  });
} 