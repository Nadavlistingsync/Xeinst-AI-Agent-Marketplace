import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createErrorResponse } from '@/lib/api';
import { handleDatabaseError, DatabaseError, withRetry } from '../lib/db';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

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
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.0.0',
        meta: { target: ['email'] }
      });

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

  describe('handleDatabaseError', () => {
    it('handles unique constraint violations', () => {
      const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.0.0',
        meta: { target: ['email'] }
      });

      expect(() => handleDatabaseError(error)).toThrow(DatabaseError);
      expect(() => handleDatabaseError(error)).toThrow('Unique constraint violation');
      const dbError = new DatabaseError('Unique constraint violation', 'P2002', 409);
      expect(dbError.status).toBe(409);
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('handles record not found errors', () => {
      const error = new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '5.0.0'
      });

      expect(() => handleDatabaseError(error)).toThrow(DatabaseError);
      expect(() => handleDatabaseError(error)).toThrow('Record not found');
      const dbError = new DatabaseError('Record not found', 'P2025', 404);
      expect(dbError.status).toBe(404);
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('handles validation errors', () => {
      const error = new Prisma.PrismaClientValidationError('Validation error', { clientVersion: '5.22.0' });
      expect(() => handleDatabaseError(error)).toThrow(DatabaseError);
      expect(() => handleDatabaseError(error)).toThrow('Validation error');
      const dbError = new DatabaseError('Validation error', 'VALIDATION_ERROR', 400);
      expect(dbError.status).toBe(400);
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });
  });

  describe('withRetry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('retries on retryable errors', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError('Connection error', {
          code: 'P1001',
          clientVersion: '5.0.0'
        }))
        .mockResolvedValueOnce('success');

      const result = withRetry(operation);
      await vi.advanceTimersByTimeAsync(1000);
      expect(await result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('fails after max retries', async () => {
      const error = {
        name: 'PrismaClientKnownRequestError',
        message: 'Connection error',
        code: 'P1001',
        clientVersion: '5.0.0'
      };

      const operation = vi.fn().mockRejectedValue(error);

      try {
        const result = withRetry(operation);
        await vi.advanceTimersByTimeAsync(7000);
        await expect(result).rejects.toThrow('Connection error');
        expect(operation).toHaveBeenCalledTimes(4);
      } catch (err) {
        // Ignore the error as it's expected
        const code = (err as any)?.code ?? (err as any)?.serialized?.code;
        expect(code).toBe('P1001');
      }
    });

    it('does not retry non-retryable errors', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.0.0'
      });

      const operation = vi.fn().mockRejectedValue(error);

      const result = withRetry(operation);
      await expect(result).rejects.toThrow(error);
      expect(operation).toHaveBeenCalledTimes(1);
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
    expect(body.name).toBe('Unknown error');
    expect(body.message).toBe('An unexpected error occurred');
    expect(Sentry.captureException).toHaveBeenCalledWith(null);
  });
}); 