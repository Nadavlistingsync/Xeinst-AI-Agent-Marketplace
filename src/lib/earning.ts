import { prisma } from './db';
import { Prisma } from '@prisma/client';
import { Earning } from './schema';

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
    }).then((earning) => ({ ...earning, amount: Number(earning.amount) }));
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
    }).then((earnings) => earnings.map(e => ({ ...e, amount: Number(e.amount) })));
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

export async function getEarningStats() {
  try {
    const earnings = await getEarnings();

    const totalEarnings = earnings.reduce((sum, earning) => sum + Number(earning.amount), 0);
    const pendingEarnings = earnings
      .filter(earning => earning.status === 'pending')
      .reduce((sum, earning) => sum + Number(earning.amount), 0);
    const paidEarnings = earnings
      .filter(earning => earning.status === 'paid')
      .reduce((sum, earning) => sum + Number(earning.amount), 0);

    const earningsByProduct = earnings.reduce((acc, earning) => {
      acc[earning.productId] = (acc[earning.productId] || 0) + Number(earning.amount);
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
      acc[month].total += Number(earning.amount);
      if (earning.status === 'pending') {
        acc[month].pending += Number(earning.amount);
      } else if (earning.status === 'paid') {
        acc[month].paid += Number(earning.amount);
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