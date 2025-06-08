import { prisma } from './db';
import type { User } from '@/types/prisma';

interface UserStats {
  totalPurchases: number;
  totalEarnings: number;
  totalProducts: number;
  averageRating: number;
}

export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id }
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email }
  });
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const [purchases, earnings, products, ratings] = await Promise.all([
    prisma.purchase.count({
      where: { userId }
    }),
    prisma.earning.aggregate({
      where: { userId },
      _sum: { amount: true }
    }),
    prisma.product.count({
      where: { createdBy: userId }
    }),
    prisma.rating.aggregate({
      where: { userId },
      _avg: { score: true }
    })
  ]);

  return {
    totalPurchases: purchases,
    totalEarnings: earnings._sum.amount ? Number(earnings._sum.amount) : 0,
    totalProducts: products,
    averageRating: ratings._avg.score ? Number(ratings._avg.score) : 0
  };
}

export async function updateUserProfile(
  userId: string,
  data: Partial<User>
): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data
  });
}

export async function deleteUser(userId: string): Promise<void> {
  await prisma.user.delete({
    where: { id: userId }
  });
}

export async function searchUsers(query: string): Promise<User[]> {
  return prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } }
      ]
    }
  });
} 