import { db } from '@/lib/db';
import { notifications } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export type NotificationType = 
  | 'feedback_received'
  | 'negative_feedback'
  | 'agent_needs_review'
  | 'feedback_trend_alert';

export interface CreateNotificationParams {
  type: string;
  userId: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export async function createNotification({
  type,
  userId,
  title,
  message,
  metadata,
}: CreateNotificationParams) {
  return db.insert(notifications).values({
    id: uuidv4(),
    type,
    userId,
    title,
    message,
    metadata: metadata || {},
    read: false,
    created_at: new Date(),
    updated_at: new Date(),
  });
}

export async function getNotifications(userId: string) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(notifications.created_at);
}

export async function markNotificationAsRead(id: string) {
  return db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.id, id));
}

export async function markAllNotificationsAsRead(userId: string) {
  return db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.userId, userId));
}

export async function deleteNotification(id: string) {
  return db
    .delete(notifications)
    .where(eq(notifications.id, id));
}

export async function deleteAllNotifications(userId: string) {
  return db
    .delete(notifications)
    .where(eq(notifications.userId, userId));
} 