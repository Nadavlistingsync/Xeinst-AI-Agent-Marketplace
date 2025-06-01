import { z } from 'zod';

export interface ApiError {
  success: false;
  error: string;
  details?: z.ZodError[];
  status?: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

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

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiValidationError extends ApiError {
  details: ValidationError[];
}

export type ApiValidationResponse<T> = ApiSuccess<T> | ApiValidationError; 