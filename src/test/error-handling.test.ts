import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createErrorResponse } from '@/lib/error-handling';
import { getResponseBody } from './test-utils';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

process.on('unhandledRejection', (_reason, _promise) => {
  // Suppress unhandled rejection warnings in tests
});

describe('Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createErrorResponse', () => {
    it('handles Zod validation errors', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      try {
        schema.parse({ name: 123, age: 'invalid' });
      } catch (error) {
        const response = createErrorResponse(error);
        const body = await getResponseBody(response);

        expect(response.status).toBe(400);
        expect(body.statusCode).toBe(400);
        expect(body.name).toBe('Validation error');
        expect(body.message).toBe('Invalid input');
        expect(body.details).toBeDefined();
      }
    });

    it('handles Prisma errors', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '1.0.0',
        meta: { target: ['email'] },
      });

      const response = createErrorResponse(prismaError);
      const body = await getResponseBody(response);

      expect(response.status).toBe(500);
      expect(body.statusCode).toBe(500);
      expect(body.name).toBe('Server error');
      expect(body.message).toBe('Unique constraint failed');
      expect(body.details).toEqual({ target: ['email'] });
    });

    it('handles generic errors', async () => {
      const error = new Error('Something went wrong');
      const response = createErrorResponse(error);
      const body = await getResponseBody(response);

      expect(response.status).toBe(500);
      expect(body.statusCode).toBe(500);
      expect(body.name).toBe('Server error');
      expect(body.message).toBe('Something went wrong');
      expect(body.details).toBeDefined();
    });
  });

  describe('should handle validation errors', () => {
    it('returns 400 for validation errors', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      try {
        schema.parse({ name: 123, age: 'invalid' });
      } catch (error) {
        const response = createErrorResponse(error);
        const body = await getResponseBody(response);

        expect(response.status).toBe(400);
        expect(body.statusCode).toBe(400);
        expect(body.name).toBe('Validation error');
      }
    });
  });

  describe('should handle database errors', () => {
    it('returns 500 for database errors', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Database error', {
        code: 'P2000',
        clientVersion: '1.0.0',
      });

      const response = createErrorResponse(prismaError);
      const body = await getResponseBody(response);

      expect(response.status).toBe(500);
      expect(body.statusCode).toBe(500);
      expect(body.name).toBe('Server error');
    });
  });

  describe('should handle unknown errors', () => {
    it('returns 500 for unknown errors', async () => {
      const error = new Error('Unknown error');
      const response = createErrorResponse(error);
      const body = await getResponseBody(response);

      expect(response.status).toBe(500);
      expect(body.statusCode).toBe(500);
      expect(body.name).toBe('Server error');
    });
  });
}); 