import { Prisma, UserRole, SubscriptionTier } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from './db';
import { User, Agent, Deployment, AgentFeedback, Earning, Purchase } from './schema';

export interface CreateUserInput {
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  password: string;
}

export interface GetUsersOptions {
  role?: UserRole;
  subscriptionTier?: SubscriptionTier;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface GetUserAgentsOptions {
  status?: string;
  category?: string;
  limit?: number;
}

export interface GetUserDeploymentsOptions {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
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

export async function createUser(data: CreateUserInput): Promise<User> {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return await prisma.user.create({
      data: {
        ...data,
        role: data.role,
        subscriptionTier: data.subscriptionTier,
        password: hashedPassword,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
}

export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  try {
    const updateData = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    return await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
}

export async function getUsers(options: GetUsersOptions = {}): Promise<User[]> {
  try {
    const where: Prisma.UserWhereInput = {};
    
    if (options.role) where.role = options.role;
    if (options.subscriptionTier) where.subscriptionTier = options.subscriptionTier;
    if (options.startDate) where.createdAt = { gte: options.startDate };
    if (options.endDate) where.createdAt = { lte: options.endDate };
    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error getting users:', error);
    throw new Error('Failed to get users');
  }
}

export async function getUser(id: string): Promise<User | null> {
  try {
    return await prisma.user.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error getting user:', error);
    throw new Error('Failed to get user');
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function deleteUser(id: string): Promise<void> {
  try {
    await prisma.user.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
}

export async function getUserAgents(
  userId: string,
  options: GetUserAgentsOptions = {}
): Promise<Agent[]> {
  const where: Prisma.AgentWhereInput = { createdBy: userId };

  if (options.status) where.status = options.status;
  if (options.category) where.category = options.category;

  return await prisma.agent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  });
}

export async function getUserDeployments(
  userId: string,
  options: GetUserDeploymentsOptions = {}
): Promise<Deployment[]> {
  const where: Prisma.DeploymentWhereInput = { deployedBy: userId };

  if (options.status) where.status = options.status;
  if (options.startDate) where.startDate = { gte: options.startDate };
  if (options.endDate) where.startDate = { lte: options.endDate };

  return await prisma.deployment.findMany({
    where,
    orderBy: { startDate: 'desc' },
    take: options.limit,
  });
}

export async function getUserFeedbacks(
  userId: string,
  options: GetUserFeedbacksOptions = {}
): Promise<AgentFeedback[]> {
  const where: Prisma.AgentFeedbackWhereInput = { userId };

  if (options.startDate) where.createdAt = { gte: options.startDate };
  if (options.endDate) where.createdAt = { lte: options.endDate };

  return await prisma.agentFeedback.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  });
}

export async function getUserEarnings(
  userId: string,
  options: GetUserEarningsOptions = {}
): Promise<Earning[]> {
  const where: Prisma.EarningWhereInput = { userId };

  if (options.startDate) where.createdAt = { gte: options.startDate };
  if (options.endDate) where.createdAt = { lte: options.endDate };

  return await prisma.earning.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  }).then(earnings => earnings.map(e => ({ ...e, amount: Number(e.amount) })));
}

export async function getUserPurchases(
  userId: string,
  options: GetUserPurchasesOptions = {}
): Promise<Purchase[]> {
  const where: Prisma.PurchaseWhereInput = { userId };

  if (options.startDate) where.createdAt = { gte: options.startDate };
  if (options.endDate) where.createdAt = { lte: options.endDate };

  return await prisma.purchase.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  }).then(purchases => purchases.map(p => ({ ...p, amount: Number(p.amount) })));
}

export async function getUserStats() {
  try {
    const users = await getUsers();
    const totalUsers = users.length;
    const roleDistribution = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const subscriptionDistribution = users.reduce((acc, user) => {
      acc[user.subscriptionTier] = (acc[user.subscriptionTier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers,
      roleDistribution,
      subscriptionDistribution,
      recentUsers: users.slice(0, 5),
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw new Error('Failed to get user stats');
  }
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