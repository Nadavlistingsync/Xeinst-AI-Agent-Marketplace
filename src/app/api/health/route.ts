import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/error-handling';
import { db } from '@/lib/db';
import { cache } from '@/lib/cache';

export async function GET(): Promise<NextResponse> {
  return withErrorHandling(async () => {
    const startTime = Date.now();
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        cache: 'healthy',
      },
      metrics: {
        responseTime: 0,
      },
    };

    try {
      // Check database connection
      await db.getClient().$queryRaw`SELECT 1`;
    } catch (error) {
      health.services.database = 'unhealthy';
      health.status = 'degraded';
    }

    try {
      // Check cache connection
      await cache.set('health-check', 'ok', { ttl: 10 });
      const result = await cache.get('health-check');
      if (result !== 'ok') {
        throw new Error('Cache health check failed');
      }
    } catch (error) {
      health.services.cache = 'unhealthy';
      health.status = 'degraded';
    }

    health.metrics.responseTime = Date.now() - startTime;

    return NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503,
    });
  }, { endpoint: '/api/health', method: 'GET' });
} 