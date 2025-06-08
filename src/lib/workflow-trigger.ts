import { prisma } from './db';
import type { WorkflowTrigger } from '@/types/prisma';

interface TriggerConfig {
  type: 'webhook' | 'event' | 'schedule';
  config: Record<string, any>;
}

interface CreateTriggerData {
  workflowId: string;
  config: TriggerConfig;
  userId: string;
}

export async function createTrigger(data: CreateTriggerData): Promise<WorkflowTrigger> {
  return prisma.workflowTrigger.create({
    data: {
      workflowId: data.workflowId,
      type: data.config.type,
      config: data.config.config,
      userId: data.userId,
      status: 'active'
    }
  });
}

export async function getTriggerById(id: string): Promise<WorkflowTrigger | null> {
  return prisma.workflowTrigger.findUnique({
    where: { id }
  });
}

export async function getTriggersByWorkflow(workflowId: string): Promise<WorkflowTrigger[]> {
  return prisma.workflowTrigger.findMany({
    where: { workflowId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getTriggersByUser(userId: string): Promise<WorkflowTrigger[]> {
  return prisma.workflowTrigger.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateTrigger(
  id: string,
  data: Partial<CreateTriggerData>
): Promise<WorkflowTrigger> {
  return prisma.workflowTrigger.update({
    where: { id },
    data: {
      ...data,
      config: data.config ? {
        type: data.config.type,
        config: data.config.config
      } : undefined
    }
  });
}

export async function deleteTrigger(id: string): Promise<void> {
  await prisma.workflowTrigger.delete({
    where: { id }
  });
}

export async function pauseTrigger(id: string): Promise<WorkflowTrigger> {
  return prisma.workflowTrigger.update({
    where: { id },
    data: { status: 'paused' }
  });
}

export async function resumeTrigger(id: string): Promise<WorkflowTrigger> {
  return prisma.workflowTrigger.update({
    where: { id },
    data: { status: 'active' }
  });
}

export async function handleWebhookTrigger(
  trigger: WorkflowTrigger,
  payload: any
): Promise<void> {
  if (trigger.type !== 'webhook') {
    throw new Error('Invalid trigger type');
  }

  await prisma.workflowExecution.create({
    data: {
      workflowId: trigger.workflowId,
      input: payload,
      userId: trigger.userId,
      status: 'pending',
      steps: []
    }
  });
}

export async function handleEventTrigger(
  trigger: WorkflowTrigger,
  event: string,
  payload: any
): Promise<void> {
  if (trigger.type !== 'event') {
    throw new Error('Invalid trigger type');
  }

  const config = trigger.config as { events: string[] };
  if (!config.events.includes(event)) {
    return;
  }

  await prisma.workflowExecution.create({
    data: {
      workflowId: trigger.workflowId,
      input: payload,
      userId: trigger.userId,
      status: 'pending',
      steps: []
    }
  });
} 