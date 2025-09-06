import { NextRequest, NextResponse } from 'next/server';
import { 
  RateLimiter, 
  RequestSecurity, 
  AuditLogger, 
  SECURITY_HEADERS
} from '@/lib/security';

// Security middleware for enterprise-level protection
export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname } = request.nextUrl;
  
  // Skip security checks for static files and API health checks
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/api/health' ||
    pathname === '/api/status'
  ) {
    return NextResponse.next();
  }

  // Get client IP and user agent
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Rate limiting
  const rateLimitResult = RateLimiter.checkLimit(clientIP);
  if (!rateLimitResult.allowed) {
    AuditLogger.log('RATE_LIMIT_EXCEEDED', undefined, {
      ip: clientIP,
      userAgent,
      pathname,
    });
    
    return new NextResponse('Rate limit exceeded', {
      status: 429,
      headers: {
        'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
      },
    });
  }

  // Request security validation
  const securityValidation = RequestSecurity.validateRequest(request);
  if (!securityValidation.isValid) {
    AuditLogger.log('SUSPICIOUS_REQUEST', undefined, {
      ip: clientIP,
      userAgent,
      pathname,
      errors: securityValidation.errors,
    });
    
    return new NextResponse('Suspicious request detected', {
      status: 403,
    });
  }

  // Create response with security headers
  const response = NextResponse.next();
  
  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', '100');
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
  
  // Add request ID for tracking
  const requestId = generateRequestId();
  response.headers.set('X-Request-ID', requestId);
  
  // Log the request
  AuditLogger.log('REQUEST_PROCESSED', undefined, {
    ip: clientIP,
    userAgent,
    pathname,
    requestId,
    duration: Date.now() - startTime,
  });
  
  return response;
}

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return 'unknown';
}

// Helper function to generate request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};