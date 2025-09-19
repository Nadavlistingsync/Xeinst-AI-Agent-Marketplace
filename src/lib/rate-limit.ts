import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';
// Performance tracking removed for liquid design

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Skip counting successful requests
  skipFailedRequests?: boolean; // Skip counting failed requests
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
  handler?: (req: NextRequest) => NextResponse; // Custom handler for rate limit exceeded
  standardHeaders?: boolean; // Return rate limit info in headers
  legacyHeaders?: boolean; // Return rate limit info in legacy headers
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Timestamp when the limit resets
  retryAfter?: number; // Seconds to wait before retrying
}

class RateLimiter {
  private readonly config: RateLimitConfig;
  private readonly store = new Map<string, { count: number; resetTime: number }>();

  constructor(config: RateLimitConfig) {
    this.config = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      standardHeaders: true,
      legacyHeaders: false,
      ...config
    };
  }

  async checkRateLimit(req: NextRequest): Promise<{ allowed: boolean; info: RateLimitInfo }> {
    const key = this.getKey(req);
    const now = Date.now();
    
    // Get current rate limit data
    const current = this.store.get(key) || { count: 0, resetTime: now + this.config.windowMs };
    
    // Check if window has reset
    if (now > current.resetTime) {
      current.count = 0;
      current.resetTime = now + this.config.windowMs;
    }
      
      // Check if limit exceeded
      const allowed = current.count < this.config.maxRequests;
      
      // Increment count if request is allowed
      if (allowed) {
        current.count++;
        this.store.set(key, current);
      }
      
      // Store rate limit data in database for persistence
      await this.storeRateLimitData(key, current, allowed);
      
      const info: RateLimitInfo = {
        limit: this.config.maxRequests,
        remaining: Math.max(0, this.config.maxRequests - current.count),
        reset: current.resetTime,
        retryAfter: allowed ? undefined : Math.ceil((current.resetTime - now) / 1000)
      };
      
    return { allowed, info };
  }

  private getKey(req: NextRequest): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(req);
    }
    
    // Default key generator based on IP and user agent
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               req.ip || 
               'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const path = req.nextUrl.pathname;
    
    return `rate_limit:${ip}:${userAgent}:${path}`;
  }

  private async storeRateLimitData(key: string, _data: { count: number; resetTime: number }, allowed: boolean): Promise<void> {
    try {
      await prisma.rateLimitLog.create({
        data: {
          key,
          allowed,
          timestamp: new Date(),
        }
      });
    } catch (error) {
      // Don't fail the request if rate limit logging fails
      console.warn('Failed to log rate limit data:', error);
    }
  }

  createMiddleware() {
    return async (req: NextRequest): Promise<NextResponse | null> => {
      const { allowed, info } = await this.checkRateLimit(req);
      
      if (!allowed) {
        return this.handleRateLimitExceeded(req, info);
      }
      
      return null; // Continue with the request
    };
  }

  private handleRateLimitExceeded(req: NextRequest, info: RateLimitInfo): NextResponse {
    if (this.config.handler) {
      return this.config.handler(req);
    }
    
    const response = NextResponse.json(
      {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: info.retryAfter
      },
      { status: 429 }
    );
    
    // Add rate limit headers
    if (this.config.standardHeaders) {
      response.headers.set('X-RateLimit-Limit', info.limit.toString());
      response.headers.set('X-RateLimit-Remaining', info.remaining.toString());
      response.headers.set('X-RateLimit-Reset', info.reset.toString());
      if (info.retryAfter) {
        response.headers.set('Retry-After', info.retryAfter.toString());
      }
    }
    
    if (this.config.legacyHeaders) {
      response.headers.set('X-RateLimit-Limit', info.limit.toString());
      response.headers.set('X-RateLimit-Remaining', info.remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(info.reset).toISOString());
    }
    
    return response;
  }

  async getRateLimitStats(): Promise<{
    totalRequests: number;
    blockedRequests: number;
    topKeys: Array<{ key: string; count: number }>;
    recentBlocks: Array<{ key: string; timestamp: Date }>;
  }> {
    const [totalRequests, blockedRequests, topKeys, recentBlocks] = await Promise.all([
      prisma.rateLimitLog.count(),
      prisma.rateLimitLog.count({ where: { allowed: false } }),
      prisma.rateLimitLog.groupBy({
        by: ['key'],
        _count: { key: true },
        orderBy: { _count: { key: 'desc' } },
        take: 10
      }),
      prisma.rateLimitLog.findMany({
        where: { allowed: false },
        orderBy: { timestamp: 'desc' },
        take: 20,
        select: { key: true, timestamp: true }
      })
    ]);

    return {
      totalRequests,
      blockedRequests,
      topKeys: topKeys.map(k => ({ key: k.key, count: k._count.key })),
      recentBlocks: recentBlocks.map(b => ({
        key: b.key,
        timestamp: b.timestamp
      }))
    };
  }

  clearRateLimitData(): void {
    this.store.clear();
  }
}

// Pre-configured rate limiters for different endpoints
export const rateLimiters = {
  // General API rate limiting
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    standardHeaders: true,
    legacyHeaders: false
  }),

  // Authentication endpoints (more restrictive)
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    standardHeaders: true,
    legacyHeaders: false
  }),

  // File upload endpoints
  upload: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    standardHeaders: true,
    legacyHeaders: false
  }),

  // Agent deployment endpoints
  deployment: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    standardHeaders: true,
    legacyHeaders: false
  }),

  // Webhook endpoints (more permissive)
  webhook: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    standardHeaders: true,
    legacyHeaders: false
  })
};

// Rate limit middleware for specific user actions
export function createUserActionRateLimit(action: string) {
  return new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
    keyGenerator: (req) => {
      // Include user ID in the key if available
      const userId = req.headers.get('x-user-id');
      const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
      return `user_action:${action}:${userId || ip}`;
    },
    standardHeaders: true
  });
}

// Default rate limit function
export async function rateLimit(req: NextRequest): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await rateLimiters.api.checkRateLimit(req);
    return { success: result.allowed };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return { success: true }; // Allow request if rate limiting fails
  }
} 