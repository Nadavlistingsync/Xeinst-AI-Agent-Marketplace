import type { User } from '@/types/prisma';
import { prisma } from '@/types/prisma';

interface SubscriptionStatus {
  isActive: boolean;
  plan: string | null;
  expiresAt: Date | null;
}

export async function getUserSubscription(userId: string): Promise<SubscriptionStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionExpiresAt: true
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    isActive: user.subscriptionExpiresAt ? user.subscriptionExpiresAt > new Date() : false,
    plan: user.subscriptionTier,
    expiresAt: user.subscriptionExpiresAt
  };
}

export async function updateSubscriptionStatus(userId: string, status: SubscriptionStatus): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: status.plan,
      subscriptionExpiresAt: status.expiresAt
    }
  });
}

export async function cancelSubscription(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: 'free',
      subscriptionExpiresAt: null
    }
  });
}

export async function getExpiredSubscriptions(): Promise<User[]> {
  return prisma.user.findMany({
    where: {
      subscriptionExpiresAt: {
        lt: new Date()
      }
    }
  });
}

export async function handleExpiredSubscriptions(): Promise<void> {
  const expiredUsers = await getExpiredSubscriptions();
  
  for (const user of expiredUsers) {
    await cancelSubscription(user.id);
  }
} 