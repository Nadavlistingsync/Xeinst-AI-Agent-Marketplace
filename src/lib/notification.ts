import { PrismaClient, Notification, NotificationType } from '../types/prisma';
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
  metadata?: Record<string, unknown>;
  read?: boolean;
}

interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byMonth: Record<string, number>;
}

export async function createNotification(
  prisma: PrismaClient,
  userId: string,
  type: NotificationType,
  message: string,
  metadata?: Record<string, unknown>
) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      message,
      metadata: metadata || {},
    },
  });
}

export async function updateNotification(id: string, data: UpdateNotificationInput) {
  return prismaClient.notification.update({
    where: { id },
    data: {
      type: data.type,
      message: data.message,
      metadata: data.metadata || {},
      read: data.read,
    },
  });
}

export async function getNotifications(prisma: PrismaClient, userId: string) {
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

export async function markNotificationAsRead(prisma: PrismaClient, id: string) {
  return prisma.notification.update({
    where: { id },
    data: { read: true },
  });
}

export async function markAllNotificationsAsRead(prisma: PrismaClient, userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function deleteNotification(prisma: PrismaClient, id: string) {
  return prisma.notification.delete({
    where: { id },
  });
}

export async function getNotificationStats(prisma: PrismaClient, userId: string): Promise<NotificationStats> {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return {
    total: notifications.length,
    unread: notifications.filter((n: Notification) => !n.read).length,
    byType: notifications.reduce((acc: Record<NotificationType, number>, notification: Notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {} as Record<NotificationType, number>),
    byMonth: notifications.reduce((acc: Record<string, number>, notification: Notification) => {
      const month = notification.createdAt.toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {}),
  };
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