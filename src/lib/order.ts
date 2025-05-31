import { Prisma } from '@prisma/client';
import prismaClient from './db';
import { Order } from './schema';

export interface CreateOrderInput {
  userId: string;
  productId: string;
  amount: number;
  status?: string;
  stripePaymentIntentId?: string;
}

export async function createOrder(data: CreateOrderInput): Promise<Order> {
  try {
    return await prismaClient.order.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        amount: new Prisma.Decimal(data.amount),
        status: data.status || 'pending',
        stripePaymentIntentId: data.stripePaymentIntentId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order');
  }
}

export async function updateOrder(
  id: string,
  data: {
    amount?: number;
    status?: string;
    stripePaymentIntentId?: string;
  }
): Promise<Order> {
  try {
    const updateData: any = { ...data };
    if (data.amount !== undefined) {
      updateData.amount = new Prisma.Decimal(data.amount);
    }
    updateData.updatedAt = new Date();

    return await prismaClient.order.update({
      where: { id },
      data: updateData,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    throw new Error('Failed to update order');
  }
}

export async function getOrders(options: {
  userId?: string;
  productId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
} = {}): Promise<Order[]> {
  try {
    const where: Prisma.OrderWhereInput = {};
    
    if (options.userId) where.userId = options.userId;
    if (options.productId) where.productId = options.productId;
    if (options.status) where.status = options.status;
    if (options.startDate) where.createdAt = { gte: options.startDate };
    if (options.endDate) where.createdAt = { lte: options.endDate };

    return await prismaClient.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    throw new Error('Failed to get orders');
  }
}

export async function getOrder(id: string): Promise<Order | null> {
  try {
    return await prismaClient.order.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error getting order:', error);
    throw new Error('Failed to get order');
  }
}

export async function deleteOrder(id: string): Promise<void> {
  try {
    await prismaClient.order.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    throw new Error('Failed to delete order');
  }
}

export async function getOrderStats(userId: string) {
  try {
    const orders = await getOrders({ userId });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.amount), 0);
    const statusDistribution = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentOrders = orders.slice(0, 5);

    return {
      totalOrders,
      totalSpent,
      statusDistribution,
      recentOrders,
    };
  } catch (error) {
    console.error('Error getting order stats:', error);
    throw new Error('Failed to get order stats');
  }
}

export async function getOrderHistory(userId: string) {
  try {
    const orders = await getOrders({ userId });

    const monthlyOrders = orders.reduce((acc, order) => {
      const month = order.createdAt.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { total: 0, amount: 0 };
      }
      acc[month].total += 1;
      acc[month].amount += Number(order.amount);
      return acc;
    }, {} as Record<string, { total: number; amount: number }>);

    return {
      monthlyOrders,
      recentOrders: orders.slice(0, 10),
    };
  } catch (error) {
    console.error('Error getting order history:', error);
    throw new Error('Failed to get order history');
  }
} 