import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/register');

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return null;
  }

  if (!isAuth) {
    let from = request.nextUrl.pathname;
    if (request.nextUrl.search) {
      from += request.nextUrl.search;
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', encodeURIComponent(from));
    return NextResponse.redirect(loginUrl);
  }

  // Check subscription tier for premium features
  const subscriptionTier = token.subscription_tier;
  const isPremiumRoute = request.nextUrl.pathname.startsWith('/premium');
  
  if (isPremiumRoute && subscriptionTier !== 'premium') {
    return NextResponse.redirect(new URL('/pricing', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
    '/premium/:path*',
    '/settings/:path*',
  ],
}; 