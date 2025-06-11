import { prisma } from './db';
import type { WorkflowExecution } from '@prisma/client';

interface ExecutionStep {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: any;
  output: any;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

interface CreateExecutionData {
  workflowId: string;
  input: any;
  userId: string;
}

interface WorkflowExecutionWithSteps extends WorkflowExecution {
  steps: ExecutionStep[];
}

export async function createExecution(data: CreateExecutionData): Promise<WorkflowExecution> {
  return prisma.workflowExecution.create({
    data: {
      workflowId: data.workflowId,
      input: data.input,
      status: 'pending'
      // steps: [] // Removed, not in Prisma schema
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
  // If userId is not a valid field, comment out or refactor this function
  // return prisma.workflowExecution.findMany({
  //   where: { userId },
  //   orderBy: { createdAt: 'desc' }
  // });
  throw new Error('getExecutionsByUser is not implemented: userId is not a valid field in WorkflowExecution');
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