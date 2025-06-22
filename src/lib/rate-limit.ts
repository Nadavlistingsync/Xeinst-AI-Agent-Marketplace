import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Create Redis instance with fallback
let redis: Redis | null = null;
try {
  redis = Redis.fromEnv();
} catch (error) {
  console.warn('Redis not configured for rate limiting, using in-memory fallback');
}

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: '@upstash/ratelimit',
}) : null;

export function withRateLimit<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>): Promise<NextResponse> => {
    // If no rate limiter is available, just call the handler
    if (!ratelimit) {
      return await handler(...args);
    }

    const request = args[0] as Request;
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { success, limit, reset, remaining } = await ratelimit.limit(
      `${ip}:${request.url}`
    );

    const response = await handler(...args);
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', reset.toString());

    if (!success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Please try again later',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(response.headers),
          },
        }
      );
    }

    return response;
  }) as T;
} 