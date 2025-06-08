import { prisma } from './db';
import { Prisma } from '@prisma/client';
import type { Purchase } from '@/types/prisma';

export interface PurchaseOptions {
  userId?: string;
  productId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

interface PurchaseWithNumber extends Omit<Purchase, 'amount'> {
  amount: number;
}

export async function createPurchase(data: {
  userId: string;
  productId: string;
  amount: number;
  status?: string;
}): Promise<Purchase> {
  try {
    return await prisma.purchase.create({
      data: {
        ...data,
        status: data.status || 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }).then((purchase) => ({ ...purchase, amount: Number(purchase.amount) }));
  } catch (error) {
    console.error('Error creating purchase:', error);
    throw new Error('Failed to create purchase');
  }
}

export async function updatePurchase(id: string, data: Partial<Purchase>): Promise<Purchase> {
  try {
    return await prisma.purchase.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    }).then((purchase) => ({ ...purchase, amount: Number(purchase.amount) }));
  } catch (error) {
    console.error('Error updating purchase:', error);
    throw new Error('Failed to update purchase');
  }
}

export async function getPurchases(options: PurchaseOptions = {}): Promise<Purchase[]> {
  try {
    const where: Prisma.PurchaseWhereInput = {};
    
    if (options.userId) where.userId = options.userId;
    if (options.productId) where.productId = options.productId;
    if (options.status) where.status = options.status;
    if (options.startDate) where.createdAt = { gte: options.startDate };
    if (options.endDate) where.createdAt = { lte: options.endDate };

    return await prisma.purchase.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    }).then((purchases) => purchases.map(p => ({ ...p, amount: Number(p.amount) })));
  } catch (error) {
    console.error('Error getting purchases:', error);
    throw new Error('Failed to get purchases');
  }
}

export async function getPurchase(id: string): Promise<Purchase | null> {
  try {
    return await prisma.purchase.findUnique({
      where: { id },
    }).then((purchase) => purchase ? { ...purchase, amount: Number(purchase.amount) } : null);
  } catch (error) {
    console.error('Error getting purchase:', error);
    throw new Error('Failed to get purchase');
  }
}

export async function deletePurchase(id: string): Promise<void> {
  try {
    await prisma.purchase.delete({
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

  return await prisma.purchase.findMany({
    where,
    include: {
      product: true,
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  }).then((purchases) => purchases.map(p => ({ ...p, amount: Number(p.amount) })));
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

  return await prisma.purchase.findMany({
    where,
    include: {
      user: true,
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  }).then((purchases) => purchases.map(p => ({ ...p, amount: Number(p.amount) })));
}

export async function getPurchaseStats() {
  try {
    const purchases = await getPurchases();

    const totalPurchases = purchases.length;
    const totalRevenue = purchases.reduce((sum, purchase) => sum + Number(purchase.amount), 0);
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
      acc[month].revenue += Number(purchase.amount);
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
  await prisma.product.update({
    where: { id: productId },
    data: {
      downloadCount: {
        increment: 1,
      },
    },
  });
}

export async function getPurchaseById(id: string): Promise<PurchaseWithNumber | null> {
  return prisma.purchase.findUnique({
    where: {
      id
    },
    include: {
      product: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    }
  }).then(purchase => purchase ? { ...purchase, amount: Number(purchase.amount) } : null);
}

export async function getPurchasesByUser(userId: string): Promise<PurchaseWithNumber[]> {
  return prisma.purchase.findMany({
    where: {
      userId
    },
    include: {
      product: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  }).then(purchases => purchases.map(p => ({ ...p, amount: Number(p.amount) })));
}

export async function getPurchasesByProduct(productId: string): Promise<PurchaseWithNumber[]> {
  return prisma.purchase.findMany({
    where: {
      productId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  }).then(purchases => purchases.map(p => ({ ...p, amount: Number(p.amount) })));
} 