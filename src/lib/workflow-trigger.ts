import { prisma } from '@/types/prisma';
import type { WorkflowTrigger } from '@prisma/client';

export interface WorkflowTriggerWithConfig extends WorkflowTrigger {
  config: Record<string, any>;
}

export interface CreateTriggerInput {
  workflowId: string;
  userId: string;
  type: 'webhook' | 'schedule' | 'event';
  config: Record<string, any>;
  isActive?: boolean;
}

export async function createTrigger(data: CreateTriggerInput): Promise<WorkflowTrigger> {
  return prisma.workflowTrigger.create({
    data: {
      workflowId: data.workflowId,
      type: data.type,
      config: data.config,
      isActive: data.isActive ?? true,
    },
  });
}

export async function getTriggers(userId: string) {
  return prisma.workflowTrigger.findMany({
    where: { workflow: { createdBy: userId } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateTrigger(
  id: string,
  data: Partial<CreateTriggerInput>
): Promise<WorkflowTrigger> {
  return prisma.workflowTrigger.update({
    where: { id },
    data: {
      workflowId: data.workflowId,
      type: data.type,
      config: data.config,
      isActive: data.isActive,
    },
  });
}

export async function deleteTrigger(id: string): Promise<WorkflowTrigger> {
  return prisma.workflowTrigger.delete({
    where: { id },
  });
}

export async function getTriggerById(id: string) {
  return prisma.workflowTrigger.findUnique({
    where: { id },
    include: {
      workflow: true,
    },
  });
}

export async function getTriggersByWorkflow(workflowId: string) {
  return prisma.workflowTrigger.findMany({
    where: { workflowId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getActiveTriggers() {
  return prisma.workflowTrigger.findMany({
    where: { isActive: true },
    include: {
      workflow: true,
    },
  });
}

export async function getTriggersByUser(userId: string) {
  return prisma.workflowTrigger.findMany({
    where: { workflow: { createdBy: userId } },
    include: {
      workflow: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function pauseTrigger(id: string): Promise<WorkflowTrigger> {
  return prisma.workflowTrigger.update({
    where: { id },
    data: { isActive: false }
  });
}

export async function resumeTrigger(id: string): Promise<WorkflowTrigger> {
  return prisma.workflowTrigger.update({
    where: { id },
    data: { isActive: true }
  });
}

export async function handleWebhookTrigger(
  trigger: WorkflowTriggerWithConfig,
  payload: any
): Promise<void> {
  if (trigger.type !== 'webhook') {
    throw new Error('Invalid trigger type');
  }

  await prisma.workflowExecution.create({
    data: {
      workflowId: trigger.workflowId,
      input: payload,
      status: 'PENDING',
      versionId: trigger.workflowId,
      startedAt: new Date()
    }
  });
}

export async function handleEventTrigger(
  trigger: WorkflowTriggerWithConfig,
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
      status: 'PENDING',
      versionId: trigger.workflowId,
      startedAt: new Date()
    }
  });
} 