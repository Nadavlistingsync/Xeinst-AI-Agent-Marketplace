import { prisma } from './db';
import { Prisma, PrismaClient, Earning } from '../types/prisma';

export interface EarningOptions {
  userId?: string;
  productId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateEarningInput {
  userId: string;
  productId: string;
  amount: number;
  status?: string;
  stripeTransferId?: string;
}

export interface UpdateEarningInput {
  amount?: number;
  status?: string;
  stripeTransferId?: string;
  paidAt?: Date;
}

export async function createEarning(data: CreateEarningInput): Promise<Earning> {
  try {
    return await prisma.earning.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        amount: data.amount,
        status: data.status || 'pending',
        stripeTransferId: data.stripeTransferId,
        createdAt: new Date(),
      },
    }).then((earning: Earning) => ({ ...earning, amount: Number(earning.amount) }));
  } catch (error) {
    console.error('Error creating earning:', error);
    throw new Error('Failed to create earning');
  }
}

export async function updateEarning(
  id: string,
  data: UpdateEarningInput
): Promise<Earning> {
  try {
    const updateData: any = { ...data };
    if (data.amount !== undefined) {
      updateData.amount = data.amount;
    }
    if (data.paidAt) {
      updateData.paidAt = data.paidAt;
    }

    return await prisma.earning.update({
      where: { id },
      data: updateData,
    }).then((earning) => ({ ...earning, amount: Number(earning.amount) }));
  } catch (error) {
    console.error('Error updating earning:', error);
    throw new Error('Failed to update earning');
  }
}

export async function getEarnings(options: EarningOptions = {}): Promise<Earning[]> {
  try {
    const where: Prisma.EarningWhereInput = {};
    
    if (options.userId) where.userId = options.userId;
    if (options.productId) where.productId = options.productId;
    if (options.status) where.status = options.status;
    if (options.startDate) where.createdAt = { gte: options.startDate };
    if (options.endDate) where.createdAt = { lte: options.endDate };

    return await prisma.earning.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    }).then((earnings: Earning[]) => earnings.map((e: Earning) => ({ ...e, amount: Number(e.amount) })));
  } catch (error) {
    console.error('Error getting earnings:', error);
    throw new Error('Failed to get earnings');
  }
}

export async function getEarning(id: string): Promise<Earning | null> {
  try {
    return await prisma.earning.findUnique({
      where: { id },
    }).then((earning) => earning ? { ...earning, amount: Number(earning.amount) } : null);
  } catch (error) {
    console.error('Error getting earning:', error);
    throw new Error('Failed to get earning');
  }
}

export async function deleteEarning(id: string): Promise<void> {
  try {
    await prisma.earning.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting earning:', error);
    throw new Error('Failed to delete earning');
  }
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

  return await prisma.earning.findMany({
    where,
    include: {
      product: true,
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  }).then((earnings) => earnings.map(e => ({ ...e, amount: Number(e.amount) })));
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

  return await prisma.earning.findMany({
    where,
    include: {
      user: true,
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  }).then((earnings) => earnings.map(e => ({ ...e, amount: Number(e.amount) })));
}

interface EarningStats {
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  earningDistribution: Record<string, number>;
}

export async function getEarningStats(prisma: PrismaClient, userId: string): Promise<EarningStats> {
  const earnings = await prisma.earning.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const earningsNum = earnings.map((e: Earning) => ({ ...e, amount: Number(e.amount) }));

  const totalEarnings = earningsNum.reduce((sum: number, earning: Earning & { amount: number }) => sum + earning.amount, 0);
  const pendingEarnings = earningsNum
    .filter((earning: Earning & { amount: number }) => earning.status === 'pending')
    .reduce((sum: number, earning: Earning & { amount: number }) => sum + earning.amount, 0);
  const paidEarnings = earningsNum
    .filter((earning: Earning & { amount: number }) => earning.status === 'paid')
    .reduce((sum: number, earning: Earning & { amount: number }) => sum + earning.amount, 0);

  const earningDistribution = earningsNum.reduce((acc: Record<string, number>, earning: Earning & { amount: number }) => {
    const month = earning.createdAt.toISOString().slice(0, 7);
    acc[month] = (acc[month] || 0) + earning.amount;
    return acc;
  }, {});

  return {
    totalEarnings,
    pendingEarnings,
    paidEarnings,
    earningDistribution,
  };
}

export async function getEarningHistory() {
  try {
    const earnings = await getEarnings();

    const monthlyEarnings = earnings.reduce((acc: Record<string, { total: number; pending: number; paid: number }>, earning: Earning) => {
      const month = earning.createdAt.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { total: 0, pending: 0, paid: 0 };
      }
      acc[month].total += Number(earning.amount);
      if (earning.status === 'pending') {
        acc[month].pending += Number(earning.amount);
      } else if (earning.status === 'paid') {
        acc[month].paid += Number(earning.amount);
      }
      return acc;
    }, {});

    return {
      monthlyEarnings,
      recentEarnings: earnings.slice(0, 10),
    };
  } catch (error) {
    console.error('Error getting earning history:', error);
    throw new Error('Failed to get earning history');
  }
}

export async function getProductEarningStats(productId: string): Promise<{
  totalEarnings: number;
  totalPending: number;
  totalPaid: number;
  earningDistribution: Record<string, number>;
}> {
  const earnings = await prisma.earning.findMany({
    where: { productId },
  });

  const earningsNum = earnings.map(e => ({ ...e, amount: Number(e.amount) }));

  const totalEarnings = earningsNum.reduce((sum, earning) => sum + earning.amount, 0);
  const totalPending = earningsNum
    .filter(earning => earning.status === 'pending')
    .reduce((sum, earning) => sum + earning.amount, 0);
  const totalPaid = earningsNum
    .filter(earning => earning.status === 'paid')
    .reduce((sum, earning) => sum + earning.amount, 0);

  const earningDistribution = earningsNum.reduce((acc, earning) => {
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

export async function getEarningByProduct(prisma: PrismaClient, productId: string) {
  return prisma.earning
    .findUnique({
      where: { productId },
    })
    .then((earning: Earning | null) => earning ? { ...earning, amount: Number(earning.amount) } : null);
}

export async function getEarningsByProduct(prisma: PrismaClient, productId: string) {
  return prisma.earning
    .findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    })
    .then((earnings: Earning[]) => earnings.map((e: Earning) => ({ ...e, amount: Number(e.amount) })));
} 