import { prisma } from '../types/prisma';
import type { WorkflowVersion } from '@prisma/client';

export interface CreateVersionInput {
  workflowId: string;
  userId: string;
  version: string;
  steps: any[];
  config?: Record<string, any>;
}

export async function createVersion(data: CreateVersionInput): Promise<WorkflowVersion> {
  return prisma.workflowVersion.create({
    data: {
      workflowId: data.workflowId,
      version: data.version,
      config: {
        steps: data.steps,
        ...data.config,
      },
    },
  });
}

export async function getVersions(workflowId: string) {
  return prisma.workflowVersion.findMany({
    where: { workflowId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getVersion(id: string) {
  return prisma.workflowVersion.findUnique({
    where: { id },
    include: {
      workflow: true,
    },
  });
}

export async function updateVersion(
  id: string,
  data: Partial<CreateVersionInput>
): Promise<WorkflowVersion> {
  return prisma.workflowVersion.update({
    where: { id },
    data: {
      workflowId: data.workflowId,
      version: data.version,
      config: data.steps ? {
        steps: data.steps,
        ...data.config,
      } : data.config,
    },
  });
}

export async function deleteVersion(id: string): Promise<WorkflowVersion> {
  return prisma.workflowVersion.delete({
    where: { id },
  });
}

export async function getVersionById(id: string) {
  return prisma.workflowVersion.findUnique({
    where: { id },
    include: {
      workflow: true,
    },
  });
}

export async function getVersionsByWorkflow(workflowId: string) {
  return prisma.workflowVersion.findMany({
    where: { workflowId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getLatestVersion(workflowId: string) {
  return prisma.workflowVersion.findFirst({
    where: { workflowId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function compareVersions(version1Id: string, version2Id: string) {
  const version1 = await getVersion(version1Id);
  const version2 = await getVersion(version2Id);

  if (!version1 || !version2) {
    throw new Error('One or both versions not found');
  }

  const config1 = version1.config as { steps: any[] };
  const config2 = version2.config as { steps: any[] };

  const added = config2.steps.filter(
    step2 => !config1.steps.some(step1 => step1.id === step2.id)
  );

  const removed = config1.steps.filter(
    step1 => !config2.steps.some(step2 => step2.id === step1.id)
  );

  const modified = config2.steps.filter(step2 => {
    const step1 = config1.steps.find(s => s.id === step2.id);
    if (!step1) return false;
    return JSON.stringify(step1) !== JSON.stringify(step2);
  });

  return {
    added,
    removed,
    modified,
  };
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