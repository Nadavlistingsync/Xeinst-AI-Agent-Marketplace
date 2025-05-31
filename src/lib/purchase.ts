import { Prisma } from '@prisma/client';
import prismaClient from './db';
import { Purchase } from './schema';

export interface PurchaseOptions {
  userId?: string;
  productId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export async function createPurchase(data: {
  userId: string;
  productId: string;
  amount: number;
  status?: string;
  paymentMethod?: string;
  transactionId?: string;
}): Promise<Purchase> {
  const purchase = await prismaClient.purchase.create({
    data: {
      ...data,
      status: data.status || 'pending',
    },
  });

  await updateProductDownloadCount(data.productId);

  return purchase;
}

export async function updatePurchase(
  id: string,
  data: Partial<Purchase>
): Promise<Purchase> {
  return await prismaClient.purchase.update({
    where: { id },
    data,
  });
}

export async function getPurchases(
  options: PurchaseOptions = {}
): Promise<Purchase[]> {
  const where: Prisma.PurchaseWhereInput = {};

  if (options.userId) where.userId = options.userId;
  if (options.productId) where.productId = options.productId;
  if (options.status) where.status = options.status;
  if (options.startDate) where.createdAt = { gte: options.startDate };
  if (options.endDate) where.createdAt = { lte: options.endDate };

  return await prismaClient.purchase.findMany({
    where,
    include: {
      user: true,
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPurchase(id: string): Promise<Purchase | null> {
  return await prismaClient.purchase.findUnique({
    where: { id },
    include: {
      user: true,
      product: true,
    },
  });
}

export async function deletePurchase(id: string): Promise<void> {
  await prismaClient.purchase.delete({
    where: { id },
  });
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

export async function getPurchaseStats(productId: string): Promise<{
  totalPurchases: number;
  totalRevenue: number;
  averagePurchaseAmount: number;
  purchaseDistribution: Record<string, number>;
}> {
  const purchases = await prismaClient.purchase.findMany({
    where: { productId },
  });

  const totalPurchases = purchases.length;
  const totalRevenue = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
  const averagePurchaseAmount = totalRevenue / totalPurchases;

  const purchaseDistribution = purchases.reduce((acc, purchase) => {
    const date = purchase.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalPurchases,
    totalRevenue,
    averagePurchaseAmount,
    purchaseDistribution,
  };
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