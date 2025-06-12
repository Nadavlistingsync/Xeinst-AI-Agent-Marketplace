import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';
import type { Notification } from '@prisma/client';

interface CreateNotificationInput {
  type: NotificationType;
  message: string;
  userId: string;
  metadata?: Record<string, any>;
}

interface UpdateNotificationInput {
  type?: NotificationType;
  message?: string;
  read?: boolean;
  metadata?: Record<string, any>;
}

interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byMonth: Record<string, number>;
}

export async function createNotification(data: CreateNotificationInput): Promise<Notification> {
  return prisma.notification.create({
    data: {
      type: data.type,
      message: data.message,
      userId: data.userId,
      metadata: data.metadata || {}
    }
  });
}

export async function updateNotification(id: string, data: UpdateNotificationInput): Promise<Notification> {
  return prisma.notification.update({
    where: { id },
    data
  });
}

export async function getNotificationsByUser(userId: string): Promise<Notification[]> {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getNotification(id: string): Promise<Notification | null> {
  return prisma.notification.findUnique({
    where: { id }
  });
}

export async function markNotificationAsRead(id: string): Promise<Notification> {
  return prisma.notification.update({
    where: { id },
    data: { read: true }
  });
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true }
  });
}

export async function deleteNotification(id: string): Promise<Notification> {
  return prisma.notification.delete({
    where: { id }
  });
}

export async function getNotificationStats(userId: string): Promise<NotificationStats> {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  return {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    byType: notifications.reduce((acc: Record<NotificationType, number>, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {} as Record<NotificationType, number>),
    byMonth: notifications.reduce((acc: Record<string, number>, notification) => {
      const month = notification.createdAt.toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {})
  };
}

export async function getNotificationHistory(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  return notifications.map(notification => ({
    ...notification,
    createdAt: notification.createdAt.toISOString()
  }));
} 