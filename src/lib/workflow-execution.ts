import { prisma } from '@/types/prisma';
import { WorkflowExecution, WorkflowExecutionStatus } from '@prisma/client';

export interface CreateExecutionInput {
  workflowId: string;
  versionId: string;
  input: Record<string, any>;
}

export async function createExecution(
  workflowId: string,
  input: Record<string, any>
): Promise<WorkflowExecution> {
  return prisma.workflowExecution.create({
    data: {
      workflowId,
      status: 'PENDING',
      input,
      metadata: {
        startTime: new Date().toISOString(),
      },
    },
  });
}

export async function getExecutions(workflowId: string) {
  return prisma.workflowExecution.findMany({
    where: { workflowId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getExecution(executionId: string): Promise<WorkflowExecution | null> {
  return prisma.workflowExecution.findUnique({
    where: { id: executionId },
  });
}

export async function updateExecutionStatus(
  executionId: string,
  status: WorkflowExecutionStatus,
  output?: Record<string, any>
): Promise<WorkflowExecution> {
  return prisma.workflowExecution.update({
    where: { id: executionId },
    data: {
      status,
      output,
      metadata: {
        endTime: new Date().toISOString(),
      },
    },
  });
}

export async function deleteExecution(id: string): Promise<WorkflowExecution> {
  return prisma.workflowExecution.delete({
    where: { id },
  });
}

export async function getExecutionsByWorkflow(workflowId: string): Promise<WorkflowExecution[]> {
  return prisma.workflowExecution.findMany({
    where: { workflowId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getExecutionsByUser(userId: string): Promise<WorkflowExecution[]> {
  return prisma.workflowExecution.findMany({
    where: { workflow: { createdBy: userId } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getWorkflowExecutions(userId: string) {
  return prisma.workflowExecution.findMany({
    where: { workflow: { createdBy: userId } },
    include: {
      workflow: true,
      version: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getWorkflowExecution(id: string) {
  return prisma.workflowExecution.findUnique({
    where: { id },
    include: {
      workflow: true,
      version: true,
    },
  });
}

export async function updateWorkflowExecutionStatus(
  id: string,
  status: 'RUNNING' | 'COMPLETED' | 'FAILED',
  output?: Record<string, any>
): Promise<WorkflowExecution> {
  return prisma.workflowExecution.update({
    where: { id },
    data: {
      status,
      output,
      completedAt: status === 'COMPLETED' ? new Date() : undefined,
    },
  });
}

export async function deleteWorkflowExecution(id: string) {
  return prisma.workflowExecution.delete({
    where: { id },
  });
}

export async function getRecentExecutions(limit = 10): Promise<WorkflowExecution[]> {
  return prisma.workflowExecution.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getFailedExecutions(): Promise<WorkflowExecution[]> {
  return prisma.workflowExecution.findMany({
    where: { status: 'FAILED' },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getExecutionMetrics(executionId: string) {
  const execution = await prisma.workflowExecution.findUnique({
    where: { id: executionId },
    select: {
      metadata: true,
      status: true,
    },
  });

  if (!execution) {
    return null;
  }

  const startTime = execution.metadata?.startTime ? new Date(execution.metadata.startTime) : null;
  const endTime = execution.metadata?.endTime ? new Date(execution.metadata.endTime) : null;

  return {
    duration: startTime && endTime ? endTime.getTime() - startTime.getTime() : null,
    status: execution.status,
  };
} 