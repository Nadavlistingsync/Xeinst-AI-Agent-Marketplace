import { prisma } from './db';
import { Prisma } from '@prisma/client';
import { Order } from './schema';

export interface CreateOrderInput {
  user_id: string;
  product_id: string;
  amount: number;
  status?: string;
  stripe_payment_intent_id?: string;
}

export async function createOrder(data: CreateOrderInput): Promise<Order> {
  try {
    return await prisma.order.create({
      data: {
        user_id: data.user_id,
        product_id: data.product_id,
        amount: new Prisma.Decimal(data.amount),
        status: data.status || 'pending',
        stripe_payment_intent_id: data.stripe_payment_intent_id,
        created_at: new Date(),
        updated_at: new Date(),
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
    stripe_payment_intent_id?: string;
  }
): Promise<Order> {
  try {
    const updateData: any = { ...data };
    if (data.amount !== undefined) {
      updateData.amount = new Prisma.Decimal(data.amount);
    }
    updateData.updated_at = new Date();

    return await prisma.order.update({
      where: { id },
      data: updateData,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    throw new Error('Failed to update order');
  }
}

export async function getOrders(options: {
  user_id?: string;
  product_id?: string;
  status?: string;
  start_date?: Date;
  end_date?: Date;
} = {}): Promise<Order[]> {
  try {
    const where: Prisma.OrderWhereInput = {};
    
    if (options.user_id) where.user_id = options.user_id;
    if (options.product_id) where.product_id = options.product_id;
    if (options.status) where.status = options.status;
    if (options.start_date) where.created_at = { gte: options.start_date };
    if (options.end_date) where.created_at = { lte: options.end_date };

    return await prisma.order.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    throw new Error('Failed to get orders');
  }
}

export async function getOrder(id: string): Promise<Order | null> {
  try {
    return await prisma.order.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error getting order:', error);
    throw new Error('Failed to get order');
  }
}

export async function deleteOrder(id: string): Promise<void> {
  try {
    await prisma.order.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    throw new Error('Failed to delete order');
  }
}

export async function getOrderStats(user_id: string) {
  try {
    const orders = await getOrders({ user_id });

    const total_orders = orders.length;
    const total_spent = orders.reduce((sum, order) => sum + Number(order.amount), 0);
    const status_distribution = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recent_orders = orders.slice(0, 5);

    return {
      total_orders,
      total_spent,
      status_distribution,
      recent_orders,
    };
  } catch (error) {
    console.error('Error getting order stats:', error);
    throw new Error('Failed to get order stats');
  }
}

export async function getOrderHistory(user_id: string) {
  try {
    const orders = await getOrders({ user_id });

    const monthly_orders = orders.reduce((acc, order) => {
      const month = order.created_at.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { total: 0, amount: 0 };
      }
      acc[month].total += 1;
      acc[month].amount += Number(order.amount);
      return acc;
    }, {} as Record<string, { total: number; amount: number }>);

    return {
      monthly_orders,
      recent_orders: orders.slice(0, 10),
    };
  } catch (error) {
    console.error('Error getting order history:', error);
    throw new Error('Failed to get order history');
  }
} 