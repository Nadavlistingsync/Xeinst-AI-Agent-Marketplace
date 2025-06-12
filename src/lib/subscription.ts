import type { User } from '@/types/prisma';
import { prisma } from '@/types/prisma';
import type { SubscriptionTier } from '@prisma/client';

interface SubscriptionStatus {
  isActive: boolean;
  plan: SubscriptionTier;
  expiresAt: Date | null;
}

export async function getUserSubscription(userId: string): Promise<SubscriptionStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    isActive: true, // Since we don't have expiration, all subscriptions are active
    plan: user.subscriptionTier,
    expiresAt: null
  };
}

export async function updateSubscriptionStatus(userId: string, status: SubscriptionStatus): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: status.plan,
    }
  });
}

export async function cancelSubscription(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: 'free',
    }
  });
}

export async function getExpiredSubscriptions(): Promise<User[]> {
  return prisma.user.findMany({
    where: {
      subscriptionTier: 'free'
    }
  });
}

export async function handleExpiredSubscriptions(): Promise<void> {
  const expiredUsers = await getExpiredSubscriptions();
  
  for (const user of expiredUsers) {
    await cancelSubscription(user.id);
  }
} 