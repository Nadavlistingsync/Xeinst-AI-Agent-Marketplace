import { prisma } from '@/types/prisma';
import type { Webhook, Prisma } from '@prisma/client';

export interface CreateWebhookInput {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  isActive?: boolean;
}

export interface UpdateWebhookInput {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  isActive?: boolean;
}

export async function createWebhook(data: CreateWebhookInput): Promise<Webhook> {
  return prisma.webhook.create({
    data: {
      ...data,
      method: data.method || 'POST',
      headers: data.headers || {},
      isActive: data.isActive ?? true
    }
  });
}

export async function updateWebhook(id: string, data: UpdateWebhookInput): Promise<Webhook> {
  return prisma.webhook.update({
    where: { id },
    data
  });
}

export async function getWebhook(id: string): Promise<Webhook | null> {
  return prisma.webhook.findUnique({
    where: { id }
  });
}

export async function getWebhooks(params?: {
  skip?: number;
  take?: number;
  where?: Prisma.WebhookWhereInput;
  orderBy?: Prisma.WebhookOrderByWithRelationInput;
}): Promise<Webhook[]> {
  return prisma.webhook.findMany({
    skip: params?.skip,
    take: params?.take,
    where: params?.where,
    orderBy: params?.orderBy
  });
}

export async function deleteWebhook(id: string): Promise<void> {
  await prisma.webhook.delete({
    where: { id }
  });
}

export async function getActiveWebhooks(): Promise<Webhook[]> {
  return prisma.webhook.findMany({
    where: { isActive: true }
  });
}

export async function toggleWebhook(id: string, isActive: boolean): Promise<Webhook> {
  return prisma.webhook.update({
    where: { id },
    data: { isActive }
  });
}

export async function updateWebhookHeaders(id: string, headers: Record<string, string>): Promise<Webhook> {
  return prisma.webhook.update({
    where: { id },
    data: { headers }
  });
}

export async function updateWebhookMethod(id: string, method: string): Promise<Webhook> {
  return prisma.webhook.update({
    where: { id },
    data: { method }
  });
}

export async function updateWebhookUrl(id: string, url: string): Promise<Webhook> {
  return prisma.webhook.update({
    where: { id },
    data: { url }
  });
} 