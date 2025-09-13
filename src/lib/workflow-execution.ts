import { prisma } from '../types/prisma';
import { WorkflowExecution } from '@prisma/client';

export interface CreateExecutionInput {
  workflowId: string;
  versionId: string;
  input: Record<string, any>;
}

export async function createExecution(
  workflowId: string,
  versionId: string,
  input: Record<string, any>
): Promise<WorkflowExecution> {
  return prisma.workflowExecution.create({
    data: {
      workflowId,
      versionId,
      input,
      output: {},
      status: 'pending',
      startedAt: new Date(),
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
  status: string,
  output?: Record<string, any>,
  error?: string
): Promise<WorkflowExecution> {
  return prisma.workflowExecution.update({
    where: { id: executionId },
    data: {
      status,
      output: output ?? {},
      error,
      completedAt: status === 'completed' || status === 'failed' ? new Date() : null,
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

export async function getRecentExecutions(limit: number = 10): Promise<WorkflowExecution[]> {
  return prisma.workflowExecution.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getFailedExecutions(): Promise<WorkflowExecution[]> {
  return prisma.workflowExecution.findMany({
    where: { status: 'failed' },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getExecutionMetrics(executionId: string): Promise<{
  duration: number | null;
  status: string;
  error: string | null;
}> {
  const execution = await prisma.workflowExecution.findUnique({
    where: { id: executionId },
  });
  if (!execution) {
    throw new Error('Execution not found');
  }
  const startTime = execution.startedAt;
  const endTime = execution.completedAt;
  return {
    duration: startTime && endTime ? endTime.getTime() - startTime.getTime() : null,
    status: execution.status,
    error: execution.error,
  };
} 