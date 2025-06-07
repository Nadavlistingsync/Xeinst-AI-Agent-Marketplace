import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/signup');

  // Ensure we have a valid base URL
  const baseUrl = request.url || process.env.NEXTAUTH_URL || 'http://localhost:3000';

  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', baseUrl));
    }
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
    '/pricing',
    '/upload/:path*',
    '/deploy/:path*',
    '/checkout/:path*'
  ]
}; 