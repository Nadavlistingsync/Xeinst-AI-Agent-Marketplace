import { prisma } from '@/types/prisma';
import type { WorkflowWebhook } from '@prisma/client';

export interface CreateWebhookInput {
  workflowId: string;
  userId: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  isActive?: boolean;
}

export async function createWebhook(data: CreateWebhookInput): Promise<WorkflowWebhook> {
  return prisma.workflowWebhook.create({
    data: {
      workflow: { connect: { id: data.workflowId } },
      url: data.url,
      method: data.method,
      headers: data.headers,
      isActive: data.isActive ?? true,
    },
  });
}

export async function getWebhooks(userId: string) {
  return prisma.workflowWebhook.findMany({
    where: { workflow: { createdBy: userId } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateWebhook(
  id: string,
  data: Partial<CreateWebhookInput>
): Promise<WorkflowWebhook> {
  const updateData: any = {
    url: data.url,
    method: data.method,
    headers: data.headers,
    isActive: data.isActive,
  };

  if (data.workflowId) {
    updateData.workflow = { connect: { id: data.workflowId } };
  }

  return prisma.workflowWebhook.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteWebhook(id: string): Promise<WorkflowWebhook> {
  return prisma.workflowWebhook.delete({
    where: { id },
  });
}

export async function getWebhookById(id: string) {
  return prisma.workflowWebhook.findUnique({
    where: { id },
    include: {
      workflow: true,
    },
  });
}

export async function getWebhooksByWorkflow(workflowId: string) {
  return prisma.workflowWebhook.findMany({
    where: { workflowId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getActiveWebhooks() {
  return prisma.workflowWebhook.findMany({
    where: { isActive: true },
    include: {
      workflow: true,
    },
  });
}

export async function getWebhooksByUser(userId: string) {
  return prisma.workflowWebhook.findMany({
    where: { workflow: { createdBy: userId } },
    include: {
      workflow: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function pauseWebhook(id: string): Promise<WorkflowWebhook> {
  return prisma.workflowWebhook.update({
    where: { id },
    data: { isActive: false }
  });
}

export async function resumeWebhook(id: string): Promise<WorkflowWebhook> {
  return prisma.workflowWebhook.update({
    where: { id },
    data: { isActive: true }
  });
}

export async function executeWebhook(webhook: WorkflowWebhook, data: any): Promise<Response> {
  const { url, method, headers } = webhook;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>)
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`Webhook execution failed: ${response.statusText}`);
  }

  return response;
}

export async function validateWebhook(webhook: WorkflowWebhook): Promise<boolean> {
  try {
    const response = await fetch(webhook.url, {
      method: 'HEAD',
      headers: webhook.headers as Record<string, string>
    });
    return response.ok;
  } catch (error) {
    return false;
  }
} 