import { prisma } from './db';
import type { WorkflowWebhook } from '@/types/prisma';

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

export async function createWebhook(data: CreateWebhookData): Promise<WorkflowWebhook> {
  return prisma.workflowWebhook.create({
    data: {
      workflowId: data.workflowId,
      url: data.config.url,
      method: data.config.method,
      headers: data.config.headers,
      body: data.config.body,
      userId: data.userId,
      status: 'active'
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
    where: { userId },
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
      ...data,
      config: data.config ? {
        url: data.config.url,
        method: data.config.method,
        headers: data.config.headers,
        body: data.config.body
      } : undefined
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
    data: { status: 'paused' }
  });
}

export async function resumeWebhook(id: string): Promise<WorkflowWebhook> {
  return prisma.workflowWebhook.update({
    where: { id },
    data: { status: 'active' }
  });
}

export async function executeWebhook(webhook: WorkflowWebhook, data: any): Promise<Response> {
  const { url, method, headers, body } = webhook;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : JSON.stringify(data)
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
      headers: webhook.headers
    });
    return response.ok;
  } catch (error) {
    return false;
  }
} 