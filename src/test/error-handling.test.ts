import { describe, it, expect } from 'vitest';
import { createErrorResponse } from '../lib/error-handling';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

describe('Error Handling', () => {
  it('should handle Zod validation errors', async () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    try {
      schema.parse({ name: 123, age: 'invalid' });
    } catch (error) {
      const response = createErrorResponse(error);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        error: 'Validation Error',
        details: expect.any(Array),
      });
    }
  });

  it('should handle Prisma errors', async () => {
    const error = new Prisma.PrismaClientKnownRequestError('Database error', {
      code: 'P2002',
      clientVersion: '1.0.0',
    });

    const response = createErrorResponse(error);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toMatchObject({
      error: 'Database Error',
      message: 'Database error',
    });
  });

  it('should handle generic errors', async () => {
    const error = new Error('Something went wrong');
    const response = createErrorResponse(error);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toMatchObject({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  });
}); 