import prismaClient from './db';
import { Notification } from './schema';

export type NotificationType = 
  | 'feedback_alert'
  | 'rating_alert'
  | 'sentiment_alert'
  | 'rating_trend_alert'
  | 'agent_improvement_needed'
  | 'system_alert'
  | 'user_alert';

export type NotificationSeverity = 'info' | 'warning' | 'error' | 'success';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  severity?: NotificationSeverity;
  metadata?: Record<string, any>;
}

export async function createNotification(data: CreateNotificationInput): Promise<Notification> {
  return await prismaClient.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata || {},
      read: false,
    },
  });
}

export async function updateNotification(
  id: string,
  data: Partial<CreateNotificationInput>
): Promise<Notification> {
  return await prismaClient.notification.update({
    where: { id },
    data: {
      ...data,
      metadata: data.metadata || {},
    },
  });
}

export async function getNotifications(
  userId: string,
  options: {
    unreadOnly?: boolean;
    type?: NotificationType;
    limit?: number;
  } = {}
): Promise<Notification[]> {
  const where: any = { userId };
  if (options.unreadOnly) where.read = false;
  if (options.type) where.type = options.type;

  return await prismaClient.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  });
}

export async function getNotification(id: string): Promise<Notification | null> {
  return await prismaClient.notification.findUnique({
    where: { id },
  });
}

export async function markNotificationAsRead(id: string): Promise<Notification> {
  return await prismaClient.notification.update({
    where: { id },
    data: { read: true },
  });
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await prismaClient.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function deleteNotification(id: string): Promise<void> {
  await prismaClient.notification.delete({
    where: { id },
  });
}

export async function deleteAllNotifications(userId: string): Promise<void> {
  await prismaClient.notification.deleteMany({
    where: { userId },
  });
}

export async function getNotificationCount(
  userId: string,
  options: {
    unreadOnly?: boolean;
    type?: NotificationType;
  } = {}
): Promise<number> {
  const where: any = { userId };
  if (options.unreadOnly) where.read = false;
  if (options.type) where.type = options.type;

  return await prismaClient.notification.count({ where });
}

export async function getNotificationStats(userId: string): Promise<{
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
}> {
  const [total, unread, byType] = await Promise.all([
    prismaClient.notification.count({ where: { userId } }),
    prismaClient.notification.count({ where: { userId, read: false } }),
    prismaClient.notification.groupBy({
      by: ['type'],
      where: { userId },
      _count: true,
    }),
  ]);

  return {
    total,
    unread,
    byType: byType.reduce((acc, { type, _count }) => {
      acc[type as NotificationType] = _count;
      return acc;
    }, {} as Record<NotificationType, number>),
  };
}

export async function getNotificationHistory(userId: string) {
  try {
    const notifications = await getNotifications({ userId });

    const monthlyNotifications = notifications.reduce((acc, notification) => {
      const month = notification.createdAt.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { total: 0, unread: 0 };
      }
      acc[month].total += 1;
      if (!notification.read) {
        acc[month].unread += 1;
      }
      return acc;
    }, {} as Record<string, { total: number; unread: number }>);

    return {
      monthlyNotifications,
      recentNotifications: notifications.slice(0, 10),
    };
  } catch (error) {
    console.error('Error getting notification history:', error);
    throw new Error('Failed to get notification history');
  }
} 