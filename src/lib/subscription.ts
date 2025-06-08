import { prisma } from './db';
import type { User } from '@/types/prisma';

interface SubscriptionStatus {
  isActive: boolean;
  plan: string | null;
  expiresAt: Date | null;
}

export async function getUserSubscription(userId: string): Promise<SubscriptionStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      subscriptionId: true,
      subscriptionExpiresAt: true
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    isActive: user.subscriptionStatus === 'active',
    plan: user.subscriptionId,
    expiresAt: user.subscriptionExpiresAt
  };
}

export async function updateSubscriptionStatus(
  userId: string,
  status: 'active' | 'canceled' | 'expired',
  expiresAt?: Date
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: status,
      subscriptionExpiresAt: expiresAt
    }
  });
}

export async function cancelSubscription(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: 'canceled',
      subscriptionExpiresAt: new Date()
    }
  });
}

export async function getExpiredSubscriptions(): Promise<User[]> {
  const now = new Date();
  return prisma.user.findMany({
    where: {
      subscriptionStatus: 'active',
      subscriptionExpiresAt: {
        lt: now
      }
    }
  });
}

export async function handleExpiredSubscriptions(): Promise<void> {
  const expiredUsers = await getExpiredSubscriptions();
  
  for (const user of expiredUsers) {
    await updateSubscriptionStatus(user.id, 'expired');
  }
} 