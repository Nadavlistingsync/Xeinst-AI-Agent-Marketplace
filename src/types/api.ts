import { z } from 'zod';
import { DeploymentStatus, NotificationType } from '@prisma/client';

export interface ApiError {
  statusCode: number;
  name: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccess<T> {
  statusCode: number;
  name: string;
  message: string;
  data: T;
}

export type ApiResponse<T> = ApiError | ApiSuccess<T>;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  path: string;
}

export interface ValidationErrors {
  errors: ValidationError[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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

export const apiErrorSchema = z.object({
  statusCode: z.number(),
  name: z.string(),
  message: z.string(),
  details: z.unknown().optional()
});

export const apiSuccessSchema = <T extends z.ZodType>(dataSchema: T) => z.object({
  statusCode: z.number(),
  name: z.string(),
  message: z.string(),
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

export function createApiError(error: unknown, statusCode: number = 500): ApiError {
  if (error instanceof Error) {
    return {
      statusCode,
      name: error.name,
      message: error.message
    };
  }
  return {
    statusCode,
    name: 'Error',
    message: String(error)
  };
}

export function createValidationError(errors: ValidationError[]): ApiError {
  return {
    statusCode: 400,
    name: 'ValidationError',
    message: 'Validation failed',
    details: errors
  };
} 