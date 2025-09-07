import { NextRequest, NextResponse } from 'next/server';
import { securityManager, validateRequest } from '@/lib/security';

/**
 * Security Middleware
 * 
 * This middleware implements various security measures to protect the application
 * from unauthorized access, code theft, and malicious activities.
 * 
 * @copyright 2024 AI Agency Website. All rights reserved.
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Security headers
  const securityHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://vercel.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.vercel.com https://vitals.vercel-insights.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;",
    'X-Copyright': 'Copyright (c) 2024 AI Agency Website. All rights reserved.',
    'X-License': 'MIT with commercial restrictions',
    'X-Watermark': 'AI_AGENCY_2024'
  };

  // Validate request integrity
  if (!validateRequest(request)) {
    return new NextResponse('Unauthorized', { 
      status: 401,
      headers: securityHeaders
    });
  }

  // Block suspicious user agents
  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /wget/i,
    /curl/i,
    /python/i,
    /php/i
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  
  if (isSuspicious && !pathname.startsWith('/api/')) {
    // Log suspicious activity
    console.warn('🚨 Suspicious user agent detected:', userAgent);
    
    // Return a response with security headers but limited content
    return new NextResponse('Access Denied', { 
      status: 403,
      headers: securityHeaders
    });
  }

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `rate_limit_${ip}`;
    
    // Simple rate limiting (in production, use Redis or similar)
    const rateLimit = request.headers.get('x-rate-limit') || '0';
    const currentLimit = parseInt(rateLimit);
    
    if (currentLimit > 100) { // 100 requests per minute
      return new NextResponse('Rate limit exceeded', { 
        status: 429,
        headers: {
          ...securityHeaders,
          'Retry-After': '60'
        }
      });
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add watermark to HTML responses
  if (pathname === '/' || pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    response.headers.set('X-Watermark', 'AI_AGENCY_2024');
    response.headers.set('X-Session-ID', securityManager.getSessionInfo().sessionId);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};