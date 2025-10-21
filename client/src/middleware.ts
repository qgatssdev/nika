import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const UNPROTECTED_PATHS = ['/', '/auth/login', '/auth/sign-up'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isUnprotectedPath = UNPROTECTED_PATHS.includes(pathname);

  const raw = request.headers.get('cookie') || '';
  const hasSession = raw.includes('authSession=');

  if (!isUnprotectedPath && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/sign-in';
    url.searchParams.set(
      'returnUrl',
      encodeURIComponent(request.nextUrl.pathname)
    );
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/login', '/auth/sign-up', '/'],
};
