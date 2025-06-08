import { prisma } from './db';
import type { Webhook } from '@/types/prisma';

interface WebhookEvent {
  type: string;
  payload: Record<string, any>;
  timestamp: Date;
}

interface CreateWebhookData {
  url: string;
  events: string[];
  secret: string;
  userId: string;
}

export async function createWebhook(data: CreateWebhookData): Promise<Webhook> {
  return prisma.webhook.create({
    data: {
      url: data.url,
      events: data.events,
      secret: data.secret,
      userId: data.userId
    }
  });
}

export async function getWebhookById(id: string): Promise<Webhook | null> {
  return prisma.webhook.findUnique({
    where: { id }
  });
}

export async function getWebhooksByUser(userId: string): Promise<Webhook[]> {
  return prisma.webhook.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateWebhook(
  id: string,
  data: Partial<CreateWebhookData>
): Promise<Webhook> {
  return prisma.webhook.update({
    where: { id },
    data
  });
}

export async function deleteWebhook(id: string): Promise<void> {
  await prisma.webhook.delete({
    where: { id }
  });
}

export async function sendWebhookEvent(
  webhook: Webhook,
  event: WebhookEvent
): Promise<void> {
  const payload = {
    type: event.type,
    payload: event.payload,
    timestamp: event.timestamp.toISOString()
  };

  const signature = generateSignature(payload, webhook.secret);

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook delivery failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Webhook delivery failed:', error);
    throw error;
  }
}

function generateSignature(payload: any, secret: string): string {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
} 