import { z } from 'zod';
import { DeploymentStatus, NotificationType } from '@prisma/client';

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  details?: ValidationError[];
  status: number;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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
  search?: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ValidationError {
  path: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: ValidationError[];
  status: number;
}

export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string(),
  details: z.array(z.object({
    path: z.string(),
    message: z.string()
  })).optional(),
  status: z.number()
});

export const apiSuccessSchema = <T extends z.ZodType>(dataSchema: T) => z.object({
  success: z.literal(true),
  data: dataSchema
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

export const paginationSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const filterSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
}); 