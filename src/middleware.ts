import { NextRequest, NextResponse } from 'next/server';
import { securityManager, validateRequest } from './lib/security-edge';

/**
 * Security Middleware
 * 
 * This middleware implements various security measures to protect the application
 * from unauthorized access, code theft, and malicious activities.
 * 
 * @copyright 2024 AI Agency Website. All rights reserved.
 */

export function middleware(request: NextRequest) {
  try {
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

    // Validate request integrity (with error handling)
    try {
      if (!validateRequest(request)) {
        return new NextResponse('Unauthorized', { 
          status: 401,
          headers: securityHeaders
        });
      }
    } catch (validationError) {
      // Log the error but don't block the request
      console.warn('Request validation failed:', validationError instanceof Error ? validationError.message : 'Unknown error');
    }

    // Block suspicious user agents (simplified)
    const userAgent = request.headers.get('user-agent') || '';
    const isBot = /bot|crawler|spider|scraper/i.test(userAgent);
    
    if (isBot && !pathname.startsWith('/api/') && !pathname.startsWith('/_next/')) {
      // Log suspicious activity
      console.warn('Bot detected:', userAgent, pathname);
      
      // Return a response with security headers but limited content
      return new NextResponse('Access Denied', { 
        status: 403,
        headers: securityHeaders
      });
    }

    // Basic rate limiting for API routes (simplified)
    if (pathname.startsWith('/api/')) {
      // Simple rate limiting check
      const rateLimit = request.headers.get('x-rate-limit') || '0';
      const currentLimit = parseInt(rateLimit);
      
      if (currentLimit > 1000) { // Very high limit to avoid blocking legitimate requests
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
      try {
        response.headers.set('X-Watermark', 'AI_AGENCY_2024');
        response.headers.set('X-Session-ID', securityManager.getSessionInfo().sessionId);
      } catch (sessionError) {
        // Log error but don't fail the request
        console.warn('Failed to set session headers:', sessionError instanceof Error ? sessionError.message : 'Unknown error');
      }
    }

    return response;
  } catch (error) {
    // Log the error and return a basic response
    console.error('Middleware error:', error instanceof Error ? error.message : 'Unknown error', request.nextUrl.pathname);
    
    // Return a basic response with security headers
    const response = new NextResponse('Internal Server Error', { status: 500 });
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    return response;
  }
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