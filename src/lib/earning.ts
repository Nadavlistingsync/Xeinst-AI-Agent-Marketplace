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
  stripeTransferId?: string;
}): Promise<Earning> {
  try {
    return await prismaClient.earning.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        amount: new Prisma.Decimal(data.amount),
        status: data.status || 'pending',
        stripeTransferId: data.stripeTransferId,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error creating earning:', error);
    throw new Error('Failed to create earning');
  }
}

export async function updateEarning(
  id: string,
  data: {
    amount?: number;
    status?: string;
    stripeTransferId?: string;
    paidAt?: Date;
  }
): Promise<Earning> {
  try {
    const updateData: any = { ...data };
    if (data.amount !== undefined) {
      updateData.amount = new Prisma.Decimal(data.amount);
    }
    if (data.paidAt) {
      updateData.paidAt = data.paidAt;
    }

    return await prismaClient.earning.update({
      where: { id },
      data: updateData,
    });
  } catch (error) {
    console.error('Error updating earning:', error);
    throw new Error('Failed to update earning');
  }
}

export async function getEarnings(options: {
  userId?: string;
  productId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
} = {}): Promise<Earning[]> {
  try {
    const where: Prisma.EarningWhereInput = {};
    
    if (options.userId) where.userId = options.userId;
    if (options.productId) where.productId = options.productId;
    if (options.status) where.status = options.status;
    if (options.startDate) where.createdAt = { gte: options.startDate };
    if (options.endDate) where.createdAt = { lte: options.endDate };

    return await prismaClient.earning.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error getting earnings:', error);
    throw new Error('Failed to get earnings');
  }
}

export async function getEarning(id: string): Promise<Earning | null> {
  try {
    return await prismaClient.earning.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error getting earning:', error);
    throw new Error('Failed to get earning');
  }
}

export async function deleteEarning(id: string): Promise<void> {
  try {
    await prismaClient.earning.delete({
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

export async function getEarningStats() {
  try {
    const earnings = await getEarnings();

    const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0);
    const pendingEarnings = earnings
      .filter(earning => earning.status === 'pending')
      .reduce((sum, earning) => sum + earning.amount, 0);
    const paidEarnings = earnings
      .filter(earning => earning.status === 'paid')
      .reduce((sum, earning) => sum + earning.amount, 0);

    const earningsByProduct = earnings.reduce((acc, earning) => {
      acc[earning.productId] = (acc[earning.productId] || 0) + earning.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEarnings,
      pendingEarnings,
      paidEarnings,
      earningsByProduct,
      recentEarnings: earnings.slice(0, 5),
    };
  } catch (error) {
    console.error('Error getting earning stats:', error);
    throw new Error('Failed to get earning stats');
  }
}

export async function getEarningHistory() {
  try {
    const earnings = await getEarnings();

    const monthlyEarnings = earnings.reduce((acc, earning) => {
      const month = earning.createdAt.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { total: 0, pending: 0, paid: 0 };
      }
      acc[month].total += earning.amount;
      if (earning.status === 'pending') {
        acc[month].pending += earning.amount;
      } else if (earning.status === 'paid') {
        acc[month].paid += earning.amount;
      }
      return acc;
    }, {} as Record<string, { total: number; pending: number; paid: number }>);

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