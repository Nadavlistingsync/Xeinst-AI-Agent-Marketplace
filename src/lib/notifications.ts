import { prisma } from './db';
import { Notification, NotificationType } from '@prisma/client';

export interface CreateNotificationParams {
  type: NotificationType;
  userId: string;
  message: string;
  metadata?: Record<string, any>;
}

export async function createNotification(data: CreateNotificationParams): Promise<Notification> {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      message: data.message,
      metadata: data.metadata || {},
      read: false,
    },
  });
}

export async function getNotifications(
  userId: string,
  options: {
    unreadOnly?: boolean;
    limit?: number;
  } = {}
): Promise<Notification[]> {
  const { unreadOnly, limit } = options;

  return prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly ? { read: false } : {}),
    },
    orderBy: {
      createdAt: 'desc',
    },
    ...(limit ? { take: limit } : {}),
  });
}

export async function markNotificationAsRead(
  id: string
): Promise<Notification> {
  return prisma.notification.update({
    where: { id },
    data: { read: true },
  });
}

export async function markAllNotificationsAsRead(
  userId: string
): Promise<void> {
  await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: { read: true },
  });
}

export async function deleteNotification(id: string): Promise<Notification> {
  return prisma.notification.delete({
    where: { id },
  });
}

export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  return prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });
} 