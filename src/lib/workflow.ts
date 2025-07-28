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
  step: WorkflowStep,
  _input: Record<string, any>
): Promise<Record<string, any>> {
  const { url, method = 'GET', headers = {}, body } = step.config as any;
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();
    return { result: data };
  } catch (error) {
    console.error('API step execution failed:', error);
    throw error;
  }
}

export async function executeConditionStep(
  step: WorkflowStep,
  input: Record<string, any>
): Promise<boolean> {
  const { condition, operator = 'equals', value } = step.config as any;
  
  const inputValue = input[condition];
  
  switch (operator) {
    case 'equals':
      return inputValue === value;
    case 'not_equals':
      return inputValue !== value;
    case 'greater_than':
      return Number(inputValue) > Number(value);
    case 'less_than':
      return Number(inputValue) < Number(value);
    case 'contains':
      return String(inputValue).includes(String(value));
    case 'not_contains':
      return !String(inputValue).includes(String(value));
    default:
      return false;
  }
}

export async function executeTransformStep(
  step: WorkflowStep,
  input: Record<string, any>
): Promise<Record<string, any>> {
  const { transformations } = step.config as any;
  
  if (!transformations || !Array.isArray(transformations)) {
    return input;
  }

  const result = { ...input };
  
  transformations.forEach((transformation: any) => {
    const { type, source, target, value } = transformation;
    
    switch (type) {
      case 'copy':
        result[target] = input[source];
        break;
      case 'set':
        result[target] = value;
        break;
      case 'concat':
        result[target] = `${input[source] || ''}${value || ''}`;
        break;
      case 'math':
        const numValue = Number(input[source] || 0);
        const operation = transformation.operation;
        const operand = Number(transformation.operand || 0);
        
        switch (operation) {
          case 'add':
            result[target] = numValue + operand;
            break;
          case 'subtract':
            result[target] = numValue - operand;
            break;
          case 'multiply':
            result[target] = numValue * operand;
            break;
          case 'divide':
            result[target] = numValue / operand;
            break;
        }
        break;
    }
  });
  
  return result;
} 