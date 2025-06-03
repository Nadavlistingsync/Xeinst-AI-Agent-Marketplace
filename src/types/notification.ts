import { NotificationType } from '@prisma/client';
import { JsonValue } from './json';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  metadata: JsonValue;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
} 