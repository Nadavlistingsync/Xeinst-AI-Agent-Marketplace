import { prisma } from '@/types/prisma';
import { Workflow, WorkflowVersion } from '@prisma/client';

export interface WorkflowStep {
  id: string;
  type: 'API' | 'CONDITION' | 'TRANSFORM';
  config: Record<string, any>;
}

export async function createWorkflow(
  userId: string,
  data: {
    name: string;
    description?: string;
    steps: WorkflowStep[];
  }
): Promise<Workflow & { latestVersion: WorkflowVersion }> {
  const workflow = await prisma.workflow.create({
    data: {
      createdBy: userId,
      name: data.name,
      description: data.description,
    },
  });
  const version = await prisma.workflowVersion.create({
    data: {
      workflowId: workflow.id,
      version: '1.0.0',
      config: JSON.stringify({ steps: data.steps }),
      status: 'active',
    },
  });
  return { ...workflow, latestVersion: version };
}

export async function updateWorkflow(
  workflowId: string,
  data: {
    name?: string;
    description?: string;
    steps?: WorkflowStep[];
  }
): Promise<Workflow & { latestVersion?: WorkflowVersion }> {
  const workflow = await prisma.workflow.update({
    where: { id: workflowId },
    data: {
      name: data.name,
      description: data.description,
    },
  });
  let latestVersion: WorkflowVersion | undefined = undefined;
  if (data.steps) {
    latestVersion = await prisma.workflowVersion.create({
      data: {
        workflowId: workflow.id,
        version: '1.0.0', // or increment as needed
        config: JSON.stringify({ steps: data.steps }),
        status: 'active',
      },
    });
  }
  return { ...workflow, latestVersion };
}

export async function deleteWorkflow(workflowId: string): Promise<Workflow> {
  return prisma.workflow.delete({
    where: { id: workflowId },
  });
}

export async function getWorkflow(workflowId: string): Promise<(Workflow & { latestVersion?: WorkflowVersion }) | null> {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: {
      versions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
  if (!workflow) return null;
  return { ...workflow, latestVersion: workflow.versions[0] };
}

export async function getWorkflowsByUser(userId: string): Promise<Workflow[]> {
  return prisma.workflow.findMany({
    where: { createdBy: userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getActiveWorkflows(): Promise<Workflow[]> {
  return prisma.workflow.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function executeApiStep(
  _step: WorkflowStep,
  _input: Record<string, any>
): Promise<Record<string, any>> {
  // TODO: Implement API step execution
  return {};
}

export async function executeConditionStep(
  _step: WorkflowStep,
  _input: Record<string, any>
): Promise<boolean> {
  // TODO: Implement condition step execution
  return true;
}

export async function executeTransformStep(
  _step: WorkflowStep,
  _input: Record<string, any>
): Promise<Record<string, any>> {
  // TODO: Implement transform step execution
  return _input;
} 