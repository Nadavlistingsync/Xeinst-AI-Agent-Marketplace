import { prisma } from '@/types/prisma';
import type { Purchase } from '@prisma/client';

interface CreateOrderInput {
  status: string;
  userId: string;
  productId: string;
  amount: number;
  stripeTransferId?: string;
  paidAt?: Date;
}

interface UpdateOrderInput {
  status?: string;
  stripeTransferId?: string;
  paidAt?: Date;
}

export async function createOrder(data: CreateOrderInput): Promise<Purchase> {
  return prisma.purchase.create({
    data: {
      status: data.status,
      userId: data.userId,
      productId: data.productId,
      amount: data.amount,
      stripeTransferId: data.stripeTransferId,
      paidAt: data.paidAt
    }
  });
}

export async function updateOrder(id: string, data: UpdateOrderInput): Promise<Purchase> {
  return prisma.purchase.update({
    where: { id },
    data
  });
}

export async function getOrder(id: string): Promise<Purchase | null> {
  return prisma.purchase.findUnique({
    where: { id }
  }).then(purchase => purchase ? { ...purchase, amount: Number(purchase.amount) } : null);
}

export async function getUserOrders(userId: string): Promise<Purchase[]> {
  return prisma.purchase.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  }).then(purchases => purchases.map(p => ({ ...p, amount: Number(p.amount) })));
}

export async function getOrders(): Promise<Purchase[]> {
  return prisma.purchase.findMany({
    orderBy: { createdAt: 'desc' }
  }).then(purchases => purchases.map(p => ({ ...p, amount: Number(p.amount) })));
}

export async function deleteOrder(id: string): Promise<Purchase> {
  return prisma.purchase.delete({
    where: { id }
  });
}

export async function getMonthlyOrderStats() {
  const orders = await prisma.purchase.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const monthlyStats = orders.reduce((acc: Record<string, { count: number; total: number }>, order) => {
    const month = order.createdAt.toISOString().slice(0, 7);
    if (!acc[month]) {
      acc[month] = { count: 0, total: 0 };
    }
    acc[month].count++;
    acc[month].total += Number(order.amount);
    return acc;
  }, {});

  return Object.entries(monthlyStats).map(([month, stats]) => ({
    month,
    count: stats.count,
    total: stats.total,
    average: stats.total / stats.count
  }));
}

export async function getPurchaseById(id: string): Promise<Purchase | null> {
  return prisma.purchase.findUnique({
    where: { id }
  }).then(purchase => purchase ? { ...purchase, amount: Number(purchase.amount) } : null);
}

export async function getPurchasesByUser(userId: string): Promise<Purchase[]> {
  return prisma.purchase.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  }).then(purchases => purchases.map(p => ({ ...p, amount: Number(p.amount) })));
}

export async function getPurchasesByProduct(productId: string): Promise<Purchase[]> {
  return prisma.purchase.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' }
  }).then(purchases => purchases.map(p => ({ ...p, amount: Number(p.amount) })));
} 