import { prisma } from '@/types/prisma';
import type { WorkflowWebhook } from '@prisma/client';

interface WebhookConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  body?: any;
}

interface CreateWebhookData {
  workflowId: string;
  config: WebhookConfig;
  userId: string;
}

interface WorkflowWebhookWithConfig extends WorkflowWebhook {
  config: WebhookConfig;
}

export async function createWebhook(data: CreateWebhookData): Promise<WorkflowWebhook> {
  return prisma.workflowWebhook.create({
    data: {
      workflowId: data.workflowId,
      url: data.config.url,
      method: data.config.method,
      headers: data.config.headers as any,
      isActive: true,
      createdBy: data.userId
    }
  });
}

export async function getWebhookById(id: string): Promise<WorkflowWebhook | null> {
  return prisma.workflowWebhook.findUnique({
    where: { id }
  });
}

export async function getWebhooksByWorkflow(workflowId: string): Promise<WorkflowWebhook[]> {
  return prisma.workflowWebhook.findMany({
    where: { workflowId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getWebhooksByUser(userId: string): Promise<WorkflowWebhook[]> {
  return prisma.workflowWebhook.findMany({
    where: { createdBy: userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateWebhook(
  id: string,
  data: Partial<CreateWebhookData>
): Promise<WorkflowWebhook> {
  return prisma.workflowWebhook.update({
    where: { id },
    data: {
      ...(data.workflowId && { workflowId: data.workflowId }),
      ...(data.config && {
        url: data.config.url,
        method: data.config.method,
        headers: data.config.headers as any
      })
    }
  });
}

export async function deleteWebhook(id: string): Promise<void> {
  await prisma.workflowWebhook.delete({
    where: { id }
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

export async function executeWebhook(webhook: WorkflowWebhookWithConfig, data: any): Promise<Response> {
  const { url, method, headers, config } = webhook;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>)
    },
    body: config.body ? JSON.stringify(config.body) : JSON.stringify(data)
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