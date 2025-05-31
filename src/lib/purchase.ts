import { Prisma } from '@prisma/client';
import prismaClient from './db';
import { Purchase } from './schema';

export interface PurchaseOptions {
  user_id?: string;
  product_id?: string;
  status?: string;
  start_date?: Date;
  end_date?: Date;
}

export async function createPurchase(data: {
  userId: string;
  productId: string;
  amount: number;
  status?: string;
}): Promise<Purchase> {
  try {
    return await prismaClient.purchase.create({
      data: {
        ...data,
        status: data.status || 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error creating purchase:', error);
    throw new Error('Failed to create purchase');
  }
}

export async function updatePurchase(id: string, data: Partial<Purchase>): Promise<Purchase> {
  try {
    return await prismaClient.purchase.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error updating purchase:', error);
    throw new Error('Failed to update purchase');
  }
}

export async function getPurchases(options: PurchaseOptions = {}): Promise<Purchase[]> {
  try {
    const where: Prisma.PurchaseWhereInput = {};
    
    if (options.user_id) where.user_id = options.user_id;
    if (options.product_id) where.product_id = options.product_id;
    if (options.status) where.status = options.status;
    if (options.start_date) where.created_at = { gte: options.start_date };
    if (options.end_date) where.created_at = { lte: options.end_date };

    return await prismaClient.purchase.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  } catch (error) {
    console.error('Error getting purchases:', error);
    throw new Error('Failed to get purchases');
  }
}

export async function getPurchase(id: string): Promise<Purchase | null> {
  try {
    return await prismaClient.purchase.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error getting purchase:', error);
    throw new Error('Failed to get purchase');
  }
}

export async function deletePurchase(id: string): Promise<void> {
  try {
    await prismaClient.purchase.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    throw new Error('Failed to delete purchase');
  }
}

export async function getUserPurchases(
  userId: string,
  options: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<Purchase[]> {
  const where: Prisma.PurchaseWhereInput = { userId };

  if (options.status) where.status = options.status;
  if (options.startDate) where.createdAt = { gte: options.startDate };
  if (options.endDate) where.createdAt = { lte: options.endDate };

  return await prismaClient.purchase.findMany({
    where,
    include: {
      product: true,
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  });
}

export async function getProductPurchases(
  productId: string,
  options: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<Purchase[]> {
  const where: Prisma.PurchaseWhereInput = { productId };

  if (options.status) where.status = options.status;
  if (options.startDate) where.createdAt = { gte: options.startDate };
  if (options.endDate) where.createdAt = { lte: options.endDate };

  return await prismaClient.purchase.findMany({
    where,
    include: {
      user: true,
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  });
}

export async function getPurchaseStats() {
  try {
    const purchases = await getPurchases();

    const totalPurchases = purchases.length;
    const totalRevenue = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
    const statusDistribution = purchases.reduce((acc, purchase) => {
      acc[purchase.status] = (acc[purchase.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPurchases,
      totalRevenue,
      statusDistribution,
      recentPurchases: purchases.slice(0, 5),
    };
  } catch (error) {
    console.error('Error getting purchase stats:', error);
    throw new Error('Failed to get purchase stats');
  }
}

export async function getPurchaseHistory() {
  try {
    const purchases = await getPurchases();

    const monthlyPurchases = purchases.reduce((acc, purchase) => {
      const month = purchase.createdAt.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { total: 0, revenue: 0 };
      }
      acc[month].total += 1;
      acc[month].revenue += purchase.amount;
      return acc;
    }, {} as Record<string, { total: number; revenue: number }>);

    return {
      monthlyPurchases,
      recentPurchases: purchases.slice(0, 10),
    };
  } catch (error) {
    console.error('Error getting purchase history:', error);
    throw new Error('Failed to get purchase history');
  }
}

export async function updateProductDownloadCount(
  productId: string
): Promise<void> {
  await prismaClient.product.update({
    where: { id: productId },
    data: {
      downloadCount: {
        increment: 1,
      },
    },
  });
} 