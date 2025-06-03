import { PrismaClient, NotificationType, Prisma, Notification } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
import { prisma } from './db';

const prismaClient = new PrismaClient();

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  message: string;
  metadata?: Record<string, any>;
}

export interface UpdateNotificationInput {
  message?: string;
  type?: NotificationType;
  metadata?: Prisma.InputJsonValue;
  read?: boolean;
}

export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  message: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      message: data.message,
      metadata: data.metadata || Prisma.JsonNull,
      read: false,
    },
  });
}

export async function updateNotification(id: string, data: UpdateNotificationInput) {
  return prismaClient.notification.update({
    where: { id },
    data: {
      type: data.type,
      message: data.message,
      metadata: data.metadata || Prisma.JsonNull,
      read: data.read,
    },
  });
}

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getNotification(id: string) {
  return prismaClient.notification.findUnique({
    where: { id }
  });
}

export async function markNotificationAsRead(id: string) {
  return prisma.notification.update({
    where: { id },
    data: { read: true },
  });
}

export async function markAllAsRead(userId: string) {
  await prismaClient.notification.updateMany({
    where: { userId, read: false },
    data: { read: true }
  });
}

export async function deleteNotification(id: string) {
  return prisma.notification.delete({
    where: { id },
  });
}

export async function getNotificationStats(userId: string) {
  const notifications = await prismaClient.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    byType: notifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byMonth: notifications.reduce((acc, notification) => {
      const month = notification.createdAt.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { total: 0, unread: 0 };
      }
      acc[month].total += 1;
      if (!notification.read) {
        acc[month].unread += 1;
      }
      return acc;
    }, {} as Record<string, { total: number; unread: number }>)
  };

  return stats;
}

export async function getNotificationHistory(
  userId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<Notification[]> {
  const where: Prisma.NotificationWhereInput = { userId };

  if (options.startDate) where.createdAt = { gte: options.startDate };
  if (options.endDate) where.createdAt = { lte: options.endDate };

  return await prismaClient.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit
  });
} 