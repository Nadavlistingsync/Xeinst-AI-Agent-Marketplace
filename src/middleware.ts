import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { AppError } from './lib/error-handling';

// Create Redis instance with fallback
let redis: Redis | null = null;
try {
  redis = Redis.fromEnv();
} catch (error) {
  console.warn('Redis not configured for middleware rate limiting, using in-memory fallback');
}

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: '@upstash/ratelimit',
}) : null;

// Paths that should be rate limited
const RATE_LIMITED_PATHS = [
  '/api/reviews',
  '/api/auth',
  '/api/contact',
];

// Paths that should be validated
const VALIDATED_PATHS = [
  '/api/reviews',
  '/api/contact',
];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/signup');

  // Ensure we have a valid base URL
  const baseUrl = request.url || process.env.NEXTAUTH_URL || 'http://localhost:3000';

  // Allow public access to certain API routes
  const publicApiRoutes = ['/api/agents'];
  const isPublicApiRoute = publicApiRoutes.some(route => 
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route + '/')
  );

  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', baseUrl));
    }
    return NextResponse.next();
  }

  // Skip authentication for public API routes
  if (isPublicApiRoute) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL('/login', baseUrl);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle pricing page access
  if (request.nextUrl.pathname === '/pricing' && !token) {
    return NextResponse.redirect(new URL('/pricing', baseUrl));
  }

  const response = NextResponse.next();
  
  try {
    // Add security headers
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Check if the path should be rate limited
    if (ratelimit && RATE_LIMITED_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
      const ip = request.ip ?? '127.0.0.1';
      const { success, limit, reset, remaining } = await ratelimit.limit(
        `${ip}:${request.nextUrl.pathname}`
      );

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
    }

    // Validate request body for POST requests
    if (request.method === 'POST' && VALIDATED_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
      const contentType = request.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new AppError('Content-Type must be application/json', 400, 'INVALID_CONTENT_TYPE');
      }

      // Clone the request to read the body
      const clonedRequest = request.clone();
      try {
        await clonedRequest.json();
      } catch (error) {
        throw new AppError('Invalid JSON body', 400, 'INVALID_JSON');
      }
    }

    return response;
  } catch (error) {
    if (error instanceof AppError) {
      return new NextResponse(
        JSON.stringify({
          error: error.message,
          code: error.code,
        }),
        {
          status: error.status,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(response.headers),
          },
        }
      );
    }

    // Log unexpected errors
    console.error('Middleware error:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Internal server error',
        message: 'An unexpected error occurred',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(response.headers),
        },
      }
    );
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
    '/pricing',
    '/upload/:path*',

    '/checkout/:path*',
    '/api/:path*'
  ]
}; 