import { prisma } from './db';
import { Prisma } from '@prisma/client';
import { Earning } from './schema';

export interface EarningOptions {
  user_id?: string;
  product_id?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export async function createEarning(data: {
  user_id: string;
  product_id: string;
  amount: number;
  status?: string;
  stripeTransferId?: string;
}): Promise<Earning> {
  try {
    return await prisma.earning.create({
      data: {
        user_id: data.user_id,
        product_id: data.product_id,
        amount: new Prisma.Decimal(data.amount),
        status: data.status || 'pending',
        stripeTransferId: data.stripeTransferId,
        created_at: new Date(),
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

    return await prisma.earning.update({
      where: { id },
      data: updateData,
    });
  } catch (error) {
    console.error('Error updating earning:', error);
    throw new Error('Failed to update earning');
  }
}

export async function getEarnings(options: EarningOptions = {}): Promise<Earning[]> {
  try {
    const where: Prisma.EarningWhereInput = {};
    
    if (options.user_id) where.user_id = options.user_id;
    if (options.product_id) where.product_id = options.product_id;
    if (options.status) where.status = options.status;
    if (options.startDate) where.created_at = { gte: options.startDate };
    if (options.endDate) where.created_at = { lte: options.endDate };

    return await prisma.earning.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  } catch (error) {
    console.error('Error getting earnings:', error);
    throw new Error('Failed to get earnings');
  }
}

export async function getEarning(id: string): Promise<Earning | null> {
  try {
    return await prisma.earning.findUnique({
      where: { id },
    });
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
  user_id: string,
  options: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<Earning[]> {
  const where: Prisma.EarningWhereInput = { user_id };

  if (options.status) where.status = options.status;
  if (options.startDate) where.created_at = { gte: options.startDate };
  if (options.endDate) where.created_at = { lte: options.endDate };

  return await prisma.earning.findMany({
    where,
    include: {
      product: true,
    },
    orderBy: { created_at: 'desc' },
    take: options.limit,
  });
}

export async function getProductEarnings(
  product_id: string,
  options: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<Earning[]> {
  const where: Prisma.EarningWhereInput = { product_id };

  if (options.status) where.status = options.status;
  if (options.startDate) where.created_at = { gte: options.startDate };
  if (options.endDate) where.created_at = { lte: options.endDate };

  return await prisma.earning.findMany({
    where,
    include: {
      user: true,
    },
    orderBy: { created_at: 'desc' },
    take: options.limit,
  });
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
      acc[earning.product_id] = (acc[earning.product_id] || 0) + Number(earning.amount);
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
      const month = earning.created_at.toISOString().slice(0, 7);
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

export async function getProductEarningStats(product_id: string): Promise<{
  totalEarnings: number;
  totalPending: number;
  totalPaid: number;
  earningDistribution: Record<string, number>;
}> {
  const earnings = await prisma.earning.findMany({
    where: { product_id },
  });

  const totalEarnings = earnings.reduce((sum, earning) => sum + Number(earning.amount), 0);
  const totalPending = earnings
    .filter(earning => earning.status === 'pending')
    .reduce((sum, earning) => sum + Number(earning.amount), 0);
  const totalPaid = earnings
    .filter(earning => earning.status === 'paid')
    .reduce((sum, earning) => sum + Number(earning.amount), 0);

  const earningDistribution = earnings.reduce((acc, earning) => {
    const date = earning.created_at.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + Number(earning.amount);
    return acc;
  }, {} as Record<string, number>);

  return {
    totalEarnings,
    totalPending,
    totalPaid,
    earningDistribution,
  };
} 