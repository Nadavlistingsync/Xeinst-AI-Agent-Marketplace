import { prisma } from './db';
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
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity?: NotificationSeverity;
  metadata?: Record<string, any>;
}

export async function createNotification(data: CreateNotificationInput): Promise<Notification> {
  return await prisma.notification.create({
    data: {
      user_id: data.user_id,
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
  return await prisma.notification.update({
    where: { id },
    data: {
      ...data,
      metadata: data.metadata || {},
    },
  });
}

export async function getNotifications(
  user_id: string,
  options: {
    unread_only?: boolean;
    type?: NotificationType;
    limit?: number;
  } = {}
): Promise<Notification[]> {
  const where: any = { user_id };
  if (options.unread_only) where.read = false;
  if (options.type) where.type = options.type;

  return await prisma.notification.findMany({
    where,
    orderBy: { created_at: 'desc' },
    take: options.limit,
  });
}

export async function getNotification(id: string): Promise<Notification | null> {
  return await prisma.notification.findUnique({
    where: { id },
  });
}

export async function markNotificationAsRead(id: string): Promise<Notification> {
  return await prisma.notification.update({
    where: { id },
    data: { read: true },
  });
}

export async function markAllNotificationsAsRead(user_id: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { user_id, read: false },
    data: { read: true },
  });
}

export async function deleteNotification(id: string): Promise<void> {
  await prisma.notification.delete({
    where: { id },
  });
}

export async function deleteAllNotifications(user_id: string): Promise<void> {
  await prisma.notification.deleteMany({
    where: { user_id },
  });
}

export async function getNotificationCount(
  user_id: string,
  options: {
    unread_only?: boolean;
    type?: NotificationType;
  } = {}
): Promise<number> {
  const where: any = { user_id };
  if (options.unread_only) where.read = false;
  if (options.type) where.type = options.type;

  return await prisma.notification.count({ where });
}

export async function getNotificationStats(user_id: string): Promise<{
  total: number;
  unread: number;
  by_type: Record<NotificationType, number>;
}> {
  const [total, unread, byType] = await Promise.all([
    prisma.notification.count({ where: { user_id } }),
    prisma.notification.count({ where: { user_id, read: false } }),
    prisma.notification.groupBy({
      by: ['type'],
      where: { user_id },
      _count: true,
    }),
  ]);

  return {
    total,
    unread,
    by_type: byType.reduce((acc, { type, _count }) => {
      acc[type as NotificationType] = _count;
      return acc;
    }, {} as Record<NotificationType, number>),
  };
}

export async function getNotificationHistory(user_id: string) {
  try {
    const notifications = await getNotifications(user_id);

    const monthly_notifications = notifications.reduce((acc, notification) => {
      const month = notification.created_at.toISOString().slice(0, 7);
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
      monthly_notifications,
      recent_notifications: notifications.slice(0, 10),
    };
  } catch (error) {
    console.error('Error getting notification history:', error);
    throw new Error('Failed to get notification history');
  }
} 