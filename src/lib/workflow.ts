import { prisma } from './db';
import type { Workflow } from '@/types/prisma';

interface WorkflowStep {
  id: string;
  type: string;
  config: Record<string, any>;
  nextStepId?: string;
}

interface CreateWorkflowData {
  name: string;
  description: string;
  steps: WorkflowStep[];
  userId: string;
}

export async function createWorkflow(data: CreateWorkflowData): Promise<Workflow> {
  return prisma.workflow.create({
    data: {
      name: data.name,
      description: data.description,
      steps: data.steps,
      userId: data.userId
    }
  });
}

export async function getWorkflowById(id: string): Promise<Workflow | null> {
  return prisma.workflow.findUnique({
    where: { id }
  });
}

export async function getWorkflowsByUser(userId: string): Promise<Workflow[]> {
  return prisma.workflow.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateWorkflow(
  id: string,
  data: Partial<CreateWorkflowData>
): Promise<Workflow> {
  return prisma.workflow.update({
    where: { id },
    data
  });
}

export async function deleteWorkflow(id: string): Promise<void> {
  await prisma.workflow.delete({
    where: { id }
  });
}

export async function executeWorkflow(workflow: Workflow, input: any): Promise<any> {
  const steps = workflow.steps as WorkflowStep[];
  let currentStep = steps[0];
  let result = input;

  while (currentStep) {
    result = await executeStep(currentStep, result);
    currentStep = steps.find(step => step.id === currentStep.nextStepId);
  }

  return result;
}

async function executeStep(step: WorkflowStep, input: any): Promise<any> {
  switch (step.type) {
    case 'api':
      return executeApiStep(step, input);
    case 'transform':
      return executeTransformStep(step, input);
    case 'condition':
      return executeConditionStep(step, input);
    default:
      throw new Error(`Unknown step type: ${step.type}`);
  }
}

async function executeApiStep(step: WorkflowStep, input: any): Promise<any> {
  const { url, method, headers, body } = step.config;
  const response = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(body)
  });
  return response.json();
}

function executeTransformStep(step: WorkflowStep, input: any): any {
  const { transform } = step.config;
  return transform(input);
}

async function executeConditionStep(step: WorkflowStep, input: any): Promise<any> {
  const { condition, trueStepId, falseStepId } = step.config;
  const result = condition(input);
  return result ? trueStepId : falseStepId;
} 