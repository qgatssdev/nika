import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const UNPROTECTED_PATHS = ['/', '/auth/login', '/auth/sign-up'];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Skip static assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    /\.[^/]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const isAuthPath = pathname === '/auth/login' || pathname === '/auth/sign-up';
  const isUnprotectedPath = UNPROTECTED_PATHS.includes(pathname);

  const hasSession = Boolean(request.cookies.get('authSession')?.value);

  if (hasSession && isAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (!hasSession && !isUnprotectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    const returnUrl = pathname + (search || '');
    url.searchParams.set('returnUrl', returnUrl);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/(.*)'],
};
