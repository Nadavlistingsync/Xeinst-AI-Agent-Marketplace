import { Prisma } from '@prisma/client';
import prismaClient from './db';
import { Earning } from './schema';

export interface EarningOptions {
  userId?: string;
  productId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export async function createEarning(data: {
  userId: string;
  productId: string;
  amount: number;
  status?: string;
  type?: string;
  description?: string;
}): Promise<Earning> {
  return await prismaClient.earning.create({
    data: {
      ...data,
      status: data.status || 'pending',
    },
  });
}

export async function updateEarning(
  id: string,
  data: Partial<Earning>
): Promise<Earning> {
  return await prismaClient.earning.update({
    where: { id },
    data,
  });
}

export async function getEarnings(
  options: EarningOptions = {}
): Promise<Earning[]> {
  const where: Prisma.EarningWhereInput = {};

  if (options.userId) where.userId = options.userId;
  if (options.productId) where.productId = options.productId;
  if (options.status) where.status = options.status;
  if (options.startDate) where.createdAt = { gte: options.startDate };
  if (options.endDate) where.createdAt = { lte: options.endDate };

  return await prismaClient.earning.findMany({
    where,
    include: {
      user: true,
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getEarning(id: string): Promise<Earning | null> {
  return await prismaClient.earning.findUnique({
    where: { id },
    include: {
      user: true,
      product: true,
    },
  });
}

export async function deleteEarning(id: string): Promise<void> {
  await prismaClient.earning.delete({
    where: { id },
  });
}

export async function getUserEarnings(
  userId: string,
  options: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<Earning[]> {
  const where: Prisma.EarningWhereInput = { userId };

  if (options.status) where.status = options.status;
  if (options.startDate) where.createdAt = { gte: options.startDate };
  if (options.endDate) where.createdAt = { lte: options.endDate };

  return await prismaClient.earning.findMany({
    where,
    include: {
      product: true,
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  });
}

export async function getProductEarnings(
  productId: string,
  options: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<Earning[]> {
  const where: Prisma.EarningWhereInput = { productId };

  if (options.status) where.status = options.status;
  if (options.startDate) where.createdAt = { gte: options.startDate };
  if (options.endDate) where.createdAt = { lte: options.endDate };

  return await prismaClient.earning.findMany({
    where,
    include: {
      user: true,
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  });
}

export async function getEarningStats(userId: string): Promise<{
  totalEarnings: number;
  totalPending: number;
  totalPaid: number;
  earningDistribution: Record<string, number>;
}> {
  const earnings = await prismaClient.earning.findMany({
    where: { userId },
  });

  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0);
  const totalPending = earnings
    .filter(earning => earning.status === 'pending')
    .reduce((sum, earning) => sum + earning.amount, 0);
  const totalPaid = earnings
    .filter(earning => earning.status === 'paid')
    .reduce((sum, earning) => sum + earning.amount, 0);

  const earningDistribution = earnings.reduce((acc, earning) => {
    const date = earning.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + earning.amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalEarnings,
    totalPending,
    totalPaid,
    earningDistribution,
  };
}

export async function getProductEarningStats(productId: string): Promise<{
  totalEarnings: number;
  totalPending: number;
  totalPaid: number;
  earningDistribution: Record<string, number>;
}> {
  const earnings = await prismaClient.earning.findMany({
    where: { productId },
  });

  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0);
  const totalPending = earnings
    .filter(earning => earning.status === 'pending')
    .reduce((sum, earning) => sum + earning.amount, 0);
  const totalPaid = earnings
    .filter(earning => earning.status === 'paid')
    .reduce((sum, earning) => sum + earning.amount, 0);

  const earningDistribution = earnings.reduce((acc, earning) => {
    const date = earning.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + earning.amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalEarnings,
    totalPending,
    totalPaid,
    earningDistribution,
  };
} 