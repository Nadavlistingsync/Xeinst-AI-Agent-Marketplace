import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createErrorResponse } from '../lib/api';
import { handleDatabaseError, DatabaseError, withRetry } from '../lib/db';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import * as Sentry from '@sentry/nextjs';

describe('Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createErrorResponse', () => {
    it('handles Zod validation errors', () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['name'],
          message: 'Expected string, received number'
        }
      ]);

      const response = createErrorResponse(zodError, 'Default error');
      expect(response.success).toBe(false);
      expect(response.status).toBe(400);
      expect(response.details).toBeDefined();
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('handles Prisma errors', () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.0.0',
        meta: { target: ['email'] }
      });

      const response = createErrorResponse(prismaError, 'Default error');
      expect(response.success).toBe(false);
      expect(response.status).toBe(409);
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('handles generic errors', () => {
      const error = new Error('Test error');
      const response = createErrorResponse(error, 'Default error');
      expect(response.success).toBe(false);
      expect(response.error).toBe('Test error');
      expect(response.status).toBe(500);
      expect(Sentry.captureException).not.toHaveBeenCalled();
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
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('handles record not found errors', () => {
      const error = new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '5.0.0'
      });

      expect(() => handleDatabaseError(error)).toThrow(DatabaseError);
      expect(() => handleDatabaseError(error)).toThrow('Record not found');
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('handles validation errors', () => {
      const error = new Prisma.PrismaClientValidationError('Validation error');
      expect(() => handleDatabaseError(error)).toThrow(DatabaseError);
      expect(() => handleDatabaseError(error)).toThrow('Validation error');
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
      const error = new Prisma.PrismaClientKnownRequestError('Connection error', {
        code: 'P1001',
        clientVersion: '5.0.0'
      });

      const operation = vi.fn().mockRejectedValue(error);

      const result = withRetry(operation);
      await vi.advanceTimersByTimeAsync(7000); // Advance past all retries
      await expect(result).rejects.toThrow(error);
      expect(operation).toHaveBeenCalledTimes(4); // Initial + 3 retries
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
}); 