import { PrismaClient, Prisma, Purchase } from '@prisma/client';

const prisma = new PrismaClient();

export type CreateOrderInput = {
  userId: string;
  productId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  stripeTransferId?: string | null;
};

export type UpdateOrderInput = {
  status?: 'pending' | 'completed' | 'failed';
  stripeTransferId?: string | null;
  paidAt?: Date | null;
};

export async function createOrder(data: CreateOrderInput) {
  return prisma.purchase.create({
    data: {
      userId: data.userId,
      productId: data.productId,
      amount: data.amount,
      status: data.status,
      stripeTransferId: data.stripeTransferId || null
    }
  });
}

export async function updateOrder(id: string, data: UpdateOrderInput) {
  return prisma.purchase.update({
    where: { id },
    data: {
      status: data.status,
      stripeTransferId: data.stripeTransferId || null,
      paidAt: data.paidAt || null
    }
  });
}

export async function getOrder(id: string) {
  return prisma.purchase.findUnique({
    where: { id },
    include: {
      user: true,
      product: true
    }
  });
}

export async function getUserOrders(userId: string) {
  return prisma.purchase.findMany({
    where: { userId },
    include: {
      product: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getOrders(options: {
  userId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
} = {}): Promise<Purchase[]> {
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