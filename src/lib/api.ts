import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ApiError, ApiResponse, ApiSuccess } from '../types/api';

export function createErrorResponse(error: unknown): NextResponse<ApiResponse<unknown>> {
  if (error instanceof ZodError) {
    return NextResponse.json({
      statusCode: 400,
      name: 'Validation error',
      message: 'Invalid input data',
      details: error.errors
    } as ApiError);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return NextResponse.json({
      statusCode: 400,
      name: 'Database error',
      message: error.message,
      details: error.meta
    } as ApiError);
  }

  if (error instanceof Error) {
    // Only log non-validation and non-database errors
    if (!(error instanceof ZodError) && !(error instanceof Prisma.PrismaClientKnownRequestError)) {
      console.error('API Error:', error);
    }
    return NextResponse.json({
      statusCode: 500,
      name: 'Server error',
      message: error.message
    } as ApiError);
  }

  // Log unknown errors
  console.error('Unknown API Error:', error);
  return NextResponse.json({
    statusCode: 500,
    name: 'Unknown error',
    message: 'An unexpected error occurred'
  } as ApiError);
}

export function createSuccessResponse<T>(data: T): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({
    statusCode: 200,
    name: 'Success',
    message: 'Operation completed successfully',
    data
  } as ApiSuccess<T>);
}

export function isApiError(response: ApiResponse<unknown>): response is ApiError {
  return response.statusCode >= 400;
}

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.statusCode < 400;
}

export async function handleError<T>(error: unknown): Promise<NextResponse<ApiResponse<T>>> {
  return createErrorResponse(error);
} 