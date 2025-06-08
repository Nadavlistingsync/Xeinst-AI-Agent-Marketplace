import { prisma } from './db';
import type { WorkflowVersion } from '@/types/prisma';

interface VersionConfig {
  steps: any[];
  variables: Record<string, any>;
  metadata: Record<string, any>;
}

interface CreateVersionData {
  workflowId: string;
  config: VersionConfig;
  userId: string;
  version: string;
}

export async function createVersion(data: CreateVersionData): Promise<WorkflowVersion> {
  return prisma.workflowVersion.create({
    data: {
      workflowId: data.workflowId,
      version: data.version,
      config: data.config,
      userId: data.userId,
      status: 'draft'
    }
  });
}

export async function getVersionById(id: string): Promise<WorkflowVersion | null> {
  return prisma.workflowVersion.findUnique({
    where: { id }
  });
}

export async function getVersionsByWorkflow(workflowId: string): Promise<WorkflowVersion[]> {
  return prisma.workflowVersion.findMany({
    where: { workflowId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getLatestVersion(workflowId: string): Promise<WorkflowVersion | null> {
  return prisma.workflowVersion.findFirst({
    where: { workflowId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateVersion(
  id: string,
  data: Partial<CreateVersionData>
): Promise<WorkflowVersion> {
  return prisma.workflowVersion.update({
    where: { id },
    data: {
      ...data,
      config: data.config ? {
        steps: data.config.steps,
        variables: data.config.variables,
        metadata: data.config.metadata
      } : undefined
    }
  });
}

export async function deleteVersion(id: string): Promise<void> {
  await prisma.workflowVersion.delete({
    where: { id }
  });
}

export async function publishVersion(id: string): Promise<WorkflowVersion> {
  return prisma.workflowVersion.update({
    where: { id },
    data: { status: 'published' }
  });
}

export async function unpublishVersion(id: string): Promise<WorkflowVersion> {
  return prisma.workflowVersion.update({
    where: { id },
    data: { status: 'draft' }
  });
}

export async function compareVersions(
  version1Id: string,
  version2Id: string
): Promise<{
  added: any[];
  removed: any[];
  modified: any[];
}> {
  const [version1, version2] = await Promise.all([
    prisma.workflowVersion.findUnique({
      where: { id: version1Id }
    }),
    prisma.workflowVersion.findUnique({
      where: { id: version2Id }
    })
  ]);

  if (!version1 || !version2) {
    throw new Error('One or both versions not found');
  }

  const config1 = version1.config as VersionConfig;
  const config2 = version2.config as VersionConfig;

  const added = config2.steps.filter(
    step2 => !config1.steps.some(step1 => step1.id === step2.id)
  );

  const removed = config1.steps.filter(
    step1 => !config2.steps.some(step2 => step2.id === step1.id)
  );

  const modified = config2.steps.filter(step2 => {
    const step1 = config1.steps.find(s => s.id === step2.id);
    return step1 && JSON.stringify(step1) !== JSON.stringify(step2);
  });

  return { added, removed, modified };
} 