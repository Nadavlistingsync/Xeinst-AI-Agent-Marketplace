import { z } from 'zod';
import { DeploymentStatus, NotificationType } from '@prisma/client';

export type ApiSuccess<T> = {
  data: T;
};

export type ApiError = {
  error: string;
  details?: ValidationError[];
  status: number;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export interface FilterParams {
  userId?: string;
  productId?: string;
  agentId?: string;
  status?: string;
  type?: string;
  level?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export type ValidationError = {
  path: string;
  message: string;
};

export type ApiErrorResponse = {
  error: string;
  details?: ValidationError[];
  status: number;
};

export const apiErrorSchema = z.object({
  error: z.string(),
  details: z.array(z.object({
    path: z.string(),
    message: z.string()
  })).optional(),
  status: z.number().optional(),
});

export const apiSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema,
  });

export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.union([
    apiSuccessSchema(dataSchema),
    apiErrorSchema,
  ]);

export interface DeploymentStatusUpdate {
  deploymentId: string;
  status: DeploymentStatus;
  timestamp: Date;
}

export interface NotificationData {
  type: NotificationType;
  message: string;
  metadata?: Record<string, any>;
  userId?: string;
}

export interface FeedbackData {
  rating: number;
  comment?: string;
  categories?: Record<string, number>;
  sentimentScore?: number;
  metadata?: Record<string, any>;
}

export interface ReviewData {
  rating: number;
  comment: string;
  deploymentId: string;
  productId?: string;
}

export interface ProductData {
  name: string;
  description: string;
  fileUrl: string;
  price: number;
  category: string;
  tags: string[];
  version: string;
  environment: string;
  framework: string;
  modelType: string;
  earningsSplit: number;
  isPublic: boolean;
  longDescription?: string;
} 