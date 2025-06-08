import { Prisma, DeploymentStatus, UserRole, SubscriptionTier } from '@prisma/client';
import { prisma } from './db';
import type { User } from '@/types/prisma';

export interface CreateUserInput {
  name: string;
  email: string;
  image?: string;
  role?: UserRole;
  subscriptionTier?: SubscriptionTier;
  metadata?: Prisma.JsonValue;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  image?: string;
  role?: UserRole;
  subscriptionTier?: SubscriptionTier;
  metadata?: Prisma.JsonValue;
}

export interface GetUserOptions {
  includeAgents?: boolean;
  includeDeployments?: boolean;
  includeFeedbacks?: boolean;
  includeEarnings?: boolean;
  includePurchases?: boolean;
}

export interface GetUserAgentsOptions {
  status?: DeploymentStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface GetUserDeploymentsOptions {
  status?: DeploymentStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface GetUserFeedbacksOptions {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface GetUserEarningsOptions {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface GetUserPurchasesOptions {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

interface UserStats {
  totalPurchases: number;
  totalEarnings: number;
  totalProducts: number;
  averageRating: number;
}

export async function createUser(data: CreateUserInput) {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      image: data.image,
      role: data.role || UserRole.user,
      subscriptionTier: data.subscriptionTier || SubscriptionTier.free,
    },
  });
}

export async function updateUser(id: string, data: UpdateUserInput) {
  return prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      image: data.image,
      role: data.role,
      subscriptionTier: data.subscriptionTier,
    },
  });
}

export async function getUser(id: string, options: GetUserOptions = {}) {
  const include: Prisma.UserInclude = {};

  if (options.includeAgents) {
    include.deployments = true;
  }

  if (options.includeDeployments) {
    include.deployments = true;
  }

  if (options.includeFeedbacks) {
    include.feedbacks = true;
  }

  if (options.includeEarnings) {
    include.earnings = true;
  }

  if (options.includePurchases) {
    include.purchases = true;
  }

  return prisma.user.findUnique({
    where: { id },
    include,
  });
}

export async function getUsers(filter: {
  search?: string;
  role?: UserRole;
  subscriptionTier?: SubscriptionTier;
} = {}) {
  const where: Prisma.UserWhereInput = {};

  if (filter.search) {
    where.OR = [
      { name: { contains: filter.search, mode: 'insensitive' } },
      { email: { contains: filter.search, mode: 'insensitive' } },
    ];
  }

  if (filter.role) {
    where.role = filter.role;
  }

  if (filter.subscriptionTier) {
    where.subscriptionTier = filter.subscriptionTier;
  }

  return prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUserAgents(userId: string, options: GetUserAgentsOptions = {}) {
  const where: Prisma.DeploymentWhereInput = {
    createdBy: userId,
  };

  if (options.status) {
    where.status = options.status;
  }

  if (options.startDate) {
    if (!where.createdAt || typeof where.createdAt !== 'object') where.createdAt = {};
    (where.createdAt as any).gte = options.startDate;
  }

  if (options.endDate) {
    if (!where.createdAt || typeof where.createdAt !== 'object') where.createdAt = {};
    (where.createdAt as any).lte = options.endDate;
  }

  return prisma.deployment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUserDeployments(userId: string, options: GetUserDeploymentsOptions = {}) {
  const where: Prisma.DeploymentWhereInput = {
    createdBy: userId,
  };

  if (options.status) {
    where.status = options.status;
  }

  if (options.startDate) {
    if (!where.createdAt || typeof where.createdAt !== 'object') where.createdAt = {};
    (where.createdAt as any).gte = options.startDate;
  }

  if (options.endDate) {
    if (!where.createdAt || typeof where.createdAt !== 'object') where.createdAt = {};
    (where.createdAt as any).lte = options.endDate;
  }

  return prisma.deployment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUserFeedbacks(userId: string) {
  return prisma.agentFeedback.findMany({
    where: { userId },
    include: {
      deployment: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUserEarnings(userId: string) {
  return prisma.earning.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUserPurchases(userId: string) {
  return prisma.purchase.findMany({
    where: { userId },
    include: {
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUserStats() {
  const [totalUsers, roleDistribution, subscriptionDistribution] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({
      by: ['role'],
      _count: true,
    }),
    prisma.user.groupBy({
      by: ['subscriptionTier'],
      _count: true,
    }),
  ]);

  return {
    totalUsers,
    roleDistribution: roleDistribution.reduce((acc, curr) => {
      acc[curr.role] = curr._count;
      return acc;
    }, {} as Record<string, number>),
    subscriptionDistribution: subscriptionDistribution.reduce((acc, curr) => {
      acc[curr.subscriptionTier] = curr._count;
      return acc;
    }, {} as Record<string, number>),
  };
}

export async function getUserHistory() {
  try {
    const users = await getUsers();
    const monthlyData = users.reduce((acc, user) => {
      const month = user.createdAt.toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      monthlyData,
      recentUsers: users.slice(0, 5),
    };
  } catch (error) {
    console.error('Error getting user history:', error);
    throw new Error('Failed to get user history');
  }
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