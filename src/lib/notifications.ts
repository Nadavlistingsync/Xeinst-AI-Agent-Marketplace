import prismaClient from './db';
import { Notification } from '@prisma/client';

export type NotificationType = 
  | 'feedback_alert'
  | 'rating_alert'
  | 'sentiment_alert'
  | 'rating_trend_alert'
  | 'agent_improvement_needed'
  | 'system_alert'
  | 'user_alert';

export interface CreateNotificationParams {
  type: NotificationType;
  user_id: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export async function createNotification(data: CreateNotificationParams): Promise<Notification> {
  return prismaClient.notification.create({
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

export async function getNotifications(
  user_id: string,
  options: {
    unreadOnly?: boolean;
    limit?: number;
  } = {}
): Promise<Notification[]> {
  const { unreadOnly, limit } = options;

  return prismaClient.notification.findMany({
    where: {
      user_id,
      ...(unreadOnly ? { read: false } : {}),
    },
    orderBy: {
      created_at: 'desc',
    },
    ...(limit ? { take: limit } : {}),
  });
}

export async function markNotificationAsRead(
  id: string
): Promise<Notification> {
  return prismaClient.notification.update({
    where: { id },
    data: { read: true },
  });
}

export async function markAllNotificationsAsRead(
  user_id: string
): Promise<void> {
  await prismaClient.notification.updateMany({
    where: {
      user_id,
      read: false,
    },
    data: { read: true },
  });
}

export async function deleteNotification(id: string): Promise<Notification> {
  return prismaClient.notification.delete({
    where: { id },
  });
}

export async function getUnreadNotificationCount(
  user_id: string
): Promise<number> {
  return prismaClient.notification.count({
    where: {
      user_id,
      read: false,
    },
  });
} 