import { Prisma } from '@prisma/client';
import prismaClient from './db';
import { User } from './schema';
import bcrypt from 'bcryptjs';

export interface UserOptions {
  role?: string;
  subscriptionTier?: string;
  query?: string;
}

export async function createUser(data: {
  email: string;
  name: string;
  password: string;
  role?: string;
  subscriptionTier?: string;
}): Promise<User> {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return await prismaClient.user.create({
    data: {
      ...data,
      password: hashedPassword,
      role: data.role || 'user',
      subscriptionTier: data.subscriptionTier || 'free',
    },
  });
}

export async function updateUser(
  id: string,
  data: Partial<User>
): Promise<User> {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  return await prismaClient.user.update({
    where: { id },
    data,
  });
}

export async function getUsers(
  options: UserOptions = {}
): Promise<User[]> {
  const where: Prisma.UserWhereInput = {};

  if (options.role) where.role = options.role;
  if (options.subscriptionTier) where.subscriptionTier = options.subscriptionTier;
  if (options.query) {
    where.OR = [
      { name: { contains: options.query, mode: 'insensitive' } },
      { email: { contains: options.query, mode: 'insensitive' } },
    ];
  }

  return await prismaClient.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUser(id: string): Promise<User | null> {
  return await prismaClient.user.findUnique({
    where: { id },
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return await prismaClient.user.findUnique({
    where: { email },
  });
}

export async function deleteUser(id: string): Promise<void> {
  await prismaClient.user.delete({
    where: { id },
  });
}

export async function getUserAgents(
  userId: string,
  options: {
    status?: string;
    category?: string;
    limit?: number;
  } = {}
): Promise<any[]> {
  const where: Prisma.AgentWhereInput = { createdBy: userId };

  if (options.status) where.status = options.status;
  if (options.category) where.category = options.category;

  return await prismaClient.agent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  });
}

export async function getUserDeployments(
  userId: string,
  options: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<any[]> {
  const where: Prisma.DeploymentWhereInput = { deployedBy: userId };

  if (options.status) where.status = options.status;
  if (options.startDate) where.startDate = { gte: options.startDate };
  if (options.endDate) where.endDate = { lte: options.endDate };

  return await prismaClient.deployment.findMany({
    where,
    orderBy: { startDate: 'desc' },
    take: options.limit,
  });
}

export async function getUserFeedbacks(
  userId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<any[]> {
  const where: Prisma.AgentFeedbackWhereInput = { userId };

  if (options.startDate) where.createdAt = { gte: options.startDate };
  if (options.endDate) where.createdAt = { lte: options.endDate };

  return await prismaClient.agentFeedback.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  });
}

export async function getUserEarnings(
  userId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<any[]> {
  const where: Prisma.EarningWhereInput = { userId };

  if (options.startDate) where.createdAt = { gte: options.startDate };
  if (options.endDate) where.createdAt = { lte: options.endDate };

  return await prismaClient.earning.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  });
}

export async function getUserPurchases(
  userId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<any[]> {
  const where: Prisma.PurchaseWhereInput = { userId };

  if (options.startDate) where.createdAt = { gte: options.startDate };
  if (options.endDate) where.createdAt = { lte: options.endDate };

  return await prismaClient.purchase.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  });
} 