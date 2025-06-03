import { NextResponse } from 'next/server';

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
      code: error.name
    };
  }

  if (typeof error === 'string') {
    return {
      message: error,
      status: 500
    };
  }

  return {
    message: 'An unexpected error occurred',
    status: 500
  };
}

export function createErrorResponse(error: unknown) {
  const errorResponse = handleApiError(error);
  return NextResponse.json(
    { error: errorResponse.message },
    { status: errorResponse.status }
  );
} 