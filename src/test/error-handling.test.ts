import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createErrorResponse } from '@/lib/api';
import type { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

process.on('unhandledRejection', (_reason, _promise) => {
  // Suppress unhandled rejection warnings in tests
});

async function getResponseBody(response: any) {
  // NextResponse has a .json() method that returns a Promise
  return typeof response.json === 'function' ? await response.json() : response;
}

describe('Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createErrorResponse', () => {
    it('handles Zod validation errors', async () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['name'],
          message: 'Expected string, received number'
        }
      ]);

      const response = createErrorResponse(zodError);
      const body = await getResponseBody(response);
      expect(body.statusCode).toBe(400);
      expect(body.name).toBe('Validation error');
      expect(body.message).toBe('Invalid input data');
      expect(body.details).toBeDefined();
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('handles Prisma errors', async () => {
      const prismaError = new Error('Unique constraint failed') as Prisma.PrismaClientKnownRequestError;
      prismaError.code = 'P2002';
      prismaError.clientVersion = '5.0.0';
      prismaError.meta = { target: ['email'] };

      const response = createErrorResponse(prismaError);
      const body = await getResponseBody(response);
      expect(body.statusCode).toBe(400);
      expect(body.name).toBe('Database error');
      expect(body.message).toBe('Unique constraint failed');
      expect(body.details).toBeDefined();
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('handles generic errors', async () => {
      const error = new Error('Test error');
      const response = createErrorResponse(error);
      const body = await getResponseBody(response);
      expect(body.statusCode).toBe(500);
      expect(body.name).toBe('Server error');
      expect(body.message).toBe('Test error');
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });
  });

  it('should handle validation errors', async () => {
    const schema = z.object({
      name: z.string(),
      age: z.number()
    });

    try {
      schema.parse({ name: 123, age: 'invalid' });
    } catch (error) {
      const response = createErrorResponse(error);
      const body = await getResponseBody(response);
      expect(body.statusCode).toBe(400);
      expect(body.name).toBe('Validation error');
      expect(body.message).toBe('Invalid input data');
      expect(body.details).toBeDefined();
    }
  });

  it('should handle database errors', async () => {
    const error = new Error('Unique constraint violation');
    const response = createErrorResponse(error);
    const body = await getResponseBody(response);
    expect(body.statusCode).toBe(500);
    expect(body.name).toBe('Server error');
    expect(body.message).toBe('Unique constraint violation');
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it('should handle unknown errors', async () => {
    const response = createErrorResponse(null);
    const body = await getResponseBody(response);
    expect(body.statusCode).toBe(500);
    expect(body.name).toBe('Server error');
    expect(body.message).toBe('An unexpected error occurred');
  });
}); 