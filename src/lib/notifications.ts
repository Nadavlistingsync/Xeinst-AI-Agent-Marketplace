import { db } from '@/lib/db';
import { notifications } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export type NotificationType = 
  | 'feedback_received'
  | 'negative_feedback'
  | 'agent_needs_review'
  | 'feedback_trend_alert';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  metadata = {},
}: CreateNotificationParams) {
  return db.insert(notifications).values({
    user_id: userId,
    type,
    title,
    message,
    metadata: JSON.stringify(metadata),
    is_read: false,
    created_at: new Date(),
  });
}

export async function getUnreadNotifications(userId: string) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.user_id, userId))
    .orderBy(notifications.created_at);
}

export async function markNotificationAsRead(notificationId: string) {
  return db
    .update(notifications)
    .set({ is_read: true })
    .where(eq(notifications.id, notificationId));
}

export async function markAllNotificationsAsRead(userId: string) {
  return db
    .update(notifications)
    .set({ is_read: true })
    .where(eq(notifications.user_id, userId));
}

export async function deleteNotification(notificationId: string) {
  return db
    .delete(notifications)
    .where(eq(notifications.id, notificationId));
}

export async function deleteAllNotifications(userId: string) {
  return db
    .delete(notifications)
    .where(eq(notifications.user_id, userId));
} 