import { prisma } from './db';
import { Prisma } from '@prisma/client';

export interface Order {
  id: string;
  userId: string;
  productId: string;
  status: string;
  amount: number;
  stripeTransferId?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export async function createOrder(data: {
  userId: string;
  productId: string;
  amount: number;
  stripeTransferId?: string;
}): Promise<Order> {
  return await prisma.purchase.create({
    data: {
      userId: data.userId,
      productId: data.productId,
      amount: data.amount,
      stripeTransferId: data.stripeTransferId,
      status: 'pending'
    }
  });
}

export async function updateOrder(
  id: string,
  data: {
    status?: string;
    stripeTransferId?: string;
    paidAt?: Date;
  }
): Promise<Order> {
  return await prisma.purchase.update({
    where: { id },
    data
  });
}

export async function getOrders(options: {
  userId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
} = {}): Promise<Order[]> {
  const where: Prisma.PurchaseWhereInput = {};

  if (options.userId) where.userId = options.userId;
  if (options.status) where.status = options.status;
  if (options.startDate || options.endDate) {
    where.createdAt = {};
    if (options.startDate) where.createdAt.gte = options.startDate;
    if (options.endDate) where.createdAt.lte = options.endDate;
  }

  return await prisma.purchase.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
}

export async function getOrder(id: string): Promise<Order | null> {
  return await prisma.purchase.findUnique({
    where: { id }
  });
}

export async function deleteOrder(id: string): Promise<void> {
  await prisma.purchase.delete({
    where: { id }
  });
}

export async function getMonthlyOrderStats(userId: string): Promise<{
  month: string;
  total: number;
  count: number;
}[]> {
  const orders = await getOrders({ userId });
  const monthlyStats = new Map<string, { total: number; count: number }>();

  orders.forEach(order => {
    const month = order.createdAt.toISOString().slice(0, 7);
    const current = monthlyStats.get(month) || { total: 0, count: 0 };
    monthlyStats.set(month, {
      total: current.total + Number(order.amount),
      count: current.count + 1
    });
  });

  return Array.from(monthlyStats.entries()).map(([month, stats]) => ({
    month,
    ...stats
  }));
} 