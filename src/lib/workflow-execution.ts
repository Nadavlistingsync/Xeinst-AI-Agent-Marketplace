import { prisma } from '@/types/prisma';
import type { WorkflowExecution } from '@prisma/client';

interface CreateExecutionData {
  workflowId: string;
  input: any;
  userId: string;
}

export async function createExecution(data: CreateExecutionData): Promise<WorkflowExecution> {
  return prisma.workflowExecution.create({
    data: {
      workflowId: data.workflowId,
      input: data.input,
      status: 'pending',
      versionId: data.workflowId, // Using workflowId as versionId since it's required
      startedAt: new Date()
    }
  });
}

export async function getExecutionById(id: string): Promise<WorkflowExecution | null> {
  return prisma.workflowExecution.findUnique({
    where: { id }
  });
}

export async function getExecutionsByWorkflow(workflowId: string): Promise<WorkflowExecution[]> {
  return prisma.workflowExecution.findMany({
    where: { workflowId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getExecutionsByUser(userId: string): Promise<WorkflowExecution[]> {
  return prisma.workflowExecution.findMany({
    where: { createdBy: userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateExecutionStatus(
  id: string,
  status: 'pending' | 'running' | 'completed' | 'failed',
  error?: string
): Promise<WorkflowExecution> {
  return prisma.workflowExecution.update({
    where: { id },
    data: {
      status,
      error,
      completedAt: status === 'completed' || status === 'failed' ? new Date() : undefined
    }
  });
}

// export async function updateExecutionStep(
//   executionId: string,
//   stepId: string,
//   data: Partial<ExecutionStep>
// ): Promise<WorkflowExecution> {
//   const execution = await prisma.workflowExecution.findUnique({
//     where: { id: executionId }
//   });
//
//   if (!execution) {
//     throw new Error('Execution not found');
//   }
//
//   const executionWithSteps = execution as WorkflowExecutionWithSteps;
//   const steps = executionWithSteps.steps;
//   const stepIndex = steps.findIndex(step => step.id === stepId);
//
//   if (stepIndex === -1) {
//     throw new Error('Step not found');
//   }
//
//   steps[stepIndex] = { ...steps[stepIndex], ...data };
//
//   return prisma.workflowExecution.update({
//     where: { id: executionId },
//     data: { steps: steps as any }
//   });
// }

export async function deleteExecution(id: string): Promise<void> {
  await prisma.workflowExecution.delete({
    where: { id }
  });
} 