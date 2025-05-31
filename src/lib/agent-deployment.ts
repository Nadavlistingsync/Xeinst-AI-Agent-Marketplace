import { z } from 'zod';
import prisma from './prisma';
import JSZip from 'jszip';

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

export async function deployAgent(
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
      return { success: false, error: 'Not authorized to deploy this agent' };
    }

    if (!agent.file_url) {
      return { success: false, error: 'Agent file URL is missing' };
    }

    // Update status to deploying
    await prisma.deployment.update({
      where: { id: agentId },
      data: { status: 'deploying' },
    });

    // Fetch the agent code
    const response = await fetch(agent.file_url);
    const zipBlob = await response.blob();
    const zip = await JSZip.loadAsync(zipBlob);

    // Extract the main agent file
    const mainFile = zip.file('agent.py') || zip.file('agent.js') || zip.file('agent.ts');
    if (!mainFile) {
      throw new Error('Main agent file not found in the zip');
    }

    const code = await mainFile.async('text');

    // Create serverless function
    const functionName = `agent-${agentId}`;
    const apiEndpoint = await createServerlessFunction({
      name: functionName,
      code,
      framework: agent.framework,
      requirements: agent.requirements ?? undefined,
    });

    // Update agent status and endpoint
    await prisma.deployment.update({
      where: { id: agentId },
      data: {
        status: 'active',
        api_endpoint: apiEndpoint,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deploying agent:', error);
    await prisma.deployment.update({
      where: { id: agentId },
      data: { status: 'failed' },
    });
    return { success: false, error: 'Deployment failed' };
  }
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